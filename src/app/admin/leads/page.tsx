import React from "react";
import { prisma } from "@/lib/prisma";
import { LeadStatusSelector } from "@/app/dashboard/leads/LeadStatusSelector";
import { CreateLeadButton } from "@/components/leads/CreateLeadButton";
import { Inbox } from "lucide-react";

export default async function AdminLeadsPage() {
  const [leads, rawProperties, brokers] = await Promise.all([
    prisma.lead.findMany({
      include: {
        property: {
          select: { id: true, title: true, code: true },
        },
        broker: {
          select: { id: true, name: true, creci: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      where: { status: "PUBLICADO" },
      select: { id: true, code: true, title: true, price: true, neighborhood: true, city: true },
      orderBy: { code: "asc" },
    }),
    prisma.broker.findMany({
      where: { active: true },
      select: { id: true, name: true, creci: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const properties = rawProperties.map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    price: p.price,
    neighborhood: p.neighborhood,
    city: p.city,
  }));

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#0F1115]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Central de Atendimentos
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
            Todos os Leads da Plataforma ({leads.length})
          </h1>
          <p className="text-xs text-[#68655F] font-light mt-0.5">
            Visão holística de todos os clientes em prospecção e corretores responsáveis pelo atendimento.
          </p>
        </div>

        <div className="shrink-0">
          <CreateLeadButton
            properties={properties}
            brokers={brokers}
            canAssignBroker={true}
          />
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-12 text-center rounded-sm space-y-4">
          <Inbox className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-serif text-xl text-[#0F1115]">
            Nenhum lead registrado no sistema
          </h3>
          <p className="text-xs text-[#8C8983] max-w-sm mx-auto">
            Não há leads cadastrados ainda. Você pode registrar leads manualmente a qualquer momento.
          </p>
          <div className="pt-2">
            <CreateLeadButton
              properties={properties}
              brokers={brokers}
              canAssignBroker={true}
              label="Cadastrar Primeiro Lead"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="relative">
              <LeadStatusSelector
                lead={lead}
                brokers={brokers}
                isAdmin={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
