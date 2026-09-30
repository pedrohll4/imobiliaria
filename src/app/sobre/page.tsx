import React from "react";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Compass, Award, Building, Sparkles } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export default async function SobrePage() {
  const session = await getSession();
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} settings={settings} />

      <main className="flex-1">
        {/* Banner Editorial */}
        <section className="bg-[#0B0D12] text-[#FBF9F5] py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
              Institucional
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              {settings.aboutTitle}
            </h1>
            <p className="text-base sm:text-lg text-[#A5A29A] font-light max-w-2xl mx-auto leading-relaxed">
              {settings.aboutSubtitle}
            </p>
          </div>
        </section>

        {/* Conteúdo Institucional */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.2em] text-[#9B7826] font-semibold">
                Nossa Trajetória
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#0F1115] leading-tight">
                {settings.aboutHistoryTitle}
              </h2>
              {settings.aboutHistoryText1 && (
                <p className="text-sm sm:text-base text-[#55524D] font-light leading-relaxed">
                  {settings.aboutHistoryText1}
                </p>
              )}
              {settings.aboutHistoryText2 && (
                <p className="text-sm sm:text-base text-[#55524D] font-light leading-relaxed">
                  {settings.aboutHistoryText2}
                </p>
              )}
            </div>

            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[#0F1115]/10 shadow-elevation">
              <img
                src={settings.aboutImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                alt="Living de alto padrão"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Pilares */}
          <div className="pt-12 border-t border-[#0F1115]/10 space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="font-serif text-3xl text-[#0F1115]">
                Nossos Compromissos Inegociáveis
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-[#FFFFFF] p-8 rounded-sm border border-[#0F1115]/[0.08] shadow-subtle space-y-3">
                <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                <h4 className="font-serif text-xl text-[#0F1115]">Privacidade Máxima</h4>
                <p className="text-xs sm:text-sm text-[#68655F] font-light leading-relaxed">
                  Operamos com acordos de confidencialidade (NDA) rigorosos e canais de comunicação seguros para proteger sua identidade patrimonial.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-8 rounded-sm border border-[#0F1115]/[0.08] shadow-subtle space-y-3">
                <Compass className="w-7 h-7 text-[#D4AF37]" />
                <h4 className="font-serif text-xl text-[#0F1115]">Consultoria Consultiva</h4>
                <p className="text-xs sm:text-sm text-[#68655F] font-light leading-relaxed">
                  Análise técnica de liquidez, valorização de bairro, viabilidade construtiva e suporte com arquitetos e engenheiros de ponta.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-8 rounded-sm border border-[#0F1115]/[0.08] shadow-subtle space-y-3">
                <Award className="w-7 h-7 text-[#D4AF37]" />
                <h4 className="font-serif text-xl text-[#0F1115]">Excelência Notarial</h4>
                <p className="text-xs sm:text-sm text-[#68655F] font-light leading-relaxed">
                  Auditoria documental preventiva de certidões, registros imobiliários e estruturação de holding imobiliária familiar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
