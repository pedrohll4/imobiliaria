"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export interface LeadActionResult {
  success: boolean;
  message?: string;
  error?: string;
  whatsappUrl?: string;
}

// Rate limiting em memória para submissão pública de leads
const leadSubmissions = new Map<string, number[]>();
function checkLeadRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutos
  const maxSubmissions = 4;

  const timestamps = (leadSubmissions.get(identifier) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxSubmissions) {
    return true; // Excedeu o limite
  }

  timestamps.push(now);
  leadSubmissions.set(identifier, timestamps);
  return false;
}

export async function createLeadAction(
  prevState: LeadActionResult | null,
  formData: FormData
): Promise<LeadActionResult> {
  // 1. Verificação Honeypot (campo armadilha invisível preenchido por robôs)
  const honeypot = (formData.get("website_hp") as string)?.trim();
  if (honeypot) {
    return {
      success: true,
      message: "Sua solicitação foi recebida com sucesso. Nosso especialista entrará em contato em breve.",
    };
  }

  const propertyId = (formData.get("propertyId") as string)?.trim() || null;
  const name = (formData.get("name") as string)?.trim();
  const rawEmail = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const phone = (formData.get("phone") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || "";
  const source = (formData.get("source") as string)?.trim() || "PORTAL";

  if (!name || !phone) {
    return {
      success: false,
      error: "Por favor, informe seu nome e telefone/WhatsApp para contato.",
    };
  }

  // Validação de comprimento para evitar ataques de DoS com payloads gigantes
  if (name.length > 150) {
    return { success: false, error: "Nome muito extenso." };
  }

  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 16) {
    return { success: false, error: "Número de telefone/WhatsApp inválido." };
  }

  // E-mail: se não informado pelo cliente no fluxo rápido de WhatsApp, cria fallback válido
  let validEmail = rawEmail;
  if (!validEmail) {
    validEmail = `${digitsOnly}@lead.whatsapp.com`;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(validEmail) || validEmail.length > 150) {
      return { success: false, error: "E-mail inválido." };
    }
  }

  if (message.length > 3000) {
    return { success: false, error: "A mensagem excede o limite máximo permitido." };
  }

  // 2. Rate limiting por e-mail ou telefone
  if (checkLeadRateLimit(validEmail) || checkLeadRateLimit(digitsOnly)) {
    return {
      success: false,
      error: "Muitas tentativas recentemente. Por favor, aguarde alguns minutos antes de enviar novamente.",
    };
  }

  try {
    let brokerId: string | null = null;
    let brokerWhatsApp: string | null = null;
    let brokerName: string | null = null;
    let propertyTitle: string = "Imóvel de Alto Padrão";
    let propertyCode: string = "";

    if (propertyId) {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          title: true,
          code: true,
          brokerId: true,
          broker: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
            },
          },
        },
      });

      if (prop) {
        brokerId = prop.brokerId || null;
        propertyTitle = prop.title;
        propertyCode = prop.code;
        if (prop.broker?.whatsapp) {
          brokerWhatsApp = prop.broker.whatsapp.replace(/\D/g, "");
          brokerName = prop.broker.name;
        }
      }
    }

    // Se o imóvel não tiver corretor exclusivo ou o corretor não tiver WhatsApp cadastrado, usa o da empresa
    if (!brokerWhatsApp) {
      try {
        const settings = await getSiteSettings();
        if (settings?.whatsapp) {
          brokerWhatsApp = settings.whatsapp.replace(/\D/g, "");
        }
      } catch (e) {
        console.error("Erro ao carregar configurações de WhatsApp:", e);
      }
    }

    if (!brokerWhatsApp) {
      brokerWhatsApp = "5569999999999";
    } else if (!brokerWhatsApp.startsWith("55")) {
      brokerWhatsApp = `55${brokerWhatsApp}`;
    }

    // Grava o lead no banco de dados com vínculo de corretor e imóvel
    await prisma.lead.create({
      data: {
        propertyId,
        brokerId,
        name,
        email: validEmail,
        phone,
        message,
        status: "NOVO",
        source,
      },
    });

    // Monta a mensagem pré-formatada para iniciar a conversa no WhatsApp
    const greetingHeader = brokerName ? `Olá ${brokerName}!` : "Olá!";
    const propRef = propertyCode
      ? ` referente ao imóvel "${propertyTitle}" (Cód. ${propertyCode})`
      : "";
    const extraMsg = message ? ` ${message}` : ` Gostaria de receber mais detalhes e atendimento.`;
    const fullWaText = `${greetingHeader} Meu nome é ${name} (${phone}). Tenho interesse${propRef}.${extraMsg}`;
    const whatsappUrl = `https://wa.me/${brokerWhatsApp}?text=${encodeURIComponent(fullWaText)}`;

    if (propertyId) {
      revalidatePath(`/imoveis/${propertyId}`);
    }
    revalidatePath("/dashboard/leads");
    revalidatePath("/admin/leads");

    return {
      success: true,
      message: "Lead registrado com sucesso! Redirecionando para a conversa no WhatsApp...",
      whatsappUrl,
    };
  } catch (err) {
    console.error("Erro ao registrar lead:", err);
    return {
      success: false,
      error: "Não foi possível registrar seu contato no momento. Tente novamente mais tarde.",
    };
  }
}

const ALLOWED_LEAD_STATUSES = [
  "NOVO",
  "EM_ATENDIMENTO",
  "VISITA_AGENDADA",
  "PROPOSTA",
  "FECHADO",
  "PERDIDO",
];

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string
): Promise<LeadActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  if (!ALLOWED_LEAD_STATUSES.includes(newStatus)) {
    return { success: false, error: "Status inválido." };
  }

  try {
    // Se for corretor, garantir estritamente que o lead pertence a ele
    if (session.role === "BROKER") {
      if (!session.brokerId) {
        return { success: false, error: "Acesso negado: Perfil de corretor não localizado." };
      }

      const existing = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { brokerId: true },
      });

      if (!existing || existing.brokerId !== session.brokerId) {
        return { success: false, error: "Acesso negado a este atendimento." };
      }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/admin/leads");

    return { success: true, message: "Status atualizado com sucesso." };
  } catch (err) {
    console.error("Erro ao atualizar status do lead:", err);
    return { success: false, error: "Erro ao atualizar status." };
  }
}

export async function saveLeadCurationAction(
  leadId: string,
  propertyIds: string[],
  notes?: string
): Promise<LeadActionResult & { shareUrl?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  try {
    const existing = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { brokerId: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Lead não encontrado." };
    }

    if (session.role === "BROKER") {
      if (!session.brokerId || existing.brokerId !== session.brokerId) {
        return { success: false, error: "Acesso negado a este atendimento." };
      }
    }

    const updatedStatus = existing.status === "NOVO" ? "PROPOSTA" : existing.status;

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        curatedPropertyIds: JSON.stringify(propertyIds),
        curatedNotes: notes?.trim() || null,
        status: updatedStatus,
      },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/admin/leads");
    revalidatePath(`/curadoria/${leadId}`);

    return {
      success: true,
      message: "Curadoria de imóveis salva com sucesso!",
      shareUrl: `/curadoria/${leadId}`,
    };
  } catch (err) {
    console.error("Erro ao salvar curadoria de imóveis:", err);
    return { success: false, error: "Erro ao salvar seleção de imóveis." };
  }
}
