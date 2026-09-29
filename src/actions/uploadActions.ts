"use server";

import { getSession } from "@/lib/auth";
import { uploadImageToSupabase } from "@/lib/supabase";

export interface UploadActionResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadPropertyImageAction(
  formData: FormData
): Promise<UploadActionResult> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Você precisa estar autenticado para enviar imagens.",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return {
      success: false,
      error: "Nenhum arquivo enviado.",
    };
  }

  const allowedMimeTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      success: false,
      error: "Formato de arquivo inválido. Use WebP, JPG ou PNG.",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Arquivo muito grande. O limite máximo é de 10 MB.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await uploadImageToSupabase(
      buffer,
      file.name || "imovel.webp",
      file.type || "image/webp",
      "properties"
    );
  } catch (err: any) {
    console.error("Erro no uploadPropertyImageAction:", err);
    return {
      success: false,
      error: err?.message || "Falha ao processar upload.",
    };
  }
}

export async function uploadBrokerImageAction(
  formData: FormData
): Promise<UploadActionResult> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Você precisa estar autenticado para atualizar a foto de perfil.",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return {
      success: false,
      error: "Nenhum arquivo enviado.",
    };
  }

  const allowedMimeTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      success: false,
      error: "Formato de arquivo inválido. Use WebP, JPG ou PNG.",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Arquivo muito grande. O limite máximo é de 10 MB.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await uploadImageToSupabase(
      buffer,
      file.name || "consultor.webp",
      file.type || "image/webp",
      "brokers"
    );
  } catch (err: any) {
    console.error("Erro no uploadBrokerImageAction:", err);
    return {
      success: false,
      error: err?.message || "Falha ao processar foto do consultor.",
    };
  }
}
