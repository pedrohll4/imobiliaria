"use client";

import React, { useState, useActionState, useRef } from "react";
import { updateSiteSettingsAction, SettingActionResult } from "@/actions/settingActions";
import { uploadPropertyImageAction } from "@/actions/uploadActions";
import { compressImage } from "@/lib/imageOptimization";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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
  Image as ImageIcon,
  Type,
  ExternalLink,
  Eye,
} from "lucide-react";

interface ConfiguracoesFormProps {
  initialSettings: {
    name: string;
    tagline: string;
    logoText: string;
    logoUrl?: string | null;
    logoSubtitle?: string | null;
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

    // Home Textos & Frases
    heroBadge?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroBgImage?: string | null;

    philosophyBadge?: string | null;
    philosophyTitle?: string | null;
    philosophyText?: string | null;

    featuredTitle?: string | null;
    featuredSubtitle?: string | null;

    // Página Sobre
    aboutTitle?: string | null;
    aboutSubtitle?: string | null;
    aboutHistoryTitle?: string | null;
    aboutHistoryText1?: string | null;
    aboutHistoryText2?: string | null;
    aboutImage?: string | null;
  };
}

type TabType = "identidade" | "home_textos" | "imagens" | "sobre";

export function ConfiguracoesForm({ initialSettings }: ConfiguracoesFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home_textos");

  // Estados das Imagens com URLs e Uploader
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const [heroBgImage, setHeroBgImage] = useState(
    initialSettings.heroBgImage ||
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85"
  );
  const [aboutImage, setAboutImage] = useState(
    initialSettings.aboutImage ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  );

  // Estados de Carregamento
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<SettingActionResult | null, FormData>(
    async (prev, formData) => {
      formData.set("logoUrl", logoUrl);
      formData.set("heroBgImage", heroBgImage);
      formData.set("aboutImage", aboutImage);
      return await updateSiteSettingsAction(prev, formData);
    },
    null
  );

  // Upload de Imagem de Fundo do Hero
  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    setUploadFeedback(null);

    try {
      // Comprime a foto de fundo para WebP otimizado em alta resolução (2400x1350)
      const compressed = await compressImage(file, {
        maxWidth: 2400,
        maxHeight: 1400,
        quality: 0.88,
        mimeType: "image/webp",
      });

      const fd = new FormData();
      fd.append("file", compressed.file);

      const res = await uploadPropertyImageAction(fd);
      if (res.success && res.url) {
        setHeroBgImage(res.url);
        setUploadFeedback("Imagem de fundo do Hero enviada com sucesso para o Supabase CDN!");
      } else {
        throw new Error(res.error || "Falha no upload da imagem de fundo.");
      }
    } catch (err: any) {
      console.error("Erro no upload do fundo do Hero:", err);
      setUploadFeedback(err?.message || "Erro ao processar imagem de fundo.");
    } finally {
      setIsUploadingHero(false);
      if (heroInputRef.current) {
        heroInputRef.current.value = "";
      }
    }
  };

  // Upload da Imagem da Página Sobre
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAbout(true);
    setUploadFeedback(null);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.88,
        mimeType: "image/webp",
      });

      const fd = new FormData();
      fd.append("file", compressed.file);

      const res = await uploadPropertyImageAction(fd);
      if (res.success && res.url) {
        setAboutImage(res.url);
        setUploadFeedback("Imagem institucional da página Sobre enviada com sucesso!");
      } else {
        throw new Error(res.error || "Falha no upload da imagem institucional.");
      }
    } catch (err: any) {
      console.error("Erro no upload da imagem Sobre:", err);
      setUploadFeedback(err?.message || "Erro ao processar imagem.");
    } finally {
      setIsUploadingAbout(false);
      if (aboutInputRef.current) {
        aboutInputRef.current.value = "";
      }
    }
  };

  // Upload de Logotipo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadFeedback(null);

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
        setUploadFeedback("Logotipo enviado com sucesso para o Supabase CDN!");
      } else {
        throw new Error(res.error || "Falha no upload do logotipo.");
      }
    } catch (err: any) {
      console.error("Erro no upload do logotipo:", err);
      setUploadFeedback(err?.message || "Erro ao processar imagem.");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Mensagens de Feedback Geral */}
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

      {uploadFeedback && (
        <div className="p-3 bg-amber-50 text-amber-900 text-xs border border-amber-200 rounded-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* NAVEGAÇÃO DE ABAS EXCLUSIVAS */}
      <div className="flex border-b border-[#0F1115]/10 overflow-x-auto gap-2 bg-[#FFFFFF] p-2 rounded-sm border border-[#0F1115]/[0.08] shadow-subtle">
        <button
          type="button"
          onClick={() => setActiveTab("home_textos")}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all whitespace-nowrap ${
            activeTab === "home_textos"
              ? "bg-[#0B0D12] text-[#D4AF37] shadow-sm"
              : "text-[#68655F] hover:text-[#0F1115] hover:bg-[#F4F1EA]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Textos & Frases da Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("imagens")}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all whitespace-nowrap ${
            activeTab === "imagens"
              ? "bg-[#0B0D12] text-[#D4AF37] shadow-sm"
              : "text-[#68655F] hover:text-[#0F1115] hover:bg-[#F4F1EA]"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Imagens de Fundo & Banners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("identidade")}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all whitespace-nowrap ${
            activeTab === "identidade"
              ? "bg-[#0B0D12] text-[#D4AF37] shadow-sm"
              : "text-[#68655F] hover:text-[#0F1115] hover:bg-[#F4F1EA]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identidade & Contatos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sobre")}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all whitespace-nowrap ${
            activeTab === "sobre"
              ? "bg-[#0B0D12] text-[#D4AF37] shadow-sm"
              : "text-[#68655F] hover:text-[#0F1115] hover:bg-[#F4F1EA]"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Página Institucional (Sobre)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: TEXTOS & FRASES DA HOME */}
      {/* ========================================================================= */}
      <div className={activeTab === "home_textos" ? "block space-y-6" : "hidden"}>
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-[#0F1115]/10 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                Seção de Abertura (Hero)
              </span>
              <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
                Frases de Impacto & Títulos da Página Inicial
              </h2>
            </div>
            <span className="text-xs text-[#8C8983] font-light hidden sm:inline">
              Visível na primeira dobra do site
            </span>
          </div>

          <div className="space-y-4">
            <Input
              name="heroBadge"
              label="Etiqueta Superior do Hero (Tag Editorial) *"
              defaultValue={initialSettings.heroBadge || "Curadoria Imobiliária Exclusiva"}
              placeholder="Ex: Curadoria Imobiliária Exclusiva"
              required
            />

            <Textarea
              name="heroTitle"
              label="Título Principal de Destaque (Frase Monumental) *"
              rows={3}
              defaultValue={
                initialSettings.heroTitle ||
                "Encontre o imóvel que combina com a sua próxima história."
              }
              placeholder="Ex: Encontre o imóvel que combina com a sua próxima história."
              required
            />
            <p className="text-[11px] text-[#8C8983]">
              Dica: Esta é a frase principal que seus clientes leem assim que entram no portal.
            </p>

            <Textarea
              name="heroSubtitle"
              label="Subtítulo Descritivo do Hero *"
              rows={3}
              defaultValue={
                initialSettings.heroSubtitle ||
                "Residências singulares, coberturas e refúgios contemporâneos selecionados com rigor arquitetônico e discrição inegociável."
              }
              placeholder="Ex: Residências singulares, coberturas e refúgios contemporâneos..."
              required
            />
          </div>
        </div>

        {/* Filosofia & Seções da Home */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Seção Intermediária & Conceito
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Filosofia da Marca & Vitrine de Imóveis
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="philosophyBadge"
                label="Tag da Filosofia"
                defaultValue={initialSettings.philosophyBadge || "Nossa Filosofia"}
                placeholder="Ex: Nossa Filosofia"
              />
              <Input
                name="philosophyTitle"
                label="Título do Manifesto / Filosofia"
                defaultValue={
                  initialSettings.philosophyTitle ||
                  "A arquitetura como expressão máxima do bem-viver."
                }
                placeholder="Ex: A arquitetura como expressão máxima do bem-viver."
              />
            </div>

            <Textarea
              name="philosophyText"
              label="Texto do Manifesto da Marca"
              rows={3}
              defaultValue={
                initialSettings.philosophyText ||
                "Não comercializamos apenas metros quadrados. Representamos residências que inspiram, acolhem e valorizam o patrimônio das famílias mais exigentes com curadoria cirúrgica."
              }
              placeholder="Ex: Não comercializamos apenas metros quadrados..."
            />

            <div className="pt-4 border-t border-[#0F1115]/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="featuredTitle"
                label="Título da Seção de Imóveis Selecionados"
                defaultValue={initialSettings.featuredTitle || "Imóveis Selecionados"}
                placeholder="Ex: Imóveis Selecionados"
              />
              <Input
                name="featuredSubtitle"
                label="Subtítulo da Seção de Imóveis"
                defaultValue={
                  initialSettings.featuredSubtitle ||
                  "Coleção de residências notáveis que transcendem o convencional pela localização privilegiada e excelência construtiva."
                }
                placeholder="Ex: Coleção de residências notáveis..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 2: IMAGENS DE FUNDO & BANNERS */}
      {/* ========================================================================= */}
      <div className={activeTab === "imagens" ? "block space-y-6" : "hidden"}>
        {/* Imagem de Fundo do Hero */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-[#0F1115]/10 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                Fundo da Página Inicial
              </span>
              <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
                Imagem Monumental de Fundo do Hero
              </h2>
              <p className="text-xs text-[#8C8983] font-light mt-0.5">
                A foto arquitetônica que preenche o fundo de abertura com efeito cinematográfico.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Live Preview da Imagem de Fundo do Hero */}
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-sm overflow-hidden border border-[#0F1115]/15 bg-[#0B0D12] shadow-inner group">
              <img
                src={heroBgImage}
                alt="Preview do Fundo do Hero"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-transparent to-[#0B0D12]/40" />
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-[#0B0D12]/80 backdrop-blur-md px-3 py-1.5 rounded-xs border border-white/10 text-white text-xs">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Prévia do Fundo da Home</span>
              </div>
            </div>

            {/* Input de Arquivo Oculto */}
            <input
              type="file"
              ref={heroInputRef}
              onChange={handleHeroBgUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742] mb-1.5">
                  URL da Imagem de Fundo do Hero
                </label>
                <input
                  type="text"
                  value={heroBgImage}
                  onChange={(e) => setHeroBgImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FFFFFF] text-[#0F1115] text-xs px-4 py-3 rounded-sm border border-[#0F1115]/15 font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={isUploadingHero}
                  className="w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-[#D4AF37] text-[#0B0D12] hover:bg-[#D4AF37]/10"
                >
                  {isUploadingHero ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Comprimindo...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>Enviar do Computador</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-[#8C8983]">
              Recomendação: Fotografia horizontal de arquitetura ou paisagismo com alta definição (1920x1080 ou 2400x1400). As fotos são compactadas automaticamente para WebP ultraleve.
            </p>
          </div>
        </div>

        {/* Imagem da Página Sobre */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Institucional
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Fotografia Institucional da Página Sobre
            </h2>
            <p className="text-xs text-[#8C8983] font-light mt-0.5">
              Ilustra a seção de trajetória da imobiliária e compromissos institucionais.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] max-w-xl rounded-sm overflow-hidden border border-[#0F1115]/15 bg-[#F4F1EA]">
              <img
                src={aboutImage}
                alt="Preview da Página Sobre"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              ref={aboutInputRef}
              onChange={handleAboutImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742] mb-1.5">
                  URL da Fotografia Institucional
                </label>
                <input
                  type="text"
                  value={aboutImage}
                  onChange={(e) => setAboutImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FFFFFF] text-[#0F1115] text-xs px-4 py-3 rounded-sm border border-[#0F1115]/15 font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => aboutInputRef.current?.click()}
                  disabled={isUploadingAbout}
                  className="w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {isUploadingAbout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Comprimindo...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>Substituir Foto</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 3: IDENTIDADE VISUAL & CONTATOS */}
      {/* ========================================================================= */}
      <div className={activeTab === "identidade" ? "block space-y-6" : "hidden"}>
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Identidade Corporativa
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Nome da Empresa & Logotipo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <Input
                name="name"
                label="Nome Oficial da Imobiliária *"
                defaultValue={initialSettings.name}
                placeholder="Ex: Imobiliária Conceito"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <Input
                name="logoText"
                label="Monograma / Sigla (2 a 4 letras)"
                defaultValue={initialSettings.logoText}
                placeholder="Ex: IC"
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

            <div className="sm:col-span-12">
              <Input
                name="logoSubtitle"
                label="Subtítulo do Topo (Abaixo do Nome da Imobiliária no Cabeçalho) *"
                defaultValue={initialSettings.logoSubtitle || "Imóveis Exclusivos"}
                placeholder="Ex: Imóveis Exclusivos ou Consultoria Imobiliária"
              />
              <p className="text-[11px] text-[#8C8983] mt-1 font-light">
                Texto em caixa alta exibido logo abaixo do nome no topo do site (ex: &quot;IMÓVEIS EXCLUSIVOS&quot;).
              </p>
            </div>

            {/* Upload do Logotipo */}
            <div className="sm:col-span-12 p-5 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0F1115] block">
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
                <div className="w-36 h-18 border border-[#0F1115]/10 rounded-xs bg-[#0B0D12] flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-sm">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-[#D4AF37] font-serif font-bold tracking-widest">
                      {initialSettings.logoText || "LOGO"}
                    </span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Fazer Upload do Logotipo</span>
                        </>
                      )}
                    </Button>

                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLogoUrl("")}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remover Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8C8983]">
                    Formatos recomendados: PNG ou WebP com fundo transparente. Se não houver arquivo, o monograma textual será exibido com tipografia dourada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canais de Atendimento */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Canais Oficiais
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Canais de Contato & WhatsApp Corporativo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="whatsapp"
              label="WhatsApp Corporativo (DDI + DDD + Número) *"
              defaultValue={initialSettings.whatsapp}
              placeholder="Ex: 5569999887766"
              required
            />
            <Input
              name="phone"
              label="Telefone Fixo / Comercial Formatado"
              defaultValue={initialSettings.phone}
              placeholder="Ex: (69) 3211-9000"
            />
            <Input
              name="email"
              type="email"
              label="E-mail de Atendimento Privativo *"
              defaultValue={initialSettings.email}
              placeholder="contato@imobiliaria.com.br"
              required
            />
            <Input
              name="creciJ"
              label="CRECI Jurídico Oficial (Obrigatório por Lei) *"
              defaultValue={initialSettings.creciJ}
              placeholder="Ex: CRECI 3.820-J/RO"
              required
            />
            <div className="sm:col-span-2">
              <Input
                name="instagram"
                label="Perfil do Instagram"
                defaultValue={initialSettings.instagram}
                placeholder="https://instagram.com/suaimobiliaria"
              />
            </div>
          </div>
        </div>

        {/* Endereço Corporativo */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Localização Física
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Sede Corporativa & Endereço
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <Input
                name="street"
                label="Logradouro e Número"
                defaultValue={initialSettings.street}
                placeholder="Ex: Avenida Jorge Teixeira, 1850"
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                name="neighborhood"
                label="Bairro"
                defaultValue={initialSettings.neighborhood}
                placeholder="Ex: Setor 03"
              />
            </div>
            <div className="sm:col-span-5">
              <Input
                name="city"
                label="Cidade"
                defaultValue={initialSettings.city}
                placeholder="Ex: Ariquemes"
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                name="state"
                label="Estado (UF)"
                defaultValue={initialSettings.state}
                placeholder="Ex: RO"
                maxLength={2}
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                name="zipCode"
                label="CEP"
                defaultValue={initialSettings.zipCode}
                placeholder="Ex: 76820-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 4: PÁGINA SOBRE */}
      {/* ========================================================================= */}
      <div className={activeTab === "sobre" ? "block space-y-6" : "hidden"}>
        <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <div className="border-b border-[#0F1115]/10 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Institucional
            </span>
            <h2 className="font-serif text-2xl text-[#0F1115] mt-0.5">
              Textos e Trajetória da Página Sobre
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              name="aboutTitle"
              label="Título Principal do Banner Sobre"
              defaultValue={initialSettings.aboutTitle || "A Arte de Viver com Distinção"}
              placeholder="Ex: A Arte de Viver com Distinção"
            />

            <Textarea
              name="aboutSubtitle"
              label="Subtítulo do Banner Institucional"
              rows={2}
              defaultValue={
                initialSettings.aboutSubtitle ||
                "Fundada sob a premissa de que uma residência transcende paredes e metragem: ela é o cenário onde vidas extraordinárias se desenrolam."
              }
            />

            <div className="pt-4 border-t border-[#0F1115]/10 space-y-4">
              <Input
                name="aboutHistoryTitle"
                label="Título da Seção de História & Trajetória"
                defaultValue={
                  initialSettings.aboutHistoryTitle ||
                  "Curadoria Imobiliária Inspirada na Alta Arquitetura"
                }
                placeholder="Ex: Curadoria Imobiliária Inspirada na Alta Arquitetura"
              />

              <Textarea
                name="aboutHistoryText1"
                label="Primeiro Parágrafo da História"
                rows={3}
                defaultValue={
                  initialSettings.aboutHistoryText1 ||
                  "Nascemos para atender um público que valoriza design atemporal, materiais nobres e privacidade inegociável. Nossa equipe não atua com volume indiscriminado de imóveis, mas com uma seleção criteriosa de casas com assinaturas prestigiadas, coberturas singulares e propriedades rurais com vocação para o lazer refinado."
                }
              />

              <Textarea
                name="aboutHistoryText2"
                label="Segundo Parágrafo da História"
                rows={3}
                defaultValue={
                  initialSettings.aboutHistoryText2 ||
                  "Cada empreendimento inserido em nosso acervo passa por rigorosa auditoria jurídica e técnica, garantindo segurança patrimonial absoluta tanto para quem adquire quanto para quem aliena."
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* BARRA FIXA DE SALVAR ALTERAÇÕES */}
      <div className="sticky bottom-6 z-30 bg-[#0B0D12] border border-[#D4AF37]/30 p-4 sm:p-5 rounded-sm shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-serif text-sm font-medium">
              Pronto para aplicar as alterações no portal?
            </h4>
            <p className="text-xs text-white/60 font-light">
              As alterações são propagadas instantaneamente em toda a plataforma pública.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-md bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12]"
          >
            Salvar Todas as Configurações
          </Button>
        </div>
      </div>
    </form>
  );
}
