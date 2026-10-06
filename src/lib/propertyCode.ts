import { prisma } from "@/lib/prisma";

/**
 * Gera o próximo código de imóvel de forma sequencial e sem colisão.
 * Exemplo: se já existe IMV-7121, gera IMV-7122.
 * Se não houver nenhum, gera IMV-1001.
 */
export async function getNextPropertyCode(): Promise<string> {
  try {
    const properties = await prisma.property.findMany({
      select: { code: true },
    });

    const existingCodes = new Set(
      properties.map((p) => p.code.toUpperCase().trim())
    );

    let maxNumber = 0;
    for (const p of properties) {
      const match = p.code.match(/^IMV-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    let nextNumber = maxNumber > 0 ? maxNumber + 1 : 1001;

    // Garantir que não colida com nenhum código existente no banco
    while (existingCodes.has(`IMV-${nextNumber}`)) {
      nextNumber++;
    }

    return `IMV-${nextNumber}`;
  } catch (err) {
    console.error("Erro ao gerar próximo código sequencial de imóvel:", err);
    return `IMV-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

/**
 * Gera um código alternativo único não utilizado no banco.
 */
export async function getRandomPropertyCode(): Promise<string> {
  try {
    const properties = await prisma.property.findMany({
      select: { code: true },
    });
    const existingCodes = new Set(
      properties.map((p) => p.code.toUpperCase().trim())
    );

    let candidate = "";
    let attempts = 0;
    do {
      const rand = Math.floor(1000 + Math.random() * 9000);
      candidate = `IMV-${rand}`;
      attempts++;
    } while (existingCodes.has(candidate) && attempts < 50);

    return candidate;
  } catch {
    return `IMV-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}
