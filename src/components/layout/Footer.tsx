import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "lucide-react";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";

interface FooterProps {
  settings?: {
    name?: string;
    tagline?: string;
    logoText?: string;
    logoUrl?: string | null;
    phone?: string;
    whatsapp?: string;
    email?: string;
    creciJ?: string;
    address?: {
      street?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
}

export function Footer({ settings }: FooterProps) {
  const brandName = settings?.name || siteConfig.name;
  const logoText = settings?.logoText || siteConfig.logoText;
  const logoUrl = settings?.logoUrl || siteConfig.logoUrl;
  const creciJ = settings?.creciJ || siteConfig.contact.creciJ;
  const street = settings?.address?.street || siteConfig.contact.address.street;
  const neighborhood = settings?.address?.neighborhood || siteConfig.contact.address.neighborhood;
  const city = settings?.address?.city || siteConfig.contact.address.city;
  const state = settings?.address?.state || siteConfig.contact.address.state;
  const zipCode = settings?.address?.zipCode || siteConfig.contact.address.zipCode;
  const phone = settings?.phone || siteConfig.contact.phone;
  const email = settings?.email || siteConfig.contact.email;
  const whatsapp = settings?.whatsapp || siteConfig.contact.whatsapp;

  return (
    <footer className="bg-[#0B0D12] text-[#FBF9F5] border-t border-white/[0.08] pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Topo do Footer: Marca & Tagline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-white/[0.08]">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-10 max-w-[180px] object-contain"
                />
              ) : (
                <div className="w-9 h-9 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif text-base tracking-widest">
                  {logoText}
                </div>
              )}
              <span className="font-serif text-xl tracking-widest text-[#FBF9F5] font-light uppercase">
                {brandName}
              </span>
            </div>
            <p className="text-sm text-[#A5A29A] font-light leading-relaxed max-w-md">
              Intermediação e curadoria de imóveis singulares, residências assinadas e investimentos imobiliários com discrição e sofisticação incomparáveis.
            </p>
            {creciJ && (
              <div className="pt-2">
                <span className="inline-block text-[11px] uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1">
                  {creciJ}
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-[#A5A29A] font-light">
              <li>
                <Link href="/imoveis" className="hover:text-[#FBF9F5] transition-colors">
                  Portfólio de Imóveis
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="hover:text-[#FBF9F5] transition-colors">
                  Propriedades à Venda
                </Link>
              </li>
              <li>
                <Link href="/imoveis?type=CONDOMINIO" className="hover:text-[#FBF9F5] transition-colors">
                  Casas em Condomínio
                </Link>
              </li>
              <li>
                <Link href="/corretores" className="hover:text-[#FBF9F5] transition-colors">
                  Nossos Especialistas
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-[#FBF9F5] transition-colors">
                  Sobre a Imobiliária
                </Link>
              </li>
              <li className="pt-2 border-t border-white/[0.06]">
                <PwaInstallButton variant="link" />
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
              Sede Corporativa
            </h4>
            <div className="text-sm text-[#A5A29A] font-light space-y-1 leading-relaxed">
              {street && <p>{street}</p>}
              {city && <p>{neighborhood} — {city}/{state}</p>}
              {zipCode && <p>CEP: {zipCode}</p>}
              {phone && <p className="pt-2 text-[#FBF9F5]">Telefone: {phone}</p>}
              {email && <p className="text-[#FBF9F5]">E-mail: {email}</p>}
            </div>
            {whatsapp && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Desejo atendimento exclusivo.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#F6EEDA] transition-colors uppercase tracking-wider font-medium"
                >
                  Conectar via WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6F6C66] font-light">
          <div>
            <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#A5A29A] transition-colors">
              Acesso Restrito
            </Link>
            <Link href="/sobre" className="hover:text-[#A5A29A] transition-colors">
              Privacidade & Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
