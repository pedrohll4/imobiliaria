import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LeadStatusSelector } from "./LeadStatusSelector";
import { Users } from "lucide-react";

export default async function DashboardLeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const brokerId = session.brokerId;
  const where = brokerId ? { brokerId } : {};

  const leads = await prisma.lead.findMany({
    where,
    include: {
      property: {
        select: { id: true, title: true, code: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#0F1115]/10">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
          Gestão de Atendimentos
        </span>
        <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
          Pipeline de Leads & Interessados ({leads.length})
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Atualize os estágios de atendimento de cada cliente e inicie contato imediato via WhatsApp.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-12 text-center rounded-sm space-y-3">
          <Users className="w-10 h-10 text-[#C5A880] mx-auto" />
          <h3 className="font-serif text-xl text-[#0F1115]">
            Nenhum lead recebido até o momento
          </h3>
          <p className="text-xs text-[#8C8983] max-w-sm mx-auto">
            Assim que visitantes demonstrarem interesse em suas propriedades no portal, eles aparecerão automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadStatusSelector key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
