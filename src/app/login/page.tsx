import React, { Suspense } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0D12] text-[#FBF9F5] p-4 sm:p-6 relative overflow-hidden">
      {/* Detalhes de Linhas Arquitetônicas no Fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="max-w-4xl mx-auto h-full border-x border-white/[0.1] grid grid-cols-2">
          <div className="border-r border-white/[0.08]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Identidade Visual Provisória */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 border border-[#C5A880] flex items-center justify-center bg-[#0B0D12] text-[#C5A880] font-serif text-xl tracking-widest transition-transform group-hover:scale-95 duration-300">
              {siteConfig.logoText}
            </div>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-light text-[#FBF9F5] uppercase tracking-wider">
              {siteConfig.name}
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] mt-1 font-mono">
              Portal Restrito & Gestão Privada
            </p>
          </div>
        </div>

        {/* Card de Login com Suspense Boundary */}
        <Suspense
          fallback={
            <div className="bg-[#141720] border border-white/[0.08] p-8 rounded-sm shadow-2xl h-80 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Link de Retorno ao Portal */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[#8C8983] hover:text-[#FBF9F5] transition-colors"
          >
            ← Voltar para o Portal Público
          </Link>
        </div>
      </div>
    </div>
  );
}
