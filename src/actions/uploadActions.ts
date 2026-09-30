"use server";

import { getSession } from "@/lib/auth";
import { uploadImageToSupabase } from "@/lib/supabase";

export interface UploadActionResult {
  success: boolean;
  url?: string;
  error?: string;
}

function detectSafeImageType(buffer: Buffer): { isValid: boolean; extension: string; mimeType: string } {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, extension: "", mimeType: "" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, extension: "jpg", mimeType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { isValid: true, extension: "png", mimeType: "image/png" };
  }

  // WebP: RIFF .... WEBP
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return { isValid: true, extension: "webp", mimeType: "image/webp" };
  }

  return { isValid: false, extension: "", mimeType: "" };
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

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Arquivo muito grande. O limite máximo é de 10 MB.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validação estrita por magic bytes binários (impede arquivo executável ou HTML disfarçado de imagem)
    const { isValid, extension, mimeType } = detectSafeImageType(buffer);
    if (!isValid) {
      return {
        success: false,
        error: "Formato de imagem inválido ou corrompido. Permitidos apenas arquivos WebP, JPG ou PNG genuínos.",
      };
    }

    const safeBaseName = (file.name || "imovel")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const safeFileName = `${safeBaseName}.${extension}`;

    return await uploadImageToSupabase(
      buffer,
      safeFileName,
      mimeType,
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

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Arquivo muito grande. O limite máximo é de 10 MB.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validação estrita por magic bytes binários
    const { isValid, extension, mimeType } = detectSafeImageType(buffer);
    if (!isValid) {
      return {
        success: false,
        error: "Formato de foto inválido ou corrompido. Permitidos apenas arquivos WebP, JPG ou PNG genuínos.",
      };
    }

    const safeBaseName = (file.name || "consultor")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const safeFileName = `${safeBaseName}.${extension}`;

    return await uploadImageToSupabase(
      buffer,
      safeFileName,
      mimeType,
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
