"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SettingActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateSiteSettingsAction(
  prevState: SettingActionResult | null,
  formData: FormData
): Promise<SettingActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem alterar configurações da imobiliária." };
  }

  const name = (formData.get("name") as string)?.trim() || "Sua Imobiliária";
  const tagline = (formData.get("tagline") as string)?.trim() || "Residências e Empreendimentos de Alto Padrão";
  const logoText = (formData.get("logoText") as string)?.trim() || "IMV";
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || "";
  let whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "") || "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const creciJ = (formData.get("creciJ") as string)?.trim() || "";
  const street = (formData.get("street") as string)?.trim() || "";
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const state = (formData.get("state") as string)?.trim() || "";
  const zipCode = (formData.get("zipCode") as string)?.trim() || "";
  const instagram = (formData.get("instagram") as string)?.trim() || "";

  if (whatsapp && !whatsapp.startsWith("55")) {
    whatsapp = `55${whatsapp}`;
  }

  try {
    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        name,
        tagline,
        logoText,
        logoUrl,
        phone,
        whatsapp,
        email,
        creciJ,
        street,
        neighborhood,
        city,
        state,
        zipCode,
        instagram,
      },
      create: {
        id: "default",
        name,
        tagline,
        logoText,
        logoUrl,
        phone,
        whatsapp,
        email,
        creciJ,
        street,
        neighborhood,
        city,
        state,
        zipCode,
        instagram,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/configuracoes");
    revalidatePath("/contato");
    revalidatePath("/sobre");
    revalidatePath("/imoveis");

    return {
      success: true,
      message: "Configurações da imobiliária salvas e atualizadas com sucesso em todo o site!",
    };
  } catch (err: any) {
    console.error("Erro ao atualizar configurações:", err);
    return {
      success: false,
      error: err?.message || "Erro ao salvar configurações.",
    };
  }
}
