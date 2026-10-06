import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ArrowUpRight, Phone, Mail, Award, MessageSquare, ChevronRight } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

interface BrokerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BrokerDetailPage({ params }: BrokerDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  const settings = await getSiteSettings();

  const broker = await prisma.broker.findUnique({
    where: { id },
    include: {
      properties: {
        where: { status: "PUBLICADO" },
        include: {
          images: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!broker || !broker.active) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8983]">
          <Link href="/" className="hover:text-[#0F1115]">
            Início
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/corretores" className="hover:text-[#0F1115]">
            Corretores
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0F1115] font-medium">{broker.name}</span>
        </div>

        {/* Perfil do Corretor */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-8 sm:p-10 rounded-sm shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <img
              src={broker.photoUrl}
              alt={broker.name}
              className="w-36 h-36 rounded-full object-cover border-2 border-[#D4AF37]/30 shadow-md"
            />
          </div>

          <div className="lg:col-span-8 space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Corretor
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#0F1115]">
                {broker.name}
              </h1>
              <p className="text-xs font-mono tracking-widest text-[#8C8983] uppercase">
                {broker.creci}
              </p>
            </div>

            <p className="text-sm text-[#4A4742] font-light leading-relaxed max-w-2xl">
              {broker.bio}
            </p>

            {/* Contatos & Botão WhatsApp */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <a
                href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(`Olá ${broker.name}, gostaria de falar sobre as propriedades em sua carteira.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0B0D12] text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#C29F2D] transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-4 text-xs text-[#6B6862]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{broker.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{broker.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Imóveis do Corretor */}
        <div className="space-y-8">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8C8983]">
              Portfólio Gerenciado
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#0F1115] mt-1">
              Imóveis sob responsabilidade de {broker.name} ({broker.properties.length})
            </h2>
          </div>

          {broker.properties.length === 0 ? (
            <p className="text-sm text-[#8C8983] py-8">
              No momento este corretor não possui imóveis publicados publicamente.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {broker.properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
