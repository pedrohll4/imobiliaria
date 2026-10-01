import { NextResponse } from "next/server";
import { getSession, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "imob_auth_session";

export async function GET(request: Request) {
  const session = await getSession();

  // 1. Procurar o usuário admin original que iniciou a impersonação
  let adminUser = null;
  if (session?.impersonatedBy) {
    adminUser = await prisma.user.findUnique({
      where: { id: session.impersonatedBy },
      include: { brokerProfile: true },
    });
  }

  // 2. Fallback de segurança: se não encontrar, pega o Administrador Geral ativo
  if (!adminUser || adminUser.role !== "ADMIN") {
    adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN", active: true },
      include: { brokerProfile: true },
    });
  }

  if (!adminUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Gerar novo token JWT com papel estrito de ADMIN
  const token = await createSessionToken({
    userId: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: "ADMIN",
    brokerId: adminUser.brokerProfile?.id,
  });

  // 4. Criar redirecionamento para /admin e gravar o Set-Cookie DIRETAMENTE na resposta HTTP
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
