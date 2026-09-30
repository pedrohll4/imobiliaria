import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: A variável de ambiente JWT_SECRET não está definida no middleware em produção."
      );
    }
    return new TextEncoder().encode("dev-secret-local-do-not-use-in-production-only-2026");
  }
  return new TextEncoder().encode(secret);
}

const SESSION_COOKIE_NAME = "imob_auth_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: { role?: string; userId?: string; impersonatedBy?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      session = payload as { role?: string; userId?: string; impersonatedBy?: string };
    } catch {
      session = null;
    }
  }

  // 1. Proteger rotas do Admin (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN" && !session.impersonatedBy) {
      // Corretor tentando acessar painel de admin -> redirecionar para seu dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 2. Proteger rotas do Dashboard (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Tanto ADMIN quanto BROKER podem acessar dashboard
  }

  // 3. Se já autenticado e tentar acessar /login
  if (pathname === "/login" && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
