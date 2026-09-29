import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint de Keep-Alive / Healthcheck para o Supabase.
 * Previne a hibernação automática do banco de dados (que no plano gratuito do Supabase
 * ocorre após 7 dias de inatividade total).
 *
 * Configurado no vercel.json para rodar periodicamente via Vercel Cron gratuito.
 */
export async function GET() {
  try {
    const startTime = Date.now();
    // Consulta ultraleve para acordar o pooler e confirmar conectividade
    const userCount = await prisma.user.count();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
      userCount,
      message: "Supabase connection is alive and healthy.",
    });
  } catch (error: any) {
    console.error("Erro no healthcheck do banco de dados:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error?.message || "Falha ao conectar no banco de dados.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
