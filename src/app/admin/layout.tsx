import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/actions/authActions";
import { siteConfig } from "@/config/site";
import {
  ShieldAlert,
  Building,
  UserCheck,
  Inbox,
  Sliders,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Estrito para ADMIN
  if (session.role !== "ADMIN" && !session.impersonatedBy) {
    redirect("/dashboard");
  }

  const adminNavItems = [
    { label: "Visão Executiva", href: "/admin", icon: ShieldAlert },
    { label: "Gestão Global de Imóveis", href: "/admin/imoveis", icon: Building },
    { label: "Gerenciar Corretores", href: "/admin/corretores", icon: UserCheck },
    { label: "Todos os Leads", href: "/admin/leads", icon: Inbox },
    { label: "Configurações da Marca", href: "/admin/configuracoes", icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F1EA]">
      {/* Sidebar do Administrador */}
      <aside className="w-full md:w-64 bg-[#0B0D12] text-[#FBF9F5] border-r border-white/[0.08] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif text-sm tracking-widest bg-[#161922]">
              {siteConfig.logoText}
            </div>
            <div>
              <span className="font-serif text-sm tracking-wider uppercase block text-[#FBF9F5]">
                {siteConfig.name}
              </span>
              <span className="text-[10px] tracking-widest text-amber-400 uppercase font-mono">
                Painel Administrativo
              </span>
            </div>
          </Link>

          <div className="mt-5 p-3 bg-amber-950/20 border border-amber-700/30 rounded-xs">
            <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-mono">
              Acesso Master
            </span>
            <p className="text-xs font-semibold text-[#FBF9F5] truncate mt-0.5">
              {session.name}
            </p>
            <span className="text-[10px] text-[#8C8983] truncate block">
              {session.email}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs uppercase tracking-wider text-[#A5A29A] hover:text-[#FBF9F5] hover:bg-white/[0.05] transition-all font-medium"
              >
                <Icon className="w-4 h-4 text-[#D4AF37]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#8C8983] hover:text-[#FBF9F5] transition-colors"
          >
            <span>Ver Portal Público</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar Sessão</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
