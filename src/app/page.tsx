import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { LuxuryLogo3D } from "@/components/3d/LuxuryLogo3D";
import { PropertyCard } from "@/components/property/PropertyCard";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/settings";
import { ArrowUpRight, ArrowRight, ShieldCheck, Compass, Award, Sparkles } from "lucide-react";

export const revalidate = 60; // Revalidar a cada 60 segundos

export default async function HomePage() {
  const session = await getSession();
  const settings = await getSiteSettings();

  // Buscar imóveis em destaque para a Home
  const featuredProperties = await prisma.property.findMany({
    where: {
      status: "PUBLICADO",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });

  // Buscar corretores ativos
  const brokers = await prisma.broker.findMany({
    where: { active: true },
    take: 3,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} settings={settings} />

      <main className="flex-1">
        {/* HERO CINEMATOGRÁFICO */}
        <section className="relative min-h-[92vh] flex flex-col justify-between bg-[#0B0D12] text-[#FBF9F5] pt-12 pb-16 z-10">
          
          {/* Fotografia Arquitetônica Monumental de Fundo com Tratamento Editorial */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={settings.heroBgImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85"}
              alt={settings.name}
              className="w-full h-full object-cover object-center opacity-30 filter grayscale-[20%] contrast-110 scale-100 transition-transform duration-1000"
            />
            {/* Gradientes sutis para legibilidade impecável */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-[#0B0D12]/70" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#0B0D12]/80" />
          </div>

          {/* Grid de Linhas Arquitetônicas Decorativas */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-15 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full border-x border-white/[0.1] grid grid-cols-3">
              <div className="border-r border-white/[0.08]" />
              <div className="border-r border-white/[0.08]" />
            </div>
          </div>

          {/* Conteúdo Central do Hero + Elemento 3D */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Texto Editorial */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.06] border border-white/[0.12] rounded-xs backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[#F6EEDA] font-medium">
                    {settings.heroBadge}
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#FBF9F5] leading-[1.12] tracking-tight">
                  {settings.heroTitle}
                </h1>

                <p className="text-base sm:text-lg text-[#C8C5BD] font-light max-w-xl leading-relaxed">
                  {settings.heroSubtitle}
                </p>
              </div>

              {/* Emblema 3D Escultural da Marca */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className="relative w-full max-w-xl flex items-center justify-center">
                  <LuxuryLogo3D />
                </div>
              </div>
            </div>
          </div>

          {/* Sistema de Busca Integrado à Base do Hero */}
          <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-4">
            <HeroSearchBar />
          </div>
        </section>

        {/* SEÇÃO "IMÓVEIS SELECIONADOS" (Curadoria em Destaque) */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 pb-6 border-b border-[#0F1115]/10 gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Portfólio Privado
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F1115] tracking-tight">
                {settings.featuredTitle}
              </h2>
              <p className="text-sm text-[#6F6C66] font-light max-w-lg">
                {settings.featuredSubtitle}
              </p>
            </div>

            <Link
              href="/imoveis"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#0B0D12] hover:text-[#9B7826] transition-colors pb-1 border-b border-[#0B0D12] hover:border-[#9B7826]"
            >
              Ver Todas as Propriedades
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProperties.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm p-12 sm:p-16 text-center space-y-5 shadow-subtle max-w-2xl mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#F4F1EA] flex items-center justify-center mx-auto text-[#D4AF37]">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  Curadoria em Andamento
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#0F1115] font-light">
                  Novas Propriedades em Catalogação
                </h3>
              </div>
              <p className="text-sm text-[#6F6C66] font-light leading-relaxed max-w-lg mx-auto">
                Nosso acervo de residências de alto padrão e coberturas exclusivas está sendo atualizado.
                Para ter acesso imediato a oportunidades confidenciais e <em>off-market</em>, contate nossa equipe.
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de falar com um corretor sobre oportunidades de imóveis off-market.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#1E2330] rounded-sm transition-all"
                >
                  Falar com um corretor
                  <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Grid de Imóveis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Botão de Expansão */}
              <div className="mt-14 text-center">
                <Link
                  href="/imoveis"
                  className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] px-8 py-4 bg-[#0B0D12] text-[#FBF9F5] hover:bg-[#1E2330] rounded-sm font-semibold transition-all shadow-subtle"
                >
                  Explorar Catálogo Completo ({featuredProperties.length}+ Residências)
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* SEÇÃO EDITORIAL: CONCEITO & PILARES DA MARCA */}
        <section className="py-24 bg-[#0B0D12] text-[#FBF9F5] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-medium">
                  {settings.philosophyBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#FBF9F5] leading-tight">
                  {settings.philosophyTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#A8A59E] font-light leading-relaxed">
                  {settings.philosophyText}
                </p>
                <div className="pt-4">
                  <Link
                    href="/sobre"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] hover:text-[#FBF9F5] transition-colors"
                  >
                    Conheça Nossa Trajetória
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 border border-white/[0.08] bg-white/[0.02] rounded-sm space-y-3">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg text-[#FBF9F5]">Discrição Absoluta</h3>
                  <p className="text-xs text-[#8E8B84] font-light leading-relaxed">
                    Processos estritamente confidenciais para proteger a privacidade de compradores e vendedores em cada negociação.
                  </p>
                </div>

                <div className="p-6 border border-white/[0.08] bg-white/[0.02] rounded-sm space-y-3">
                  <Compass className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg text-[#FBF9F5]">Curadoria Estrita</h3>
                  <p className="text-xs text-[#8E8B84] font-light leading-relaxed">
                    Apenas propriedades que atendem a elevados padrões de localização, assinatura arquitetônica e liquidez patrimonial.
                  </p>
                </div>

                <div className="p-6 border border-white/[0.08] bg-white/[0.02] rounded-sm space-y-3">
                  <Award className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg text-[#FBF9F5]">Assessoria 360°</h3>
                  <p className="text-xs text-[#8E8B84] font-light leading-relaxed">
                    Suporte jurídico, fiscal e técnico do primeiro contato até a celebração da escritura definitiva.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SEÇÃO: CORRETORES EM DESTAQUE */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Corpo Consultivo
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F1115] mt-1">
                Especialistas Dedicados
              </h2>
            </div>
            <Link
              href="/corretores"
              className="text-xs uppercase tracking-widest font-semibold text-[#0B0D12] hover:text-[#9B7826] transition-colors"
            >
              Ver Todos os Corretores →
            </Link>
          </div>

          {brokers.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm p-10 sm:p-12 text-center space-y-4 shadow-subtle max-w-xl mx-auto">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Atendimento Centralizado
              </span>
              <h3 className="font-serif text-2xl text-[#0F1115] font-light">
                Corpo Consultivo Dedicado
              </h3>
              <p className="text-xs sm:text-sm text-[#6F6C66] font-light leading-relaxed">
                Nosso time de consultores atua sob estrita governança e sigilo. Para falar com um corretor ou agendamento de reuniões, contate nossa central corporativa.
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Olá! Desejo atendimento com um consultor imobiliário.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#1E2330] rounded-sm transition-all"
                >
                  Falar com um corretor
                  <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {brokers.map((broker) => (
                <div
                  key={broker.id}
                  className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden p-6 space-y-5 hover:border-[#D4AF37]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={broker.photoUrl}
                      alt={broker.name}
                      className="w-16 h-16 rounded-full object-cover border border-[#0F1115]/10"
                    />
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#0F1115]">
                        {broker.name}
                      </h3>
                      <p className="text-xs text-[#8C8983] uppercase tracking-wider font-mono">
                        {broker.creci}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B6862] font-light leading-relaxed line-clamp-3">
                    {broker.bio}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#0F1115]/[0.06]">
                    <Link
                      href={`/corretores/${broker.id}`}
                      className="text-xs uppercase tracking-wider font-semibold text-[#0B0D12] hover:text-[#9B7826]"
                    >
                      Ver Imóveis do Corretor
                    </Link>

                    <a
                      href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(`Olá ${broker.name}, gostaria de conversar sobre oportunidades de imóveis de alto padrão.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#9B7826] font-medium"
                    >
                      WhatsApp
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BANNER CONCIERGE / ATENDIMENTO PRIVATIVO */}
        <section className="py-20 bg-[#F4F1EA] border-y border-[#0F1115]/[0.08]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#9B7826] font-semibold">
              Atendimento Personalizado
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0F1115] font-light">
              Procura uma residência com parâmetros sob medida?
            </h2>
            <p className="text-sm sm:text-base text-[#68655F] font-light max-w-xl mx-auto leading-relaxed">
              Dispomos de um portfólio restrito (*off-market*) acessível exclusivamente por intermédio de nossa diretoria e consultores sêniores.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Olá! Desejo solicitar uma busca personalizada off-market.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#1E2330] rounded-sm transition-all"
              >
                Solicitar Consultoria Off-Market
              </a>
              <Link
                href="/contato"
                className="w-full sm:w-auto px-8 py-3.5 border border-[#0B0D12]/20 text-[#0B0D12] text-xs uppercase tracking-widest font-semibold hover:border-[#0B0D12] rounded-sm transition-all"
              >
                Agendar Reunião na Sede
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
