import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProfileEditForm } from "./ProfileEditForm";

export const metadata = {
  title: "Editar Perfil Profissional | Painel do Corretor",
};

export default async function DashboardPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Buscar usuário completo e perfil de corretor sincronizado
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      brokerProfile: true,
    },
  });

  if (!user) redirect("/login");

  const broker = user.brokerProfile;

  // Contagem de imóveis vinculados a este corretor
  let propertyCount = 0;
  if (broker) {
    propertyCount = await prisma.property.count({
      where: { brokerId: broker.id },
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="border-b border-[#0F1115]/10 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
          Configurações de Conta
        </span>
        <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
          Meu Perfil Profissional
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Gerencie seu nome, fotografia de alta definição, WhatsApp direto, CRECI e biografia institucional.
        </p>
      </div>

      <ProfileEditForm
        initialUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        initialBroker={
          broker
            ? {
                id: broker.id,
                name: broker.name,
                email: broker.email,
                phone: broker.phone,
                whatsapp: broker.whatsapp,
                creci: broker.creci,
                photoUrl: broker.photoUrl,
                bio: broker.bio,
                active: broker.active,
              }
            : null
        }
        propertyCount={propertyCount}
      />
    </div>
  );
}
