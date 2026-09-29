/**
 * Utilitário de compressão de imagens no navegador.
 * Reduz fotos de alta resolução (ex: 8MB a 12MB de câmeras/iPhones)
 * para formatos modernos otimizados (WebP) em torno de 150KB - 300KB
 * antes do upload para o Supabase Storage.
 *
 * Isso poupa 95% do armazenamento do Supabase Free e acelera o carregamento em até 10x.
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
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // Se não for imagem, rejeita
    if (!file.type.startsWith("image/")) {
      reject(new Error("O arquivo selecionado não é uma imagem válida."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          reject(new Error("Não foi possível inicializar o contexto 2D do Canvas."));
          return;
        }

        // Habilitar anti-aliasing de alta qualidade para fotos imobiliárias
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Falha ao compactar imagem."));
              return;
            }

            // Gerar novo nome com extensão webp
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const extension = mimeType === "image/webp" ? "webp" : "jpg";
            const newFileName = `${baseName}.${extension}`;

            const compressedFile = new File([blob], newFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const savingsPercent = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              savingsPercent,
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Erro ao carregar os dados da imagem."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo no dispositivo."));
    };
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
