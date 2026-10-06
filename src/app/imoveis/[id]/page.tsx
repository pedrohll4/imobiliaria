import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyContactBox } from "@/components/property/PropertyContactBox";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Badge } from "@/components/ui/Badge";
import {
  Bed,
  Bath,
  Car,
  Maximize2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { title: true, description: true, neighborhood: true, city: true },
  });

  if (!property) {
    return { title: "Imóvel não encontrado" };
  }

  return {
    title: `${property.title} | ${property.neighborhood}, ${property.city}`,
    description: property.description.substring(0, 160),
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  const settings = await getSiteSettings();

  // Buscar imóvel completo (aceita tanto ID quanto slug)
  const property = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      features: true,
      broker: true,
    },
  });

  if (!property) {
    notFound();
  }

  // Incrementar visualização de forma assíncrona
  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  // Buscar imóveis semelhantes
  const similarProperties = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: "PUBLICADO",
      OR: [
        { type: property.type },
        { city: property.city },
        { neighborhood: property.neighborhood },
      ],
    },
    include: {
      images: { orderBy: { order: "asc" } },
    },
    take: 3,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Breadcrumb e Identificação */}
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-[#8C8983]">
          <Link href="/" className="hover:text-[#0F1115] transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/imoveis" className="hover:text-[#0F1115] transition-colors">
            Imóveis
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0F1115] font-medium">{property.city}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#8C8983] truncate max-w-xs">{property.neighborhood}</span>
        </div>

        {/* Título & Badges de Cabeçalho */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#0F1115]/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="dark">{property.type}</Badge>
              <Badge variant="champagne">
                Aquisição Exclusiva
              </Badge>
              <span className="text-xs font-mono tracking-widest text-[#8C8983] uppercase ml-2">
                Cód: {property.code}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0F1115] tracking-tight">
              {property.title}
            </h1>

            <p className="flex items-center gap-1.5 text-sm text-[#68655F] font-light">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {property.neighborhood}, {property.city} — {property.state}
                {property.address && ` • ${property.address}`}
              </span>
            </p>
          </div>
        </div>

        {/* Galeria de Fotos em Grande Destaque */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Corpo Principal: Detalhes Técnicos + Sticky Contact Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          
          {/* Coluna da Esquerda (8 colunas): Especificações, Descrição, Características */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-12">
            
            {/* Grid de Especificações Numéricas Principais */}
            <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-base font-medium text-[#0F1115]">
                  <Bed className="w-4 h-4 text-[#D4AF37]" />
                  <span>{property.bedrooms}</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-[#8C8983]">
                  Quartos ({property.suites} suítes)
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-base font-medium text-[#0F1115]">
                  <Bath className="w-4 h-4 text-[#D4AF37]" />
                  <span>{property.bathrooms}</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-[#8C8983]">
                  Banheiros
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-base font-medium text-[#0F1115]">
                  <Car className="w-4 h-4 text-[#D4AF37]" />
                  <span>{property.parkingSpaces}</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-[#8C8983]">
                  Vagas de Garagem
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-base font-medium text-[#0F1115]">
                  <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{property.builtArea} m²</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-[#8C8983]">
                  Área Construída
                </p>
              </div>
            </div>

            {/* Descrição Completa */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#0F1115] tracking-tight">
                Sobre a Propriedade
              </h2>
              <div className="prose prose-neutral max-w-none text-base text-[#4A4742] font-light leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Características & Diferenciais Exclusivos */}
            {property.features.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-[#0F1115]/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="font-serif text-2xl font-normal text-[#0F1115]">
                    Diferenciais & Amenidades
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {property.features.map((feat) => (
                    <div
                      key={feat.id}
                      className="flex items-center gap-2.5 p-3.5 bg-[#FFFFFF] border border-[#0F1115]/[0.06] rounded-xs text-sm text-[#38352F]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Localização */}
            <div className="space-y-4 pt-6 border-t border-[#0F1115]/10">
              <h2 className="font-serif text-2xl font-normal text-[#0F1115]">
                Localização & Entorno
              </h2>
              <p className="text-sm text-[#68655F] font-light leading-relaxed">
                O imóvel está localizado em {property.neighborhood}, na cidade de {property.city} — {property.state}. Entre em contato com um de nossos corretores e agende sua visita!
              </p>
              <div className="h-48 w-full bg-[#EAE7DF] rounded-sm border border-[#0F1115]/10 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MapPin className="w-8 h-8 text-[#D4AF37]" />
                <p className="text-sm font-medium text-[#0F1115]">
                  {property.neighborhood}, {property.city} — {property.state}
                </p>
                <p className="text-xs text-[#8C8983]">
                  Entre em contato com um de nossos corretores e agende sua visita
                </p>
              </div>
            </div>

          </div>

          {/* Coluna da Direita (4 colunas): Contact Box Fixo */}
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <PropertyContactBox property={property} broker={property.broker} />
          </div>

        </div>

        {/* Seção Imóveis Semelhantes */}
        {similarProperties.length > 0 && (
          <section className="pt-16 border-t border-[#0F1115]/10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                  Curadoria Relacionada
                </span>
                <h3 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
                  Residências Similares
                </h3>
              </div>
              <Link
                href="/imoveis"
                className="text-xs uppercase tracking-widest text-[#0B0D12] hover:text-[#9B7826] font-medium"
              >
                Ver Portfólio Completo →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
