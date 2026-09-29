import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleBrokerStatusAction, deleteBrokerAction, impersonateBrokerAction } from "@/actions/brokerActions";
import { BrokerCreateModal } from "./BrokerCreateModal";
import { BrokerEditModal } from "./BrokerEditModal";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Building2, Users, Trash2, LogIn } from "lucide-react";

export default async function AdminCorretoresPage() {
  const brokers = await prisma.broker.findMany({
    include: {
      _count: {
        select: {
          properties: true,
          leads: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0F1115]/10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Governança da Equipe
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
            Gerenciar Corretores Associados ({brokers.length})
          </h1>
          <p className="text-xs text-[#68655F] font-light mt-0.5">
            Cadastre novos consultores, audite carteiras ativas e altere permissões de acesso.
          </p>
        </div>

        <BrokerCreateModal />
      </div>

      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F1EA] text-[11px] uppercase tracking-wider text-[#6B6862] border-b border-[#0F1115]/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Corretor</th>
                <th className="py-3.5 px-4 font-semibold">Registro CRECI</th>
                <th className="py-3.5 px-4 font-semibold">Contatos</th>
                <th className="py-3.5 px-4 font-semibold text-center">Imóveis</th>
                <th className="py-3.5 px-4 font-semibold text-center">Leads</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F1115]/5 text-xs text-[#38352F]">
              {brokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={broker.photoUrl}
                        alt={broker.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#0F1115]/10"
                      />
                      <div>
                        <span className="font-semibold text-[#0F1115] block">
                          {broker.name}
                        </span>
                        <span className="text-[11px] text-[#8C8983]">
                          {broker.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-[#0F1115]">
                    {broker.creci}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="block text-[#0F1115]">{broker.phone}</span>
                    <span className="text-[10px] text-[#8C8983] font-mono">
                      WA: +{broker.whatsapp}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {broker._count.properties}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {broker._count.leads}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={broker.active ? "success" : "sand"}>
                      {broker.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await impersonateBrokerAction(broker.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0D12] text-[#D4AF37] hover:bg-[#1E2330] rounded-xs text-[11px] font-semibold tracking-wider uppercase transition-all shadow-xs"
                          title={`Acessar o painel exclusivo de ${broker.name}`}
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Acessar Painel</span>
                        </button>
                      </form>

                      <BrokerEditModal
                        broker={{
                          id: broker.id,
                          name: broker.name,
                          email: broker.email,
                          phone: broker.phone,
                          whatsapp: broker.whatsapp,
                          creci: broker.creci,
                          photoUrl: broker.photoUrl,
                          bio: broker.bio,
                        }}
                      />

                      <Link
                        href={`/corretores/${broker.id}`}
                        target="_blank"
                        className="p-1.5 text-[#8C8983] hover:text-[#0F1115] transition-colors rounded-xs hover:bg-[#F4F1EA]"
                        title="Ver perfil público"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <form
                        action={async () => {
                          "use server";
                          await toggleBrokerStatusAction(broker.id);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs px-2.5 py-1 rounded-xs font-medium transition-colors ${
                            broker.active
                              ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {broker.active ? "Desativar" : "Ativar"}
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";
                          await deleteBrokerAction(broker.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors"
                          title="Remover consultor do acervo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
