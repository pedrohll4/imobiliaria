"use client";

import React, { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, AuthActionResult } from "@/actions/authActions";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

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

  return (
    <div className="bg-[#141720] border border-white/[0.08] p-8 rounded-sm shadow-2xl space-y-6">
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="font-serif text-xl text-[#FBF9F5] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          Autenticação de Acesso
        </h2>
        <p className="text-xs text-[#8C8983] font-light mt-1">
          Área restrita e exclusiva para consultores imobiliários e corpo executivo.
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
            placeholder="seu.email@imobiliaria.com"
            required
            className="w-full text-sm bg-[#0B0D12] border border-white/[0.12] rounded-xs px-4 py-2.5 text-[#FBF9F5] placeholder:text-[#55524D] focus:outline-none focus:border-[#D4AF37]"
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
            className="w-full text-sm bg-[#0B0D12] border border-white/[0.12] rounded-xs px-4 py-2.5 text-[#FBF9F5] placeholder:text-[#55524D] focus:outline-none focus:border-[#D4AF37]"
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

      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-[#737069]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Ambiente seguro com criptografia de ponta a ponta</span>
      </div>
    </div>
  );
}
