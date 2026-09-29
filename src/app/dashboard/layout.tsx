import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/actions/authActions";
import { siteConfig } from "@/config/site";
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  Users,
  User,
  LogOut,
  ExternalLink,
  Shield,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const navItems = [
    { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { label: "Meus Imóveis", href: "/dashboard/imoveis", icon: Home },
    { label: "Cadastrar Imóvel", href: "/dashboard/imoveis/novo", icon: PlusCircle },
    { label: "Leads & Contatos", href: "/dashboard/leads", icon: Users },
    { label: "Meu Perfil", href: "/dashboard/perfil", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F1EA]">
      {/* Sidebar Privada do Corretor */}
      <aside className="w-full md:w-64 bg-[#0B0D12] text-[#FBF9F5] border-r border-white/[0.08] flex flex-col shrink-0">
        
        {/* Identidade no Topo da Sidebar */}
        <div className="p-6 border-b border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#C5A880] flex items-center justify-center text-[#C5A880] font-serif text-sm tracking-widest">
              {siteConfig.logoText}
            </div>
            <div>
              <span className="font-serif text-sm tracking-wider uppercase block text-[#FBF9F5]">
                {siteConfig.name}
              </span>
              <span className="text-[10px] tracking-widest text-[#C5A880] uppercase font-mono">
                Área do Corretor
              </span>
            </div>
          </Link>

          {/* Card de Boas-vindas do Corretor Logado */}
          <div className="mt-5 p-3 bg-white/[0.04] border border-white/[0.06] rounded-xs">
            <span className="text-[10px] text-[#8C8983] uppercase tracking-wider block font-light">
              Conectado como:
            </span>
            <p className="text-xs font-medium text-[#FBF9F5] truncate mt-0.5">
              {session.name}
            </p>
            <span className="inline-block mt-1 text-[9px] uppercase tracking-widest bg-[#C5A880]/20 text-[#E5D7C3] px-2 py-0.5 rounded-xs font-mono">
              {session.role === "ADMIN" ? "Diretoria (Admin)" : "Consultor Autorizado"}
            </span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs uppercase tracking-wider text-[#A5A29A] hover:text-[#FBF9F5] hover:bg-white/[0.05] transition-all font-medium"
              >
                <Icon className="w-4 h-4 text-[#C5A880]" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {session.role === "ADMIN" && (
            <div className="pt-4 mt-4 border-t border-white/[0.08]">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs uppercase tracking-wider text-[#C5A880] hover:bg-white/[0.05] transition-all font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Painel Admin Geral</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Rodapé da Sidebar: Ir ao Site & Logout */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#8C8983] hover:text-[#FBF9F5] transition-colors"
          >
            <span>Ver Portal Público</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
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

      {/* Conteúdo Dinâmico da Página */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
