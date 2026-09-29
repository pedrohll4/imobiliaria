import React from "react";
import { siteConfig } from "@/config/site";
import { Sliders, Palette, Database, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function AdminConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-[#0F1115]/10">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
          Configuração do Sistema
        </span>
        <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
          Identidade Visual & Infraestrutura
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Visão dos parâmetros provisórios da marca e orientações técnicas de infraestrutura.
        </p>
      </div>

      {/* 1. Identidade Visual Provisória */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center gap-2 border-b border-[#0F1115]/10 pb-4">
          <Palette className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-serif text-xl text-[#0F1115]">
              Tokens da Marca Provisória
            </h2>
            <p className="text-xs text-[#8C8983]">
              Arquivo central: <code className="text-[#0F1115] font-mono bg-[#F4F1EA] px-1 py-0.5 rounded-xs">src/config/site.ts</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8983] font-medium">
              Nome Fantasia Provisório
            </span>
            <p className="font-serif text-lg text-[#0F1115]">{siteConfig.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8983] font-medium">
              Slogan / Tagline
            </span>
            <p className="text-[#0F1115]">{siteConfig.tagline}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8983] font-medium">
              Monograma / Placeholder de Logotipo
            </span>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 border border-[#0B0D12] flex items-center justify-center bg-[#0B0D12] text-[#FBF9F5] font-serif text-base tracking-widest">
                {siteConfig.logoText}
              </div>
              <span className="font-mono text-xs text-[#6B6862]">
                {siteConfig.logoPlaceholder}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8983] font-medium">
              Registro CRECI Jurídico
            </span>
            <p className="font-mono text-sm text-[#0F1115]">{siteConfig.contact.creciJ}</p>
          </div>

          <div className="sm:col-span-2 space-y-1 pt-2">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8983] font-medium">
              Como Inserir o Logotipo Definitivo:
            </span>
            <div className="p-4 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs text-xs text-[#55524D] space-y-2 leading-relaxed font-light">
              <p>
                1. Salve o arquivo vetorial da logo oficial em <code className="font-mono bg-white px-1">public/images/logo.svg</code> (ou png).
              </p>
              <p>
                2. No arquivo <code className="font-mono bg-white px-1">src/config/site.ts</code>, preencha <code className="font-mono text-[#0F1115]">logoUrl: &quot;/images/logo.svg&quot;</code> e substitua o nome da empresa.
              </p>
              <p>
                3. A Navbar e o Rodapé renderizarão automaticamente a logo oficial mantendo as proporções ideais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Infraestrutura & Deploy Gratuito */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center gap-2 border-b border-[#0F1115]/10 pb-4">
          <Database className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-serif text-xl text-[#0F1115]">
              Banco de Dados & Hospedagem Gratuita
            </h2>
            <p className="text-xs text-[#8C8983]">
              Projetado para operar com custo zero em planos perpétuos gratuitos
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-[#4A4742] leading-relaxed">
          <div className="flex items-start gap-3 p-4 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F1115] block text-sm">
                Ambiente de Desenvolvimento Local (SQLite)
              </strong>
              <span>
                Atualmente operando em SQLite local (<code className="font-mono bg-white px-1">dev.db</code>). Não requer Docker, contas em nuvem ou configurações externas para testar e validar o sistema.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F1115] block text-sm">
                Deploy Gratuito com Supabase (PostgreSQL)
              </strong>
              <span>
                Para publicação na nuvem: crie um projeto gratuito no Supabase, altere o provider em <code className="font-mono bg-white px-1">prisma/schema.prisma</code> para <code className="font-mono text-[#0F1115]">postgresql</code> e adicione a string de conexão no arquivo <code className="font-mono bg-white px-1">.env</code>.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs">
            <CheckCircle2 className="w-5 h-5 text-[#0F1115] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F1115] block text-sm">
                Hospedagem Gratuita na Vercel
              </strong>
              <span>
                Conecte seu repositório GitHub à Vercel e insira as variáveis <code className="font-mono bg-white px-1">DATABASE_URL</code> e <code className="font-mono bg-white px-1">JWT_SECRET</code>. A plataforma rodará de forma ultrarrápida com Edge Caching e Server Actions.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
