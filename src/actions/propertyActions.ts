"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteImagesFromSupabase } from "@/lib/supabase";

export interface PropertyActionResult {
  success: boolean;
  message?: string;
  error?: string;
  propertyId?: string;
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

  // Determinar corretor responsável
  let brokerId = session.brokerId || null;
  if (session.role === "ADMIN" && formData.get("assignedBrokerId")) {
    brokerId = formData.get("assignedBrokerId") as string;
  }

  if (!title || !description || !type || !purpose || price <= 0 || !city || !state || !neighborhood) {
    return { success: false, error: "Por favor, preencha todos os campos obrigatórios com valores válidos." };
  }

  try {
    const code = customCode || `IMV-${Math.floor(1000 + Math.random() * 9000)}`;
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
      return { success: false, error: "Você não tem permissão para excluir este imóvel." };
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
