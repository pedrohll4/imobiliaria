import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ChevronRight, Sparkles } from "lucide-react";
import { ManualLeadForm } from "./ManualLeadForm";

export default async function NovoLeadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canAssignBroker = session.role === "ADMIN";

  let brokers: { id: string; name: string; creci: string }[] = [];
  if (canAssignBroker) {
    brokers = await prisma.broker.findMany({
      where: { active: true },
      select: { id: true, name: true, creci: true },
      orderBy: { name: "asc" },
    });
  }

  const rawProperties = await prisma.property.findMany({
    where: { status: "PUBLICADO" },
    select: {
      id: true,
      code: true,
      title: true,
      price: true,
      neighborhood: true,
      city: true,
    },
    orderBy: { code: "asc" },
  });

  const properties = rawProperties.map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    price: p.price,
    neighborhood: p.neighborhood,
    city: p.city,
  }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8983]">
        <Link href="/dashboard" className="hover:text-[#0F1115]">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/dashboard/leads" className="hover:text-[#0F1115]">
          Leads & Contatos
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0F1115] font-medium">Novo Lead Manual</span>
      </div>

      <div className="border-b border-[#0F1115]/10 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          Prospecção Ativa & Atendimento
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#0F1115] mt-1">
          Cadastrar Lead Manualmente
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Adicione informações de contatos captados por telefone, indicação, WhatsApp particular ou atendimento presencial.
        </p>
      </div>

      <ManualLeadForm
        properties={properties}
        brokers={brokers}
        canAssignBroker={canAssignBroker}
        currentBrokerId={session.brokerId || undefined}
        currentBrokerName={session.name}
      />
    </div>
  );
}
