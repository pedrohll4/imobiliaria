import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building,
  UserCheck,
  Inbox,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function AdminOverviewPage() {
  const [
    totalProperties,
    activeProperties,
    totalPortfolio,
    totalBrokers,
    totalLeads,
    recentProperties,
    recentLeads,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "PUBLICADO" } }),
    prisma.property.aggregate({
      _sum: { price: true },
    }),
    prisma.broker.count({ where: { active: true } }),
    prisma.lead.count(),
    prisma.property.findMany({
      include: { broker: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.lead.findMany({
      include: {
        broker: { select: { name: true } },
        property: { select: { title: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const formattedPortfolioValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(totalPortfolio._sum.price || 0);

  return (
    <div className="space-y-8">
      {/* Topo da Visão Executiva */}
      <div className="pb-6 border-b border-[#0F1115]/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold font-mono">
            Painel Executivo da Diretoria
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F1115] mt-1">
          Visão Geral da Operação Imobiliária
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Métricas consolidadas de captação, carteira de corretores e conversão de leads.
        </p>
      </div>

      {/* Grid de Métricas Executivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C8983] uppercase tracking-wider font-medium">
            <span>Valor de Carteira</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal text-[#0F1115]">
            {formattedPortfolioValue}
          </p>
          <p className="text-[11px] text-[#6B6862] font-light">
            Soma dos imóveis ativos no portfólio
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C8983] uppercase tracking-wider font-medium">
            <span>Total de Imóveis</span>
            <Building className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-3xl font-normal text-[#0F1115]">
            {totalProperties}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            {activeProperties} imóveis publicados publicamente
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C8983] uppercase tracking-wider font-medium">
            <span>Corretores Ativos</span>
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-3xl font-normal text-[#0F1115]">
            {totalBrokers}
          </p>
          <p className="text-[11px] text-[#6B6862] font-light">
            Especialistas credenciados com CRECI
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C8983] uppercase tracking-wider font-medium">
            <span>Volume de Leads</span>
            <Inbox className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-3xl font-normal text-[#0F1115]">
            {totalLeads}
          </p>
          <p className="text-[11px] text-[#6B6862] font-light">
            Interações e solicitações registradas
          </p>
        </div>
      </div>

      {/* Tabelas de Acompanhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimos Imóveis Cadastrados */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-[#0F1115]/10 pb-3">
            <h2 className="font-serif text-xl text-[#0F1115]">
              Últimos Imóveis Cadastrados
            </h2>
            <Link
              href="/admin/imoveis"
              className="text-xs uppercase tracking-wider text-[#D4AF37] hover:text-[#9B7826] font-medium"
            >
              Gerenciar Todos →
            </Link>
          </div>

          <div className="divide-y divide-[#0F1115]/5 text-xs">
            {recentProperties.map((prop) => (
              <div key={prop.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#0F1115] block">
                    {prop.title}
                  </span>
                  <span className="text-[#8C8983]">
                    {prop.code} • Corretor: {prop.broker?.name || "Diretoria"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-[#0F1115] block">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(prop.price)}
                  </span>
                  <Badge variant="sand" className="text-[9px]">
                    {prop.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Leads Globais */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-[#0F1115]/10 pb-3">
            <h2 className="font-serif text-xl text-[#0F1115]">
              Últimos Leads na Plataforma
            </h2>
            <Link
              href="/admin/leads"
              className="text-xs uppercase tracking-wider text-[#D4AF37] hover:text-[#9B7826] font-medium"
            >
              Ver Todos os Leads →
            </Link>
          </div>

          <div className="divide-y divide-[#0F1115]/5 text-xs">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#0F1115] block">
                    {lead.name}
                  </span>
                  <span className="text-[#8C8983]">
                    {lead.property ? lead.property.code : "Geral"} • Atendido por:{" "}
                    {lead.broker?.name || "A distribuir"}
                  </span>
                </div>
                <Badge variant={lead.status === "NOVO" ? "champagne" : "sand"}>
                  {lead.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
