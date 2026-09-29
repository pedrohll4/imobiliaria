import React from "react";
import { prisma } from "@/lib/prisma";
import { LeadStatusSelector } from "@/app/dashboard/leads/LeadStatusSelector";
import { Inbox } from "lucide-react";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      property: {
        select: { id: true, title: true, code: true },
      },
      broker: {
        select: { name: true, creci: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#0F1115]/10">
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

      {leads.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-12 text-center rounded-sm space-y-3">
          <Inbox className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-serif text-xl text-[#0F1115]">
            Nenhum lead registrado no sistema
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="relative">
              {lead.broker && (
                <div className="mb-1 text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider bg-[#F4F1EA] px-2.5 py-0.5 rounded-xs text-[#4A4742]">
                    Atribuído a: <strong>{lead.broker.name}</strong> ({lead.broker.creci})
                  </span>
                </div>
              )}
              <LeadStatusSelector lead={lead} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
