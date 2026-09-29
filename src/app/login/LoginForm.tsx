"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, AuthActionResult } from "@/actions/authActions";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowRight, Shield, User } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    async (prev, formData) => {
      const res = await loginAction(prev, formData);
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl);
      }
      return res;
    },
    null
  );

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="bg-[#141720] border border-white/[0.08] p-8 rounded-sm shadow-2xl space-y-6">
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="font-serif text-xl text-[#FBF9F5] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#C5A880]" />
          Autenticação de Acesso
        </h2>
        <p className="text-xs text-[#8C8983] font-light mt-1">
          Área exclusiva para consultores imobiliários e corpo diretivo.
        </p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xs">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#A5A29A] mb-1.5 font-medium">
            E-mail Cadastrado
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@imobiliaria.com"
            required
            className="w-full text-sm bg-[#0B0D12] border border-white/[0.12] rounded-xs px-4 py-2.5 text-[#FBF9F5] placeholder:text-[#55524D] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#A5A29A] mb-1.5 font-medium">
            Senha de Acesso
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full text-sm bg-[#0B0D12] border border-white/[0.12] rounded-xs px-4 py-2.5 text-[#FBF9F5] placeholder:text-[#55524D] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="champagne"
            isLoading={isPending}
            className="w-full py-3 text-xs uppercase tracking-widest font-semibold"
          >
            Acessar Plataforma
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </form>

      {/* Atalhos Rápidos para Demonstração */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-[#737069] block font-mono">
          Preenchimento Rápido (Demonstração):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials("admin@vanguard.com.br", "admin123")}
            className="text-[11px] p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xs text-[#C5A880] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shield className="w-3 h-3" />
            Admin (Diretoria)
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("helena@vanguard.com.br", "corretor123")}
            className="text-[11px] p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xs text-[#E5D7C3] flex items-center justify-center gap-1.5 transition-colors"
          >
            <User className="w-3 h-3" />
            Corretor (Helena)
          </button>
        </div>
      </div>
    </div>
  );
}
