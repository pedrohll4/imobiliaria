"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface LeadActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createLeadAction(
  prevState: LeadActionResult | null,
  formData: FormData
): Promise<LeadActionResult> {
  const propertyId = (formData.get("propertyId") as string) || null;
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

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string
): Promise<LeadActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  try {
    // Se for corretor, garantir que o lead pertence a ele
    if (session.role === "BROKER" && session.brokerId) {
      const existing = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { brokerId: true },
      });
      if (existing?.brokerId !== session.brokerId) {
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
