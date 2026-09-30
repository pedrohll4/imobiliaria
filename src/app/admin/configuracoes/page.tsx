import React from "react";
import { getSiteSettings } from "@/lib/settings";
import { ConfiguracoesForm } from "./ConfiguracoesForm";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-[#0F1115]/10">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
          Painel de Customização
        </span>
        <h1 className="font-serif text-3xl font-normal text-[#0F1115] mt-1">
          Parâmetros, Textos, Frases & Imagens do Portal
        </h1>
        <p className="text-xs text-[#68655F] font-light mt-0.5">
          Altere as frases de impacto, textos editoriais, fotos de fundo monumentais, logotipo e canais de contato de todo o site.
        </p>
      </div>

      <ConfiguracoesForm
        initialSettings={{
          name: settings.name,
          tagline: settings.tagline,
          logoText: settings.logoText,
          logoUrl: settings.logoUrl,
          logoSubtitle: settings.logoSubtitle,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          email: settings.email,
          creciJ: settings.creciJ,
          street: settings.address.street,
          neighborhood: settings.address.neighborhood,
          city: settings.address.city,
          state: settings.address.state,
          zipCode: settings.address.zipCode,
          instagram: settings.instagram,

          heroBadge: settings.heroBadge,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroBgImage: settings.heroBgImage,

          philosophyBadge: settings.philosophyBadge,
          philosophyTitle: settings.philosophyTitle,
          philosophyText: settings.philosophyText,

          featuredTitle: settings.featuredTitle,
          featuredSubtitle: settings.featuredSubtitle,

          aboutTitle: settings.aboutTitle,
          aboutSubtitle: settings.aboutSubtitle,
          aboutHistoryTitle: settings.aboutHistoryTitle,
          aboutHistoryText1: settings.aboutHistoryText1,
          aboutHistoryText2: settings.aboutHistoryText2,
          aboutImage: settings.aboutImage,
        }}
      />
    </div>
  );
}
