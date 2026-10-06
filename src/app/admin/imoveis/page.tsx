import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePropertyFeaturedAction, deletePropertyAction } from "@/actions/propertyActions";
import { PropertyBrokerReassignSelect } from "@/components/property/PropertyBrokerReassignSelect";
import { Star, Trash2, ExternalLink, Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function AdminImoveisPage() {
  const [properties, brokers] = await Promise.all([
    prisma.property.findMany({
      include: {
        broker: { select: { id: true, name: true, creci: true } },
        images: { where: { isMain: true }, take: 1 },
        _count: { select: { leads: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.broker.findMany({
      where: { active: true },
      select: { id: true, name: true, creci: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0F1115]/10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Governança da Plataforma
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
            Gestão Global de Imóveis ({properties.length})
          </h1>
          <p className="text-xs text-[#68655F] font-light mt-0.5">
            Gerencie o acervo total, defina os destaques da Home e audite as publicações dos corretores.
          </p>
        </div>

        <Link
          href="/dashboard/imoveis/novo"
          className="inline-flex items-center gap-2 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest px-5 py-3 rounded-sm font-semibold hover:bg-[#1E2330] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Novo Imóvel</span>
        </Link>
      </div>

      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F1EA] text-[11px] uppercase tracking-wider text-[#6B6862] border-b border-[#0F1115]/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Destaque</th>
                <th className="py-3.5 px-4 font-semibold">Imóvel / Código</th>
                <th className="py-3.5 px-4 font-semibold">Corretor</th>
                <th className="py-3.5 px-4 font-semibold">Tipologia</th>
                <th className="py-3.5 px-4 font-semibold">Valor</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
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
                    {/* Toggle Destaque na Home */}
                    <td className="py-3.5 px-4">
                      <form
                        action={async () => {
                          "use server";
                          await togglePropertyFeaturedAction(prop.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-1 rounded-xs transition-colors hover:scale-110"
                          title={prop.isFeatured ? "Remover dos destaques da Home" : "Destacar na Home"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              prop.isFeatured
                                ? "text-amber-500 fill-amber-500"
                                : "text-neutral-300 hover:text-amber-500"
                            }`}
                          />
                        </button>
                      </form>
                    </td>

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

                    <td className="py-3.5 px-4">
                      <PropertyBrokerReassignSelect
                        propertyId={prop.id}
                        currentBrokerId={prop.brokerId}
                        brokers={brokers}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="sand" className="text-[10px]">
                        {prop.type}
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

                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {prop._count.leads}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/imoveis/${prop.id}/editar`}
                          className="p-1.5 text-[#8C8983] hover:text-[#D4AF37] transition-colors"
                          title="Editar imóvel"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

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
    </div>
  );
}
