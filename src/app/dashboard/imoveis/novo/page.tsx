import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PropertyCreateForm } from "./PropertyCreateForm";
import { ChevronRight } from "lucide-react";

export default async function NovoImovelPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let canAssignBroker = session.role === "ADMIN";
  if (!canAssignBroker && session.brokerId) {
    const brokerRec = await prisma.broker.findUnique({
      where: { id: session.brokerId },
      select: { canAssignBroker: true },
    });
    canAssignBroker = !!brokerRec?.canAssignBroker;
  }

  let brokers: { id: string; name: string; creci: string; photoUrl: string }[] = [];
  if (canAssignBroker) {
    brokers = await prisma.broker.findMany({
      where: { active: true },
      select: { id: true, name: true, creci: true, photoUrl: true },
      orderBy: { name: "asc" },
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8983]">
        <Link href="/dashboard" className="hover:text-[#0F1115]">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/dashboard/imoveis" className="hover:text-[#0F1115]">
          Imóveis
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0F1115] font-medium">Novo Cadastro</span>
      </div>

      <div className="border-b border-[#0F1115]/10 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
          Cadastro de Propriedade
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#0F1115] mt-1">
          Adicionar Nova Residência ao Acervo
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Preencha os detalhes arquitetônicos, dimensões e adicione fotografias em alta resolução.
        </p>
      </div>

      <PropertyCreateForm
        canAssignBroker={canAssignBroker}
        brokers={brokers}
        currentBrokerId={session.brokerId || undefined}
      />
    </div>
  );
}
