import React from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PropertyEditForm } from "./PropertyEditForm";
import { ChevronRight } from "lucide-react";

interface EditarImovelPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarImovelPage({ params }: EditarImovelPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const property = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: { orderBy: { order: "asc" } },
      features: true,
      broker: true,
    },
  });

  if (!property) {
    notFound();
  }

  let canEdit = session.role === "ADMIN";
  if (!canEdit && session.brokerId) {
    if (property.brokerId === session.brokerId) {
      canEdit = true;
    } else {
      const brokerRec = await prisma.broker.findUnique({
        where: { id: session.brokerId },
        select: { canAssignBroker: true },
      });
      canEdit = !!brokerRec?.canAssignBroker;
    }
  }

  if (!canEdit) {
    redirect("/dashboard/imoveis");
  }

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
        <span className="text-[#0F1115] font-medium">Editar Imóvel</span>
      </div>

      <div className="border-b border-[#0F1115]/10 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
          Edição de Propriedade
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#0F1115] mt-1">
          {property.title}
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Atualize fotos, valores, status de publicação e detalhes arquitetônicos deste imóvel.
        </p>
      </div>

      <PropertyEditForm
        property={property}
        canAssignBroker={canAssignBroker}
        brokers={brokers}
      />
    </div>
  );
}
