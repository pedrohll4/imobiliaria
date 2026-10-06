import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deletePropertyAction } from "@/actions/propertyActions";
import { PropertyBrokerReassignSelect } from "@/components/property/PropertyBrokerReassignSelect";
import { Plus, Eye, ExternalLink, Trash2, Building, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DashboardImoveisPageProps {
  searchParams?: Promise<{ filter?: string }>;
}

export default async function DashboardImoveisPage({ searchParams }: DashboardImoveisPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  let canManageTeam = session.role === "ADMIN";
  if (!canManageTeam && session.brokerId) {
    const brokerRec = await prisma.broker.findUnique({
      where: { id: session.brokerId },
      select: { canAssignBroker: true },
    });
    canManageTeam = !!brokerRec?.canAssignBroker;
  }

  const { filter = canManageTeam ? "todos" : "meus" } = (await searchParams) || {};

  const where = canManageTeam
    ? filter === "meus" && session.brokerId
      ? { brokerId: session.brokerId }
      : {}
    : { brokerId: session.brokerId || "unassigned-security-block" };

  let brokers: { id: string; name: string; creci: string }[] = [];
  if (canManageTeam) {
    brokers = await prisma.broker.findMany({
      where: { active: true },
      select: { id: true, name: true, creci: true },
      orderBy: { name: "asc" },
    });
  }

  const properties = await prisma.property.findMany({
    where,
    include: {
      broker: {
        select: {
          id: true,
          name: true,
          creci: true,
          photoUrl: true,
        },
      },
      images: { where: { isMain: true }, take: 1 },
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0F1115]/10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-1.5">
            {canManageTeam && <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />}
            {canManageTeam ? "Gestão de Carteira & Equipe" : "Gestão de Carteira"}
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
            {canManageTeam
              ? filter === "meus"
                ? `Meus Imóveis Pessoais (${properties.length})`
                : `Acervo Completo & Equipe (${properties.length})`
              : `Meus Imóveis Cadastrados (${properties.length})`}
          </h1>
          <p className="text-xs text-[#68655F] font-light mt-0.5">
            {canManageTeam
              ? "Você possui permissão especial para gerenciar e cadastrar imóveis em nome de outros consultores da equipe."
              : "Gerencie o status, visualizações e detalhes das suas propriedades ativas."}
          </p>
        </div>

        <Link
          href="/dashboard/imoveis/novo"
          className="inline-flex items-center gap-2 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest px-5 py-3 rounded-sm font-semibold hover:bg-[#1E2330] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Cadastrar Imóvel</span>
        </Link>
      </div>

      {/* Abas de Filtro para Corretores Gestores e Admins */}
      {canManageTeam && (
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/imoveis?filter=todos"
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
              filter === "todos"
                ? "bg-[#0B0D12] text-[#D4AF37] shadow-xs"
                : "bg-white text-[#68655F] hover:text-[#0F1115] border border-[#0F1115]/10"
            }`}
          >
            Todos os Imóveis da Equipe
          </Link>
          <Link
            href="/dashboard/imoveis?filter=meus"
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
              filter === "meus"
                ? "bg-[#0B0D12] text-[#D4AF37] shadow-xs"
                : "bg-white text-[#68655F] hover:text-[#0F1115] border border-[#0F1115]/10"
            }`}
          >
            Apenas Meus Imóveis
          </Link>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 p-12 text-center rounded-sm space-y-4">
          <Building className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-serif text-xl text-[#0F1115]">
            Nenhum imóvel encontrado
          </h3>
          <p className="text-xs text-[#8C8983] max-w-sm mx-auto">
            {filter === "meus"
              ? "Você ainda não possui imóveis diretamente atribuídos a você."
              : "Nenhuma residência de alto padrão foi cadastrada no sistema ainda."}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/imoveis/novo"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0B0D12] text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm font-semibold"
            >
              Cadastrar Agora
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F4F1EA] text-[11px] uppercase tracking-wider text-[#6B6862] border-b border-[#0F1115]/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Imóvel / Código</th>
                  {canManageTeam && (
                    <th className="py-3.5 px-4 font-semibold">Corretor Titular</th>
                  )}
                  <th className="py-3.5 px-4 font-semibold">Tipologia</th>
                  <th className="py-3.5 px-4 font-semibold">Finalidade</th>
                  <th className="py-3.5 px-4 font-semibold">Valor</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Visualizações</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Leads</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F1115]/5 text-xs text-[#38352F]">
                {properties.map((prop) => {
                  const mainImg = prop.images[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80";
                  const formattedPrice = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(prop.price);

                  return (
                    <tr key={prop.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImg}
                            alt={prop.title}
                            className="w-12 h-12 rounded-xs object-cover border border-[#0F1115]/10"
                          />
                          <div>
                            <span className="font-semibold text-[#0F1115] block line-clamp-1">
                              {prop.title}
                            </span>
                            <span className="font-mono text-[10px] text-[#8C8983]">
                              {prop.code} • {prop.neighborhood}, {prop.city}
                            </span>
                          </div>
                        </div>
                      </td>
                      {canManageTeam && (
                        <td className="py-3.5 px-4">
                          <PropertyBrokerReassignSelect
                            propertyId={prop.id}
                            currentBrokerId={prop.brokerId}
                            brokers={brokers}
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-4">
                        <Badge variant="sand" className="text-[10px]">
                          {prop.type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="champagne"
                          className="text-[10px]"
                        >
                          Venda
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#0F1115]">
                        {formattedPrice}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            prop.status === "PUBLICADO"
                              ? "success"
                              : prop.status === "VENDIDO"
                              ? "dark"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {prop.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="inline-flex items-center gap-1 text-[#6B6862]">
                          <Eye className="w-3 h-3 text-[#D4AF37]" />
                          {prop.views}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">
                        {prop._count.leads}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/imoveis/${prop.id}`}
                            target="_blank"
                            className="p-1.5 text-[#8C8983] hover:text-[#0F1115] transition-colors"
                            title="Ver no site público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          
                          <form
                            action={async () => {
                              "use server";
                              await deletePropertyAction(prop.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                              title="Excluir imóvel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
