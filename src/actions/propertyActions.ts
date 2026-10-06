"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteImagesFromSupabase } from "@/lib/supabase";
import { getNextPropertyCode } from "@/lib/propertyCode";

export interface PropertyActionResult {
  success: boolean;
  message?: string;
  error?: string;
  propertyId?: string;
}

export async function getNextPropertyCodeAction(): Promise<string> {
  return await getNextPropertyCode();
}

export async function createPropertyAction(
  prevState: PropertyActionResult | null,
  formData: FormData
): Promise<PropertyActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Apenas usuários autorizados podem cadastrar imóveis." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const purpose = (formData.get("purpose") as string)?.trim();
  const price = parseFloat(formData.get("price") as string) || 0;
  const condoFee = parseFloat(formData.get("condoFee") as string) || null;
  const propertyTax = parseFloat(formData.get("propertyTax") as string) || null;
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const neighborhood = (formData.get("neighborhood") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const number = (formData.get("number") as string)?.trim() || null;
  const zipCode = (formData.get("zipCode") as string)?.trim() || null;
  
  const bedrooms = parseInt(formData.get("bedrooms") as string) || 0;
  const suites = parseInt(formData.get("suites") as string) || 0;
  const bathrooms = parseInt(formData.get("bathrooms") as string) || 0;
  const parkingSpaces = parseInt(formData.get("parkingSpaces") as string) || 0;
  const builtArea = parseFloat(formData.get("builtArea") as string) || 0;
  const totalArea = parseFloat(formData.get("totalArea") as string) || builtArea;

  const status = (formData.get("status") as string) || "PUBLICADO";
  const customCode = (formData.get("code") as string)?.trim();
  const rawImages = (formData.get("imagesList") as string)?.trim() || "";
  const rawFeatures = (formData.get("featuresList") as string)?.trim() || "";

  // Determinar corretor responsável e permissão de delegação
  let brokerId = session.brokerId || null;

  let canAssignBroker = session.role === "ADMIN";
  if (!canAssignBroker && session.brokerId) {
    const brokerRec = await prisma.broker.findUnique({
      where: { id: session.brokerId },
      select: { canAssignBroker: true },
    });
    canAssignBroker = !!brokerRec?.canAssignBroker;
  }

  if (canAssignBroker && formData.has("assignedBrokerId")) {
    const assigned = (formData.get("assignedBrokerId") as string)?.trim();
    if (!assigned || assigned === "NONE" || assigned === "null") {
      brokerId = null; // Imobiliária geral / sem corretor exclusivo
    } else {
      brokerId = assigned;
    }
  }

  if (!title || !description || !type || !purpose || price <= 0 || !city || !state || !neighborhood) {
    return { success: false, error: "Por favor, preencha todos os campos obrigatórios com valores válidos." };
  }

  try {
    let code = customCode;
    if (!code) {
      code = await getNextPropertyCode();
    } else {
      const exists = await prisma.property.findUnique({
        where: { code },
        select: { id: true },
      });
      if (exists) {
        code = await getNextPropertyCode();
      }
    }
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // Processar imagens (separadas por linha ou vírgula)
    const imageLines = rawImages
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.startsWith("http") || url.startsWith("/"));

    const imagesToCreate = imageLines.length > 0
      ? imageLines.map((url, index) => ({
          url,
          isMain: index === 0,
          order: index + 1,
          alt: `${title} - Imagem ${index + 1}`,
        }))
      : [
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
            isMain: true,
            order: 1,
            alt: title,
          },
        ];

    // Processar características
    const featureLines = rawFeatures
      .split(/[\n,]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const featuresToCreate = featureLines.map((name) => ({
      name,
      category: "Diferenciais",
    }));

    const created = await prisma.property.create({
      data: {
        code,
        title,
        slug,
        description,
        type,
        purpose,
        price,
        condoFee,
        propertyTax,
        city,
        state,
        neighborhood,
        address,
        number,
        zipCode,
        bedrooms,
        suites,
        bathrooms,
        parkingSpaces,
        builtArea,
        totalArea,
        status,
        brokerId,
        images: {
          create: imagesToCreate,
        },
        features: {
          create: featuresToCreate,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath("/dashboard/imoveis");
    revalidatePath("/admin/imoveis");

    return {
      success: true,
      message: "Imóvel cadastrado com sucesso!",
      propertyId: created.id,
    };
  } catch (err) {
    console.error("Erro ao cadastrar imóvel:", err);
    return { success: false, error: "Erro ao cadastrar o imóvel. Tente novamente." };
  }
}

export async function deletePropertyAction(propertyId: string): Promise<PropertyActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  try {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        brokerId: true,
        images: {
          select: { url: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Imóvel não encontrado." };
    }

    if (session.role === "BROKER" && existing.brokerId !== session.brokerId) {
      let canManageTeam = false;
      if (session.brokerId) {
        const b = await prisma.broker.findUnique({
          where: { id: session.brokerId },
          select: { canAssignBroker: true },
        });
        canManageTeam = !!b?.canAssignBroker;
      }

      if (!canManageTeam) {
        return { success: false, error: "Você não tem permissão para excluir este imóvel." };
      }
    }

    // Coleta URLs das fotos antes de excluir no banco
    const imageUrls = existing.images.map((img) => img.url);

    await prisma.property.delete({
      where: { id: propertyId },
    });

    // Limpeza assíncrona no Supabase Storage para não deixar arquivos órfãos ocupando cota
    if (imageUrls.length > 0) {
      deleteImagesFromSupabase(imageUrls).catch((e) =>
        console.error("Falha ao remover fotos do Supabase Storage:", e)
      );
    }

    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath("/dashboard/imoveis");
    revalidatePath("/admin/imoveis");

    return { success: true, message: "Imóvel removido com sucesso." };
  } catch (err) {
    console.error("Erro ao excluir imóvel:", err);
    return { success: false, error: "Falha ao excluir imóvel." };
  }
}

export async function reassignPropertyBrokerAction(
  propertyId: string,
  assignedBrokerId: string | null
): Promise<PropertyActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  let canAssign = session.role === "ADMIN";
  if (!canAssign && session.brokerId) {
    const b = await prisma.broker.findUnique({
      where: { id: session.brokerId },
      select: { canAssignBroker: true },
    });
    canAssign = !!b?.canAssignBroker;
  }

  if (!canAssign) {
    return { success: false, error: "Você não tem permissão para alterar a titularidade do imóvel." };
  }

  try {
    const targetBrokerId =
      assignedBrokerId && assignedBrokerId !== "NONE" && assignedBrokerId !== "null"
        ? assignedBrokerId
        : null;

    await prisma.property.update({
      where: { id: propertyId },
      data: { brokerId: targetBrokerId },
    });

    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath(`/imoveis/${propertyId}`);
    revalidatePath("/dashboard/imoveis");
    revalidatePath("/admin/imoveis");

    return { success: true, message: "Corretor responsável atualizado com sucesso." };
  } catch (err) {
    console.error("Erro ao reatribuir corretor:", err);
    return { success: false, error: "Falha ao atualizar corretor do imóvel." };
  }
}

export async function togglePropertyFeaturedAction(propertyId: string): Promise<PropertyActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem gerenciar destaques." };
  }

  try {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { isFeatured: true },
    });

    if (!existing) {
      return { success: false, error: "Imóvel não encontrado." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { isFeatured: !existing.isFeatured },
    });

    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath("/admin/imoveis");

    return { success: true, message: "Destaque atualizado com sucesso." };
  } catch (err) {
    console.error("Erro ao alternar destaque:", err);
    return { success: false, error: "Falha ao alterar destaque." };
  }
}
