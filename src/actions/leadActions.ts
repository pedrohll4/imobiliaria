"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface LeadActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Rate limiting em memória para submissão pública de leads
const leadSubmissions = new Map<string, number[]>();
function checkLeadRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutos
  const maxSubmissions = 3;

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
    // Se o bot preencheu o honeypot, finge sucesso mas descarta a gravação
    return {
      success: true,
      message: "Sua solicitação foi recebida com sucesso. Nosso especialista entrará em contato em breve.",
    };
  }

  const propertyId = (formData.get("propertyId") as string)?.trim() || null;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || "";

  if (!name || !email || !phone) {
    return {
      success: false,
      error: "Por favor, preencha seu nome, e-mail e telefone para contato.",
    };
  }

  // Validação de comprimento para evitar ataques de DoS com payloads gigantes
  if (name.length > 150) {
    return { success: false, error: "Nome muito longo." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 150) {
    return { success: false, error: "E-mail inválido." };
  }

  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 16) {
    return { success: false, error: "Número de telefone inválido." };
  }

  if (message.length > 3000) {
    return { success: false, error: "A mensagem excede o limite máximo permitido." };
  }

  // 2. Rate limiting por e-mail ou telefone
  if (checkLeadRateLimit(email) || checkLeadRateLimit(digitsOnly)) {
    return {
      success: false,
      error: "Muitas mensagens enviadas recentemente. Por favor, aguarde alguns minutos antes de tentar novamente.",
    };
  }

  try {
    let brokerId: string | null = null;

    if (propertyId) {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { brokerId: true },
      });
      brokerId = prop?.brokerId || null;
    }

    await prisma.lead.create({
      data: {
        propertyId,
        brokerId,
        name,
        email,
        phone,
        message,
        status: "NOVO",
        source: "PORTAL",
      },
    });

    if (propertyId) {
      revalidatePath(`/imoveis/${propertyId}`);
    }
    revalidatePath("/dashboard/leads");
    revalidatePath("/admin/leads");

    return {
      success: true,
      message: "Sua solicitação foi recebida com sucesso. Nosso especialista entrará em contato em breve.",
    };
  } catch (err) {
    console.error("Erro ao registrar lead:", err);
    return {
      success: false,
      error: "Não foi possível enviar sua mensagem no momento. Tente novamente mais tarde.",
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
