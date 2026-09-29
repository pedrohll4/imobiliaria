"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, deleteSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

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

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { brokerProfile: true },
    });

    if (!user) {
      return { success: false, error: "Credenciais inválidas. Verifique seu e-mail e senha." };
    }

    if (!user.active) {
      return { success: false, error: "Esta conta está inativa. Entre em contato com a administração." };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Credenciais inválidas. Verifique seu e-mail e senha." };
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "BROKER",
      brokerId: user.brokerProfile?.id,
    });

    let targetUrl = "/dashboard";
    if (returnTo && returnTo.startsWith("/")) {
      targetUrl = returnTo;
    } else if (user.role === "ADMIN") {
      targetUrl = "/admin";
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
