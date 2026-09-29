import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import {
  Bed,
  Bath,
  Car,
  Maximize2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Phone,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

interface CuratedPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CuratedPageProps) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      name: true,
      broker: { select: { name: true } },
    },
  });

  if (!lead) {
    return { title: "Curadoria Exclusiva de Imóveis" };
  }

  const brokerName = lead.broker?.name || "Consultoria Especializada";
  return {
    title: `Seleção Exclusiva para ${lead.name} | Curadoria por ${brokerName}`,
    description: `Dossiê personalizado com oportunidades de imóveis de alto padrão selecionadas a dedo por ${brokerName}.`,
  };
}

export default async function CuratedDossierPage({ params }: CuratedPageProps) {
  const { id } = await params;
  const settings = await getSiteSettings();

  // Busca o lead com os dados do corretor responsável e do imóvel de contato original
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      broker: true,
      property: {
        include: {
          images: { orderBy: { order: "asc" } },
          features: true,
        },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // Parse dos IDs selecionados pelo corretor
  let propertyIds: string[] = [];
  if (lead.curatedPropertyIds) {
    try {
      const parsed = JSON.parse(lead.curatedPropertyIds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        propertyIds = parsed;
      }
    } catch {
      propertyIds = [];
    }
  }

  // Se não houver nenhum selecionado ainda e tiver o imóvel original, exibe o original
  if (propertyIds.length === 0 && lead.property?.id) {
    propertyIds = [lead.property.id];
  }

  // Busca os dados completos dos imóveis selecionados
  const rawCuratedProperties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    include: {
      images: { orderBy: { order: "asc" } },
      features: true,
    },
  });

  // Ordena os imóveis exatamente na ordem definida pelo corretor
  const curatedProperties = propertyIds
    .map((pid) => rawCuratedProperties.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Dados do Corretor
  const broker = lead.broker;
  const brokerName = broker?.name || "Camila Alencar";
  const brokerCreci = broker?.creci || "RO 2.894-F";
  const brokerPhoto =
    broker?.photoUrl ||
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80";
  const brokerPhone = broker?.phone || "(69) 99288-7711";
  const brokerWhatsapp = broker?.whatsapp || "5569992887711";

  // WhatsApp link geral da curadoria
  const generalWaMessage = `Olá ${brokerName}! Estou visualizando a seleção de imóveis exclusiva que você preparou para mim (Dossiê de ${lead.name}). Gostaria de conversar com você sobre as opções.`;
  const generalWaUrl = `https://wa.me/${brokerWhatsapp}?text=${encodeURIComponent(generalWaMessage)}`;

  // Mensagem personalizada do corretor
  const personalNote =
    lead.curatedNotes ||
    `Olá ${lead.name}! Preparei esta curadoria com opções de imóveis selecionados a dedo no catálogo para o seu perfil e estilo de vida. Fique à vontade para analisar cada detalhe e me chamar no WhatsApp para agendarmos uma visita privativa.`;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0F1115] flex flex-col font-sans">
      <Navbar settings={settings} />

      {/* HERO VIP: APRESENTAÇÃO EDITORIAL DA CURADORIA */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-[#0B0D12] text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Luzes arquitetônicas de fundo */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-full text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossiê Imobiliário Exclusivo • Seleção VIP</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.1]">
              Curadoria de Imóveis para{" "}
              <span className="italic text-[#D4AF37]">{lead.name}</span>
            </h1>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-2xl">
              Seleção privativa de propriedades de altíssimo padrão, cuidadosamente analisadas e recomendadas para você com base no seu interesse inicial.
            </p>
          </div>

          {/* CARTA DO CORRETOR / APRESENTAÇÃO VIP */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Mensagem do Corretor */}
            <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-sm relative flex flex-col justify-between">
              <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-3" />
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light italic">
                &ldquo;{personalNote}&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span className="font-serif italic text-white/80">
                  — {brokerName}, CRECI {brokerCreci}
                </span>
                <span className="font-mono text-[11px] text-[#D4AF37]">
                  {curatedProperties.length} imóveis selecionados
                </span>
              </div>
            </div>

            {/* Card do Corretor Responsável */}
            <div className="bg-[#12151D] border border-[#D4AF37]/30 p-6 rounded-sm flex flex-col justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37] shrink-0">
                  <img
                    src={brokerPhoto}
                    alt={brokerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                    Sua Consultora Dedicada
                  </span>
                  <h3 className="font-serif text-lg font-medium text-white">
                    {brokerName}
                  </h3>
                  <p className="text-xs text-white/60 font-mono">
                    CRECI {brokerCreci}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversar no WhatsApp</span>
                </a>
                <a
                  href={`tel:${brokerPhone.replace(/\D/g, "")}`}
                  className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium rounded-xs transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Ligar: {brokerPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PRINCIPAL: GRADE DE IMÓVEIS CURADOS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#0F1115]/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Portfólio Personalizado
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0F1115] mt-1">
              Oportunidades Selecionadas ({curatedProperties.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6862] font-light mt-1">
              Casas e empreendimentos que atendem aos seus critérios de espaço, localização e valor.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8C8983]">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Curadoria exclusiva com assessoria jurídica e documental completa</span>
          </div>
        </div>

        {curatedProperties.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-16 text-center rounded-sm space-y-4">
            <Building2 className="w-12 h-12 text-[#D4AF37] mx-auto" />
            <h3 className="font-serif text-2xl text-[#0F1115]">
              Curadoria em elaboração
            </h3>
            <p className="text-sm text-[#8C8983] max-w-md mx-auto">
              Sua consultora {brokerName} está finalizando a seleção das melhores oportunidades. Entre em contato direto via WhatsApp para adiantar detalhes.
            </p>
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0B0D12] font-semibold text-xs uppercase tracking-widest rounded-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Falar com {brokerName}</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {curatedProperties.map((property, index) => {
              const mainImg =
                property.images[0]?.url ||
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

              const formattedPrice = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              }).format(property.price);

              const isInitialInterest = lead.property?.id === property.id;

              // Link direto no WhatsApp para conversar sobre este imóvel específico
              const propWaMessage = `Olá ${brokerName}! Vi na curadoria personalizada de ${lead.name} o imóvel ${property.title} (${property.code}) no valor de ${formattedPrice}. Gostaria de mais detalhes e de agendar uma visita!`;
              const propWaUrl = `https://wa.me/${brokerWhatsapp}?text=${encodeURIComponent(propWaMessage)}`;

              return (
                <div
                  key={property.id}
                  className="group bg-[#FFFFFF] border border-[#0F1115]/10 rounded-sm overflow-hidden shadow-subtle hover:shadow-elevation hover:border-[#D4AF37]/60 transition-all duration-500 flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    {/* Imagem Monumental */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1E29]">
                      <img
                        src={mainImg}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                      {/* Badges superiores */}
                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-[#0B0D12]/90 text-white px-2.5 py-1 rounded-xs backdrop-blur-sm">
                          Opção {index + 1} • {property.type}
                        </span>
                        {isInitialInterest && (
                          <span className="text-[10px] uppercase font-bold tracking-widest bg-[#D4AF37] text-[#0B0D12] px-2.5 py-1 rounded-xs shadow-md">
                            ⭐ Imóvel do Contato Inicial
                          </span>
                        )}
                      </div>

                      {/* Código e Cidade na barra inferior da foto */}
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
                        <span className="font-mono text-white/80">
                          {property.code}
                        </span>
                        <span className="font-medium text-white/90">
                          {property.neighborhood}, {property.city}
                        </span>
                      </div>
                    </div>

                    {/* Informações Editoriais */}
                    <div className="px-6 space-y-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-[11px] uppercase tracking-widest text-[#8C8983] font-medium">
                          Valor de Venda
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F1115] tracking-tight">
                          {formattedPrice}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl text-[#0F1115] font-normal leading-snug line-clamp-1 group-hover:text-[#9B7826] transition-colors">
                        {property.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#6B6862] font-light leading-relaxed line-clamp-2">
                        {property.description}
                      </p>

                      {/* Especificações Arquitetônicas */}
                      <div className="grid grid-cols-4 gap-2 pt-3 pb-2 border-t border-b border-[#0F1115]/5 text-center">
                        <div className="p-2 bg-[#FBF9F5] rounded-xs">
                          <Bed className="w-4 h-4 mx-auto text-[#D4AF37] mb-1" />
                          <span className="text-xs font-semibold text-[#0F1115] block">
                            {property.bedrooms}
                          </span>
                          <span className="text-[10px] text-[#8C8983] uppercase">
                            Quartos
                          </span>
                        </div>

                        <div className="p-2 bg-[#FBF9F5] rounded-xs">
                          <Bath className="w-4 h-4 mx-auto text-[#D4AF37] mb-1" />
                          <span className="text-xs font-semibold text-[#0F1115] block">
                            {property.suites}
                          </span>
                          <span className="text-[10px] text-[#8C8983] uppercase">
                            Suítes
                          </span>
                        </div>

                        <div className="p-2 bg-[#FBF9F5] rounded-xs">
                          <Car className="w-4 h-4 mx-auto text-[#D4AF37] mb-1" />
                          <span className="text-xs font-semibold text-[#0F1115] block">
                            {property.parkingSpaces}
                          </span>
                          <span className="text-[10px] text-[#8C8983] uppercase">
                            Vagas
                          </span>
                        </div>

                        <div className="p-2 bg-[#FBF9F5] rounded-xs">
                          <Maximize2 className="w-4 h-4 mx-auto text-[#D4AF37] mb-1" />
                          <span className="text-xs font-semibold text-[#0F1115] block">
                            {property.builtArea}m²
                          </span>
                          <span className="text-[10px] text-[#8C8983] uppercase">
                            Área Útil
                          </span>
                        </div>
                      </div>

                      {/* Diferenciais em Destaque */}
                      {property.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {property.features.slice(0, 3).map((feat) => (
                            <span
                              key={feat.id}
                              className="text-[11px] bg-[#F4F1EA] text-[#4A4742] px-2.5 py-1 rounded-xs font-medium"
                            >
                              ✓ {feat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação do Imóvel */}
                  <div className="p-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-[#0F1115]/5 mt-4">
                    <Link
                      href={`/imoveis/${property.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#F4F1EA] hover:bg-[#EAE5DA] text-[#0F1115] text-xs font-semibold rounded-xs transition-colors border border-[#0F1115]/10"
                    >
                      <span>Ver Fotos & Detalhes</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8C8983]" />
                    </Link>

                    <a
                      href={propWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Tenho Interesse Neste</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BANNER INFERIOR DE FECHAMENTO */}
        <div className="bg-[#0B0D12] text-white p-8 sm:p-10 rounded-sm border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Atendimento Dedicado
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal">
              Gostaria de agendar uma visita privativa aos imóveis?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl font-light">
              Nossa equipe coordena roteiros de visitas exclusivos e discretos para você e sua família conhecerem cada uma das propriedades.
            </p>
          </div>

          <a
            href={generalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12] font-bold text-xs uppercase tracking-widest rounded-xs transition-all shadow-lg hover:shadow-xl shrink-0 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar com {brokerName}</span>
          </a>
        </div>
      </main>

      {/* BARRA FIXA FLUTUANTE INFERIOR */}
      <div className="sticky bottom-0 left-0 right-0 bg-[#0B0D12]/95 backdrop-blur-md border-t border-[#D4AF37]/30 py-3 px-4 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37] shrink-0 hidden sm:block">
              <img
                src={brokerPhoto}
                alt={brokerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-white font-medium">
                Dossiê preparado para <strong className="text-[#D4AF37]">{lead.name}</strong>
              </p>
              <p className="text-[10px] text-white/60">
                Consultora: {brokerName} • CRECI {brokerCreci}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <Footer settings={settings} />
    </div>
  );
}
