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
  const logoSubtitle = (formData.get("logoSubtitle") as string)?.trim() ?? "Imóveis Exclusivos";
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

  // Conteúdo Editorial e Frases da Home
  const heroBadge = (formData.get("heroBadge") as string)?.trim() || "Curadoria Imobiliária Exclusiva";
  const heroTitle = (formData.get("heroTitle") as string)?.trim() || "Encontre o imóvel que combina com a sua próxima história.";
  const heroSubtitle = (formData.get("heroSubtitle") as string)?.trim() || "Residências singulares, coberturas e refúgios contemporâneos selecionados com rigor arquitetônico e discrição inegociável.";
  const heroBgImage = (formData.get("heroBgImage") as string)?.trim() || null;

  const philosophyBadge = (formData.get("philosophyBadge") as string)?.trim() || "Nossa Filosofia";
  const philosophyTitle = (formData.get("philosophyTitle") as string)?.trim() || "A arquitetura como expressão máxima do bem-viver.";
  const philosophyText = (formData.get("philosophyText") as string)?.trim() || "Não comercializamos apenas metros quadrados. Representamos residências que inspiram, acolhem e valorizam o patrimônio das famílias mais exigentes com curadoria cirúrgica.";

  const featuredTitle = (formData.get("featuredTitle") as string)?.trim() || "Imóveis Selecionados";
  const featuredSubtitle = (formData.get("featuredSubtitle") as string)?.trim() || "Coleção de residências notáveis que transcendem o convencional pela localização privilegiada e excelência construtiva.";

  // Conteúdo da Página Sobre
  const aboutTitle = (formData.get("aboutTitle") as string)?.trim() || "A Arte de Viver com Distinção";
  const aboutSubtitle = (formData.get("aboutSubtitle") as string)?.trim() || "Fundada sob a premissa de que uma residência transcende paredes e metragem: ela é o cenário onde vidas extraordinárias se desenrolam.";
  const aboutHistoryTitle = (formData.get("aboutHistoryTitle") as string)?.trim() || "Curadoria Imobiliária Inspirada na Alta Arquitetura";
  const aboutHistoryText1 = (formData.get("aboutHistoryText1") as string)?.trim() || "";
  const aboutHistoryText2 = (formData.get("aboutHistoryText2") as string)?.trim() || "";
  const aboutImage = (formData.get("aboutImage") as string)?.trim() || null;

  // Personalização do Rodapé
  const footerTitle = (formData.get("footerTitle") as string)?.trim() || name;
  const footerText = (formData.get("footerText") as string)?.trim() || "Intermediação e curadoria de imóveis singulares, residências assinadas e investimentos imobiliários com discrição e sofisticação incomparáveis.";

  if (whatsapp && !whatsapp.startsWith("55")) {
    whatsapp = `55${whatsapp}`;
  }

  try {
    const dataToSave = {
      name,
      tagline,
      logoText,
      logoUrl,
      logoSubtitle,
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
      heroBadge,
      heroTitle,
      heroSubtitle,
      heroBgImage,
      philosophyBadge,
      philosophyTitle,
      philosophyText,
      featuredTitle,
      featuredSubtitle,
      aboutTitle,
      aboutSubtitle,
      aboutHistoryTitle,
      aboutHistoryText1,
      aboutHistoryText2,
      aboutImage,
      footerTitle,
      footerText,
    };

    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: dataToSave,
      create: {
        id: "default",
        ...dataToSave,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/configuracoes");
    revalidatePath("/contato");
    revalidatePath("/sobre");
    revalidatePath("/imoveis");
    revalidatePath("/corretores");

    return {
      success: true,
      message: "Todas as configurações, textos e imagens do site foram atualizados com sucesso!",
    };
  } catch (err: any) {
    console.error("Erro ao atualizar configurações:", err);
    return {
      success: false,
      error: err?.message || "Erro ao salvar configurações.",
    };
  }
}
