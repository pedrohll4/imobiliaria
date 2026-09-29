"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Menu, X, ArrowUpRight, User, Shield } from "lucide-react";
import { SessionPayload } from "@/lib/auth";

interface NavbarProps {
  session?: SessionPayload | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Imóveis", href: "/imoveis" },
    { label: "Corretores", href: "/corretores" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#0F1115]/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Provisória Elegante */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border border-[#0B0D12] flex items-center justify-center bg-[#0B0D12] text-[#FBF9F5] font-serif text-lg tracking-widest transition-transform group-hover:scale-95 duration-300">
              {siteConfig.logoText}
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-widest text-[#0B0D12] font-medium leading-none uppercase">
                {siteConfig.name}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#8C8983] uppercase mt-1 font-light">
                {siteConfig.shortName} Privativo
              </span>
            </div>
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.18em] text-[#4A4742] hover:text-[#0B0D12] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A880] hover:after:w-full after:transition-all after:duration-300 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Área de Acesso / CTA */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-[#0B0D12] text-[#FBF9F5] px-4 py-2.5 rounded-sm hover:bg-[#1E2330] transition-colors font-medium"
                >
                  {session.role === "ADMIN" ? (
                    <>
                      <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                      Painel Admin
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-[#C5A880]" />
                      Meu Painel
                    </>
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs uppercase tracking-widest text-[#4A4742] hover:text-[#0B0D12] px-3 py-2 border border-transparent hover:border-[#0F1115]/20 rounded-sm transition-all font-medium"
              >
                Acesso Corretor
              </Link>
            )}

            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de receber uma consultoria privativa sobre os imóveis de alto padrão.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-[#C5A880] text-[#0B0D12] font-semibold px-4 py-2.5 rounded-sm hover:bg-[#B39366] transition-all shadow-sm"
            >
              Atendimento Privativo
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Botão Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0B0D12] focus:outline-none"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Gaveta Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF9F5] border-b border-[#0F1115]/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider text-[#0B0D12] py-2 border-b border-[#0F1115]/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            {session ? (
              <Link
                href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs uppercase tracking-widest bg-[#0B0D12] text-[#FBF9F5] py-3 rounded-sm"
              >
                {session.role === "ADMIN" ? "Painel Admin" : "Meu Painel"}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs uppercase tracking-widest border border-[#0B0D12]/20 text-[#0B0D12] py-3 rounded-sm"
              >
                Acesso Corretor
              </Link>
            )}

            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de receber uma consultoria privativa sobre os imóveis de alto padrão.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center text-xs uppercase tracking-widest bg-[#C5A880] text-[#0B0D12] font-semibold py-3 rounded-sm flex items-center justify-center gap-1.5"
            >
              Atendimento Privativo
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
