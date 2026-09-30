import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint de Keep-Alive / Healthcheck para o Supabase.
 * Previne a hibernação automática do banco de dados no plano gratuito.
 * Configurado no vercel.json para rodar periodicamente via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  // Se houver CRON_SECRET configurado nas variáveis de ambiente, valida a chamada
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }
  }

  try {
    const startTime = Date.now();
    // Consulta ultraleve apenas para testar conectividade e manter o pool ativo
    await prisma.user.findFirst({ select: { id: true } });
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Log interno detalhado para auditoria sem expor stacktrace/credenciais para o cliente
    console.error("Erro interno no healthcheck do banco de dados:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: "Falha ao validar conectividade com o banco de dados.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
