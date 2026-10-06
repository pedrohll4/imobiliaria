/**
 * Utilitário de compressão de imagens no navegador.
 * Reduz fotos de alta resolução (ex: 8MB a 15MB de câmeras de smartphones/iPhones)
 * para formatos modernos otimizados (WebP ou JPEG) em torno de 150KB - 300KB
 * antes do upload para o Supabase Storage.
 *
 * Inclui compatibilidade total com iOS/Safari e fallbacks seguros.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 a 1
  mimeType?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.80,
    mimeType = "image/webp",
  } = options;

  const originalSize = file.size;

  // Se o arquivo não parece ser imagem por mimeType ou extensão, mas tem conteúdo
  const fileName = file.name || "";
  const isImageMime = file.type && file.type.startsWith("image/");
  const isImageExt = /\.(jpe?g|png|webp|heic|heif|avif|bmp|gif)$/i.test(fileName);

  if (!isImageMime && !isImageExt && file.type !== "") {
    throw new Error("O arquivo selecionado não parece ser uma imagem válida.");
  }

  return new Promise((resolve) => {
    // Fallback de segurança: se a compressão falhar por qualquer motivo (iOS Safari HEIC, canvas memory, etc.)
    const fallbackToOriginal = () => {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        savingsPercent: 0,
        width: 0,
        height: 0,
      });
    };

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (!width || !height) {
            fallbackToOriginal();
            return;
          }

          // Calcular proporções respeitando os limites máximos
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            fallbackToOriginal();
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Função para exportar blob com fallback para jpeg caso webp falhe no Safari
          const exportBlob = (targetMime: string, q: number): Promise<Blob | null> => {
            return new Promise((res) => {
              try {
                canvas.toBlob((b) => res(b), targetMime, q);
              } catch {
                res(null);
              }
            });
          };

          exportBlob(mimeType, quality).then(async (blob) => {
            let finalBlob = blob;
            let finalMime = mimeType;

            // Se falhou com WebP (iOS antigo ou Safari restrito), tenta JPEG
            if (!finalBlob && mimeType === "image/webp") {
              finalBlob = await exportBlob("image/jpeg", quality);
              finalMime = "image/jpeg";
            }

            if (!finalBlob) {
              fallbackToOriginal();
              return;
            }

            const baseName = fileName.replace(/\.[^/.]+$/, "") || "foto";
            const ext = finalMime === "image/webp" ? "webp" : "jpg";
            const newFileName = `${baseName}.${ext}`;

            const compressedFile = new File([finalBlob], newFileName, {
              type: finalMime,
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const savingsPercent = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            // Limpa o canvas para liberar memória do dispositivo
            canvas.width = 0;
            canvas.height = 0;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              savingsPercent,
              width,
              height,
            });
          }).catch(() => {
            fallbackToOriginal();
          });
        } catch {
          fallbackToOriginal();
        }
      };

      img.onerror = () => {
        fallbackToOriginal();
      };
    };

    reader.onerror = () => {
      fallbackToOriginal();
    };

    try {
      reader.readAsDataURL(file);
    } catch {
      fallbackToOriginal();
    }
  });
}

/**
 * Utilitário para formatar bytes em KB ou MB amigável
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
