"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, deleteSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

// Controle de tentativas de login em memória para proteção contra ataques de força bruta
interface RateLimitRecord {
  attempts: number;
  lockedUntil?: number;
}
const loginRateLimit = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutos de bloqueio

// Hash fictício para mitigar ataques de temporização (timing attack) quando usuário não existe
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const returnTo = (formData.get("returnTo") as string) || "";

  if (!email || !password) {
    return { success: false, error: "Por favor, preencha o e-mail e a senha." };
  }

  // Verificar bloqueio por força bruta
  const now = Date.now();
  const record = loginRateLimit.get(email);
  if (record && record.lockedUntil && record.lockedUntil > now) {
    const minutesRemaining = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      success: false,
      error: `Muitas tentativas incorretas. Conta temporariamente bloqueada por segurança. Tente novamente em ${minutesRemaining} minuto(s).`,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { brokerProfile: true },
    });

    // Se usuário não existir, executa verificação contra dummy hash para manter tempo de resposta constante
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isValid = await verifyPassword(password, hashToCompare);

    if (!user || !isValid) {
      // Registrar tentativa falha
      const currentAttempts = (record?.attempts || 0) + 1;
      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        loginRateLimit.set(email, {
          attempts: currentAttempts,
          lockedUntil: now + LOCKOUT_TIME_MS,
        });
        return {
          success: false,
          error: "Limite de tentativas excedido. Esta conta foi bloqueada por 15 minutos por segurança.",
        };
      } else {
        loginRateLimit.set(email, { attempts: currentAttempts });
        const remaining = MAX_FAILED_ATTEMPTS - currentAttempts;
        return {
          success: false,
          error: `Credenciais inválidas. Você tem mais ${remaining} tentativa(s) antes do bloqueio temporário.`,
        };
      }
    }

    if (!user.active) {
      return { success: false, error: "Esta conta está inativa. Entre em contato com a administração." };
    }

    // Login com sucesso: limpa histórico de falhas
    loginRateLimit.delete(email);

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "BROKER",
      brokerId: user.brokerProfile?.id,
    });

    // Proteção rigorosa contra Open Redirect (não permitir // ou /\)
    let targetUrl = user.role === "ADMIN" ? "/admin" : "/dashboard";
    const isSafeRelativeUrl =
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.startsWith("/\\");

    if (isSafeRelativeUrl) {
      targetUrl = returnTo;
    }

    return {
      success: true,
      redirectUrl: targetUrl,
    };
  } catch (err) {
    console.error("Erro no login:", err);
    return { success: false, error: "Ocorreu um erro interno ao processar o login." };
  }
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect("/login");
}
