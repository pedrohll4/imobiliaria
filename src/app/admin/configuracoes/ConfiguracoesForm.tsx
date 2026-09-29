"use client";

import React, { useState, useActionState, useRef } from "react";
import { updateSiteSettingsAction, SettingActionResult } from "@/actions/settingActions";
import { uploadPropertyImageAction } from "@/actions/uploadActions";
import { compressImage } from "@/lib/imageOptimization";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
} from "lucide-react";

interface ConfiguracoesFormProps {
  initialSettings: {
    name: string;
    tagline: string;
    logoText: string;
    logoUrl?: string | null;
    phone: string;
    whatsapp: string;
    email: string;
    creciJ: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    instagram: string;
  };
}

export function ConfiguracoesForm({ initialSettings }: ConfiguracoesFormProps) {
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoFeedback, setLogoFeedback] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<SettingActionResult | null, FormData>(
    async (prev, formData) => {
      formData.set("logoUrl", logoUrl);
      return await updateSiteSettingsAction(prev, formData);
    },
    null
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoFeedback(null);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 400,
        quality: 0.9,
        mimeType: "image/webp",
      });

      const fd = new FormData();
      fd.append("file", compressed.file);

      const res = await uploadPropertyImageAction(fd);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        setLogoFeedback("Logotipo enviado com sucesso para o Supabase CDN!");
      } else {
        throw new Error(res.error || "Falha no upload do logotipo.");
      }
    } catch (err: any) {
      console.error("Erro no upload do logotipo:", err);
      setLogoFeedback(err?.message || "Erro ao processar imagem.");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.message && (
        <div className="p-4 bg-emerald-50 text-emerald-900 text-sm border border-emerald-200 rounded-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state?.error && (
        <div className="p-4 bg-red-50 text-red-800 text-sm border border-red-200 rounded-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* 1. IDENTIDADE VISUAL */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center gap-2 border-b border-[#0F1115]/10 pb-4">
          <Building2 className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-serif text-xl text-[#0F1115]">
              1. Identidade da Empresa & Logotipo
            </h2>
            <p className="text-xs text-[#8C8983] font-light">
              Esses dados serão refletidos automaticamente no topo, rodapé e em todo o portal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <Input
              name="name"
              label="Nome Real da Imobiliária *"
              defaultValue={initialSettings.name}
              placeholder="Ex: Prime Properties Imobiliária"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="logoText"
              label="Monograma / Sigla (2 a 4 letras)"
              defaultValue={initialSettings.logoText}
              placeholder="Ex: PPI"
              maxLength={5}
            />
          </div>

          <div className="sm:col-span-12">
            <Input
              name="tagline"
              label="Slogan / Tagline Institucional"
              defaultValue={initialSettings.tagline}
              placeholder="Ex: Residências e Empreendimentos de Alto Padrão"
            />
          </div>

          {/* Upload do Logotipo */}
          <div className="sm:col-span-12 p-4 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F1115] block">
              Logotipo Oficial da Imobiliária
            </span>

            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-16 border border-[#0F1115]/10 rounded-xs bg-[#0B0D12] flex items-center justify-center p-2 shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-[#D4AF37] font-serif font-bold tracking-widest">
                    {initialSettings.logoText || "LOGO"}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="text-xs flex items-center gap-2 border-[#D4AF37]/50 hover:border-[#D4AF37]"
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                      <span>Processando Logotipo...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Fazer Upload do Logo (PNG, SVG, WebP)</span>
                    </>
                  )}
                </Button>

                {logoUrl && logoUrl.includes("supabase.co") && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    Hospedado no Supabase Storage CDN
                  </span>
                )}

                {logoFeedback && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {logoFeedback}
                  </p>
                )}
              </div>
            </div>

            <Input
              name="logoUrl"
              label="Ou Link Direto do Logo (URL)"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. CANAIS DE ATENDIMENTO */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center gap-2 border-b border-[#0F1115]/10 pb-4">
          <Phone className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-serif text-xl text-[#0F1115]">
              2. Canais de Contato & WhatsApp Oficial
            </h2>
            <p className="text-xs text-[#8C8983] font-light">
              O WhatsApp receberá as mensagens diretas de interesse em imóveis sem corretor específico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              name="whatsapp"
              label="WhatsApp Oficial da Imobiliária (com DDD) *"
              defaultValue={initialSettings.whatsapp}
              placeholder="Ex: 11999998888 ou 5511999998888"
              required
            />
            <p className="text-[11px] text-[#8C8983] mt-1 font-light">
              Utilizado para os botões diretos de atendimento flutuante e formulários.
            </p>
          </div>

          <div>
            <Input
              name="phone"
              label="Telefone Fixo / Comercial"
              defaultValue={initialSettings.phone}
              placeholder="Ex: (11) 3045-8000"
            />
          </div>

          <div>
            <Input
              name="email"
              type="email"
              label="E-mail Institucional *"
              defaultValue={initialSettings.email}
              placeholder="Ex: contato@suaimobiliaria.com.br"
              required
            />
          </div>

          <div>
            <Input
              name="instagram"
              label="Instagram Oficial"
              defaultValue={initialSettings.instagram}
              placeholder="Ex: https://instagram.com/suaimobiliaria"
            />
          </div>
        </div>
      </div>

      {/* 3. DADOS JURÍDICOS & ENDEREÇO */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center gap-2 border-b border-[#0F1115]/10 pb-4">
          <MapPin className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-serif text-xl text-[#0F1115]">
              3. Registro Profissional & Endereço
            </h2>
            <p className="text-xs text-[#8C8983] font-light">
              Garante a conformidade jurídica no rodapé e na página de contato.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-4">
            <Input
              name="creciJ"
              label="CRECI Jurídico (CRECI-J) *"
              defaultValue={initialSettings.creciJ}
              placeholder="Ex: CRECI 34.200-J/SP"
              required
            />
          </div>

          <div className="sm:col-span-8">
            <Input
              name="street"
              label="Logradouro / Avenida e Número"
              defaultValue={initialSettings.street}
              placeholder="Ex: Avenida Brigadeiro Faria Lima, 3477"
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="neighborhood"
              label="Bairro"
              defaultValue={initialSettings.neighborhood}
              placeholder="Ex: Itaim Bibi"
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="city"
              label="Cidade"
              defaultValue={initialSettings.city}
              placeholder="Ex: São Paulo"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              name="state"
              label="Estado (UF)"
              defaultValue={initialSettings.state}
              placeholder="Ex: SP"
              maxLength={2}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              name="zipCode"
              label="CEP"
              defaultValue={initialSettings.zipCode}
              placeholder="Ex: 04538-133"
            />
          </div>
        </div>
      </div>

      {/* AÇÃO FINAL */}
      <div className="flex items-center justify-between pt-4 border-t border-[#0F1115]/10">
        <div className="flex items-center gap-2 text-xs text-[#68655F]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Configurações sincronizadas em tempo real com o banco de dados</span>
        </div>

        <Button
          type="submit"
          variant="champagne"
          size="lg"
          isLoading={isPending}
          className="px-8 text-xs uppercase tracking-widest font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Salvar Configurações da Imobiliária
        </Button>
      </div>
    </form>
  );
}
