import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowUpRight, Building2, Phone, Mail } from "lucide-react";

export const revalidate = 60;

export default async function CorretoresPage() {
  const session = await getSession();

  const brokers = await prisma.broker.findMany({
    where: { active: true },
    include: {
      _count: {
        select: { properties: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Corpo Consultivo
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#0F1115] tracking-tight">
            Nossos Especialistas em Alto Padrão
          </h1>
          <p className="text-base text-[#68655F] font-light leading-relaxed">
            Profissionais credenciados com sólida bagagem no mercado imobiliário ultra-prime, dedicados a assessorar sua tomada de decisão com rigor e total sigilo.
          </p>
        </div>

        {/* Grid de Corretores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden p-7 shadow-subtle hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center gap-4">
                  <img
                    src={broker.photoUrl}
                    alt={broker.name}
                    className="w-20 h-20 rounded-full object-cover border border-[#0F1115]/10 shadow-sm"
                  />
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#0F1115]">
                      {broker.name}
                    </h3>
                    <p className="text-xs font-mono tracking-wider text-[#D4AF37] uppercase mt-0.5">
                      {broker.creci}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#8C8983] mt-1.5 font-light">
                      <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{broker._count.properties} imóveis em carteira</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#55524D] font-light leading-relaxed mt-5">
                  {broker.bio}
                </p>

                <div className="pt-4 border-t border-[#0F1115]/5 space-y-1.5 text-xs text-[#6B6862] mt-5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>{broker.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span className="truncate">{broker.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#0F1115]/10 flex items-center justify-between gap-3">
                <Link
                  href={`/corretores/${broker.id}`}
                  className="text-xs uppercase tracking-widest font-semibold text-[#0B0D12] hover:text-[#9B7826] transition-colors"
                >
                  Ver Perfil e Imóveis
                </Link>

                <a
                  href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(`Olá ${broker.name}, gostaria de solicitar uma consultoria imobiliária.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:text-[#9B7826]"
                >
                  WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
