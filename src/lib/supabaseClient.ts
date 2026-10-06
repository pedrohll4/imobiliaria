import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase com fallback para chave pública (anon/publishable)
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jvcknnpsjylcmvpmcwxd.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_rJvUAdSJ267WdFlLxetnTA_3ELgNI0d";

export const BUCKET_NAME = "properties";

/**
 * Cliente Supabase singleton para o navegador (Client Components).
 * Faz upload direto do dispositivo do usuário para o CDN do Supabase,
 * contornando os limites de 4.5MB da Vercel e o limite de 1MB de Server Actions.
 */
export const supabaseBrowserClient =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

/**
 * Upload direto de arquivo pelo navegador para o bucket do Supabase.
 */
export async function uploadDirectToSupabase(
  file: File,
  folder: string = "properties"
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabaseBrowserClient) {
    return {
      success: false,
      error: "Cliente Supabase não inicializado no navegador.",
    };
  }

  try {
    const cleanName = (file.name || "imagem")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 60);

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filePath = `${folder}/${Date.now()}-${randomSuffix}-${cleanName}`;

    const contentType = file.type || "image/webp";

    const { error: uploadError } = await supabaseBrowserClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Aviso no upload direto Supabase:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabaseBrowserClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl,
    };
  } catch (err: any) {
    console.error("Exceção no upload direto:", err);
    return {
      success: false,
      error: err?.message || "Erro no upload direto para o Supabase.",
    };
  }
}
