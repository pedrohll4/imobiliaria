import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  Building2,
  Eye,
  Users,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Buscar dados associados ao corretor ou geral se for admin
  const brokerId = session.brokerId;

  const propertyWhere = brokerId ? { brokerId } : {};
  const leadWhere = brokerId ? { brokerId } : {};

  const [totalProperties, activeProperties, soldProperties, totalViews, leads] =
    await Promise.all([
      prisma.property.count({ where: propertyWhere }),
      prisma.property.count({ where: { ...propertyWhere, status: "PUBLICADO" } }),
      prisma.property.count({ where: { ...propertyWhere, status: "VENDIDO" } }),
      prisma.property.aggregate({
        where: propertyWhere,
        _sum: { views: true },
      }),
      prisma.lead.findMany({
        where: leadWhere,
        include: {
          property: { select: { title: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  const totalLeadsCount = await prisma.lead.count({ where: leadWhere });
  const scheduledVisitsCount = await prisma.lead.count({
    where: { ...leadWhere, status: "VISITA_AGENDADA" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NOVO":
        return <Badge variant="champagne">Novo Lead</Badge>;
      case "EM_ATENDIMENTO":
        return <Badge variant="warning">Em Atendimento</Badge>;
      case "VISITA_AGENDADA":
        return <Badge variant="success">Visita Agendada</Badge>;
      case "PROPOSTA":
        return <Badge variant="dark">Proposta</Badge>;
      case "FECHADO":
        return <Badge variant="success">Fechado</Badge>;
      case "PERDIDO":
        return <Badge variant="sand">Perdido</Badge>;
      default:
        return <Badge variant="sand">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Topo: Boas-vindas & Ação Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0F1115]/10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
            Painel de Controle
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F1115] mt-1">
            Olá, {session.name}
          </h1>
          <p className="text-sm text-[#68655F] font-light mt-0.5">
            Acompanhe a performance do seu portfólio de imóveis e o fluxo de potenciais clientes.
          </p>
        </div>

        <Link
          href="/dashboard/imoveis/novo"
          className="inline-flex items-center gap-2 bg-[#0B0D12] text-[#FBF9F5] text-xs uppercase tracking-widest px-5 py-3 rounded-sm font-semibold hover:bg-[#1E2330] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Cadastrar Novo Imóvel</span>
        </Link>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Imóveis Ativos */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#8C8983] font-medium">
              Imóveis Ativos
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#C5A880]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-[#0F1115]">
              {activeProperties}
            </span>
            <span className="text-xs text-[#8C8983]">
              de {totalProperties} total
            </span>
          </div>
          <div className="text-[11px] text-[#6B6862] flex items-center gap-1 font-light">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{soldProperties} comercializados</span>
          </div>
        </div>

        {/* Visualizações Totais */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#8C8983] font-medium">
              Visualizações
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#C5A880]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-[#0F1115]">
              {totalViews._sum.views || 0}
            </span>
            <span className="text-xs text-[#8C8983]">acessos</span>
          </div>
          <div className="text-[11px] text-[#6B6862] font-light">
            Visualizações nos portais e páginas
          </div>
        </div>

        {/* Leads Recebidos */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#8C8983] font-medium">
              Leads Recebidos
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#C5A880]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-[#0F1115]">
              {totalLeadsCount}
            </span>
            <span className="text-xs text-[#8C8983]">interessados</span>
          </div>
          <div className="text-[11px] text-[#6B6862] font-light">
            Formulários de contato do portal
          </div>
        </div>

        {/* Visitas Agendadas */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#8C8983] font-medium">
              Visitas Agendadas
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#C5A880]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-[#0F1115]">
              {scheduledVisitsCount}
            </span>
            <span className="text-xs text-[#8C8983]">confirmadas</span>
          </div>
          <div className="text-[11px] text-[#6B6862] font-light">
            Compromissos presenciais
          </div>
        </div>
      </div>

      {/* Gráficos de Performance e Resumo de Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gráfico Visual Elegante de Desempenho */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-[#0F1115]">
                Interesse e Acessos nos Últimos Dias
              </h2>
              <p className="text-xs text-[#8C8983] font-light">
                Média semanal estimada de engajamento do portfólio
              </p>
            </div>
            <span className="text-xs font-mono text-[#C5A880] uppercase tracking-wider">
              Últimos 30 Dias
            </span>
          </div>

          {/* Gráfico em barras minimalista */}
          <div className="space-y-4 pt-4">
            {[
              { label: "Triplex Bauhaus Jardins", views: 820, percent: 92 },
              { label: "Villa Pé na Areia Trancoso", views: 640, percent: 74 },
              { label: "Pavilhão Fazenda Boa Vista", views: 510, percent: 62 },
              { label: "Apartamento Vista Mar Leblon", views: 480, percent: 55 },
              { label: "Mansão Alphaville 01", views: 390, percent: 45 },
            ].map((bar, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0F1115]">{bar.label}</span>
                  <span className="font-mono text-[#8C8983]">{bar.views} views</span>
                </div>
                <div className="w-full h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B0D12] to-[#C5A880] rounded-full transition-all duration-1000"
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Leads Recebidos */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#0F1115]/10 pb-4">
              <h2 className="font-serif text-xl text-[#0F1115]">
                Últimos Leads
              </h2>
              <Link
                href="/dashboard/leads"
                className="text-xs uppercase tracking-wider text-[#C5A880] hover:text-[#8E6F3E] font-medium"
              >
                Ver Todos →
              </Link>
            </div>

            {leads.length === 0 ? (
              <p className="text-xs text-[#8C8983] py-8 text-center">
                Nenhum lead recebido até o momento.
              </p>
            ) : (
              <div className="divide-y divide-[#0F1115]/5 mt-2">
                {leads.map((lead) => (
                  <div key={lead.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F1115]">
                        {lead.name}
                      </span>
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-[11px] text-[#6B6862] truncate">
                      {lead.property ? `Imóvel: ${lead.property.title} (${lead.property.code})` : "Contato direto"}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#8C8983]">
                      <span>{lead.phone}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#0F1115]/10">
            <Link
              href="/dashboard/leads"
              className="w-full inline-flex items-center justify-center gap-2 text-xs uppercase tracking-widest bg-[#F4F1EA] hover:bg-[#EAE7DF] text-[#0F1115] py-2.5 rounded-xs transition-colors font-medium"
            >
              <span>Gerenciar Pipeline de Leads</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
