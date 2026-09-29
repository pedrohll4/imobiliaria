import React from "react";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { Phone, Mail, MapPin, MessageSquare, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default async function ContatoPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Atendimento Privado
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#0F1115] tracking-tight">
            Fale com a Nossa Diretoria
          </h1>
          <p className="text-base text-[#68655F] font-light leading-relaxed">
            Estamos à disposição para receber você em nossa sede corporativa ou agendar uma reunião remota confidencial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Informações de Contato */}
          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-8 sm:p-10 rounded-sm shadow-subtle space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8C8983] font-medium">
                Sede Principal
              </span>
              <h3 className="font-serif text-2xl text-[#0F1115] mt-1">
                {siteConfig.name}
              </h3>
              <p className="text-xs font-mono text-[#D4AF37] uppercase mt-0.5">
                {siteConfig.contact.creciJ}
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#55524D] font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#0F1115]">{siteConfig.contact.address.street}</p>
                  <p>{siteConfig.contact.address.neighborhood} — {siteConfig.contact.address.city}/{siteConfig.contact.address.state}</p>
                  <p>CEP {siteConfig.contact.address.zipCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0F1115]/10">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent("Olá! Desejo agendar um atendimento na sede.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37] text-[#0B0D12] text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#C29F2D] transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Atendimento via WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-8 sm:p-10 rounded-sm shadow-subtle space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-[#0F1115]">
                Mensagem Confidencial
              </h3>
              <p className="text-xs text-[#8C8983] font-light mt-1">
                Preencha os campos abaixo para que nosso sócio responsável retorne o contato com a brevidade necessária.
              </p>
            </div>

            <form className="space-y-4">
              <Input label="Seu Nome Completo *" placeholder="Ex: Roberto Silveira" required />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="E-mail *" type="email" placeholder="seu.email@exemplo.com" required />
                <Input label="Telefone / WhatsApp *" type="tel" placeholder="(11) 98765-4321" required />
              </div>

              <Textarea
                label="Como podemos assessorar sua busca patrimonial? *"
                rows={4}
                placeholder="Ex: Procuro cobertura no quadrilátero dos Jardins ou Itaim Bibi com 4 suítes e metragem acima de 500m²..."
                required
              />

              <div className="pt-2">
                <Button type="button" variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-widest">
                  Encaminhar Mensagem Privativa
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
