import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jvcknnpsjylcmvpmcwxd.supabase.co";

// Usa Service Role Key ou Anon Key das variáveis de ambiente
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase = supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export const BUCKET_NAME = "properties";

/**
 * Faz o upload de um arquivo otimizado para o bucket do Supabase Storage.
 * Garante que a foto tenha URL pública e CDN habilitada.
 */
export async function uploadImageToSupabase(
  buffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string = "image/webp",
  folder: string = "properties"
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase Storage não inicializado no servidor. Verifique as credenciais no .env.",
    };
  }

  try {
    // Sanitizar nome do arquivo e criar caminho com timestamp
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${folder}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        cacheControl: "31536000", // 1 ano de cache CDN para não consumir banda
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload para Supabase Storage:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Obter URL pública do arquivo
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl,
    };
  } catch (err: any) {
    console.error("Exceção no upload para o Supabase:", err);
    return { success: false, error: err?.message || "Erro desconhecido no upload." };
  }
}

/**
 * Remove fotos do Supabase Storage ao deletar um imóvel.
 * Isso evita acúmulo de arquivos órfãos, mantendo o limite do plano Free sempre limpo.
 */
export async function deleteImagesFromSupabase(
  imageUrls: string[]
): Promise<{ success: boolean; removedCount: number; error?: string }> {
  if (!supabase || !imageUrls || imageUrls.length === 0) {
    return { success: false, removedCount: 0 };
  }

  try {
    const filePaths: string[] = [];

    for (const url of imageUrls) {
      if (url.includes(`${BUCKET_NAME}/`)) {
        const parts = url.split(`${BUCKET_NAME}/`);
        if (parts.length > 1) {
          filePaths.push(parts.slice(1).join(`${BUCKET_NAME}/`));
        }
      }
    }

    if (filePaths.length === 0) {
      return { success: true, removedCount: 0 };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);

    if (error) {
      console.error("Erro ao deletar arquivos do Supabase Storage:", error);
      return { success: false, error: error.message, removedCount: 0 };
    }

    return { success: true, removedCount: filePaths.length };
  } catch (err: any) {
    console.error("Exceção ao limpar imagens do Supabase:", err);
    return { success: false, error: err?.message, removedCount: 0 };
  }
}
