import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LeadCard, AvailableProperty } from "./LeadCard";
import { Users, Sparkles } from "lucide-react";

export default async function DashboardLeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const brokerId = session.brokerId;
  const where = brokerId ? { brokerId } : {};

  // Busca os leads vinculados ao corretor (ou todos se for administrador)
  const leads = await prisma.lead.findMany({
    where,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          code: true,
          price: true,
          city: true,
          neighborhood: true,
          type: true,
          images: {
            where: { isMain: true },
            take: 1,
            select: { url: true },
          },
        },
      },
      broker: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          creci: true,
          photoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Busca todos os imóveis ativos para a ferramenta de seleção e curadoria
  const rawProperties = await prisma.property.findMany({
    where: { status: "PUBLICADO" },
    select: {
      id: true,
      code: true,
      title: true,
      slug: true,
      price: true,
      type: true,
      city: true,
      neighborhood: true,
      bedrooms: true,
      suites: true,
      builtArea: true,
      brokerId: true,
      images: {
        where: { isMain: true },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { price: "asc" },
  });

  const availableProperties: AvailableProperty[] = rawProperties.map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    slug: p.slug,
    price: p.price,
    type: p.type,
    city: p.city,
    neighborhood: p.neighborhood,
    bedrooms: p.bedrooms,
    suites: p.suites,
    builtArea: p.builtArea,
    brokerId: p.brokerId,
    images: p.images,
  }));

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#0F1115]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Pipeline & Curadoria de Imóveis
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
            Gestão de Leads & Dossiês ({leads.length})
          </h1>
          <p className="text-xs text-[#68655F] font-light mt-0.5">
            Visualize os contatos, monte seleções personalizadas de casas parecidas e envie dossiês exclusivos diretamente no WhatsApp dos clientes.
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-12 text-center rounded-sm space-y-3">
          <Users className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-serif text-xl text-[#0F1115]">
            Nenhum lead recebido até o momento
          </h3>
          <p className="text-xs text-[#8C8983] max-w-sm mx-auto">
            Assim que clientes demonstrarem interesse em suas propriedades no portal, eles aparecerão aqui com a opção de criar seleções de casas personalizadas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              availableProperties={availableProperties}
              currentBrokerId={brokerId}
              currentBrokerName={session.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
