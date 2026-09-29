"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  updateMyProfileAction,
  updateBrokerAvatarInstantAction,
  BrokerActionResult,
} from "@/actions/brokerActions";
import { uploadBrokerImageAction } from "@/actions/uploadActions";
import { compressImage } from "@/lib/imageOptimization";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Smartphone,
  Eye,
  UserCheck,
  UploadCloud,
  Loader2,
} from "lucide-react";

interface ProfileEditFormProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  initialBroker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    creci: string;
    photoUrl: string;
    bio: string;
    active: boolean;
  } | null;
  propertyCount: number;
}

export function ProfileEditForm({
  initialUser,
  initialBroker,
  propertyCount,
}: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<BrokerActionResult | null>(null);

  // Estados dos campos para Live Preview
  const [name, setName] = useState(initialBroker?.name || initialUser.name || "");
  const [email, setEmail] = useState(initialBroker?.email || initialUser.email || "");
  const [phone, setPhone] = useState(initialBroker?.phone || "(11) 3045-8000");
  const [whatsapp, setWhatsapp] = useState(initialBroker?.whatsapp || "5511999998888");
  const [creci, setCreci] = useState(initialBroker?.creci || "SP 000.000-F");
  const [photoUrl, setPhotoUrl] = useState(
    initialBroker?.photoUrl ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
  );
  const [bio, setBio] = useState(
    initialBroker?.bio ||
      "Especialista em propriedades de alto padrão e condomínios fechados contemporâneos."
  );
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoFeedback(null);

    try {
      // Comprime retrato do consultor (máx 800x800 WebP para ficar ultraleve ~40KB)
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        mimeType: "image/webp",
      });

      const fd = new FormData();
      fd.append("file", compressed.file);

      const res = await uploadBrokerImageAction(fd);
      if (res.success && res.url) {
        setPhotoUrl(res.url);
        // Persistir imediatamente no banco de dados para nunca perder a foto
        await updateBrokerAvatarInstantAction(res.url, initialBroker?.id);
        setPhotoFeedback({
          type: "success",
          message: "Foto de perfil enviada e salva com sucesso no banco de dados e CDN!",
        });
      } else {
        throw new Error(res.error || "Erro ao salvar foto no Supabase.");
      }
    } catch (err: any) {
      console.error("Erro no upload de foto de perfil:", err);
      setPhotoFeedback({
        type: "error",
        message: err?.message || "Falha ao processar upload da foto.",
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateMyProfileAction(null, formData);
      setFeedback(res);
      if (res.success) {
        setNewPassword("");
        // Scroll suave para o topo do formulário
        window.scrollTo({ top: 100, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Coluna Principal: Formulário de Edição */}
      <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-8">
        {/* Banner de Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-sm flex items-start gap-3 border text-sm transition-all duration-300 ${
              feedback.success
                ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#0F1115]"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-[#9B7826] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{feedback.success ? "Sucesso!" : "Atenção"}</p>
              <p className="text-xs mt-0.5 opacity-90">{feedback.message || feedback.error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Fotografia de Perfil & Presets */}
          <div className="space-y-4 pb-6 border-b border-[#0F1115]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F1115]">
                  Fotografia Profissional
                </h3>
                <p className="text-xs text-[#68655F] mt-0.5">
                  Foto de alta resolução exibida nos cards dos imóveis e no WhatsApp.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-[#D4AF37]/20 text-[#9B7826] px-2 py-0.5 rounded-xs">
                Live Preview
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <div className="relative group shrink-0">
                <img
                  src={photoUrl}
                  alt="Preview da Foto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#D4AF37] shadow-md transition-transform group-hover:scale-105 duration-300"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 bg-[#0B0D12] text-[#D4AF37] p-2 rounded-full border border-[#D4AF37]/50 shadow-md hover:scale-110 transition-transform"
                  title="Upload de foto do dispositivo"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="w-full space-y-3">
                {/* Input Oculto de Arquivo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="text-xs flex items-center gap-2 border-[#D4AF37]/50 hover:border-[#D4AF37]"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>Otimizando & Enviando...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Upload de Foto do Dispositivo</span>
                      </>
                    )}
                  </Button>

                  {photoUrl.includes("supabase.co") && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 rounded-xs border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      Supabase Storage CDN
                    </span>
                  )}
                </div>

                {photoFeedback && (
                  <div
                    className={`p-2.5 rounded-xs text-xs flex items-center gap-2 border ${
                      photoFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {photoFeedback.type === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    )}
                    <span>{photoFeedback.message}</span>
                  </div>
                )}

                <Input
                  label="Ou Link Direto da Foto (URL)"
                  name="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Dados Pessoais & Registro Profissional */}
          <div className="space-y-4 pb-6 border-b border-[#0F1115]/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F1115]">
              Identificação & Credenciamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Helena Vianna"
                required
              />

              <Input
                label="Registro CRECI *"
                name="creci"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                placeholder="Ex: SP 184.920-F"
                required
              />

              <Input
                label="E-mail Profissional (Login) *"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@imobiliaria.com"
                required
              />

              <Input
                label="Telefone Fixo / Comercial"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 3045-8000"
              />

              <div className="sm:col-span-2">
                <Input
                  label="WhatsApp Direto com DDI/DDD *"
                  name="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="5511999998888"
                  required
                />
                <p className="text-[11px] text-[#8C8983] mt-1 font-light">
                  Insira com código do país (55) e DDD. Exemplo: <strong>5511999998888</strong>.
                  Este número receberá os leads diretos dos botões "Conversar no WhatsApp" em todos os imóveis!
                </p>
              </div>
            </div>
          </div>

          {/* Seção 3: Biografia Editorial */}
          <div className="space-y-3 pb-6 border-b border-[#0F1115]/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F1115]">
                Mini-Biografia Editorial
              </h3>
              <span className="text-[11px] text-[#8C8983] font-mono">
                {bio.length} caracteres
              </span>
            </div>
            <p className="text-xs text-[#68655F]">
              Texto elegante apresentado no seu perfil público e na página de corretores parceiros.
            </p>
            <Textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Descreva sua experiência, regiões atendidas e filosofia de atendimento de luxo..."
            />
          </div>

          {/* Seção 4: Alterar Senha (Opcional) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9B7826] hover:text-[#0F1115] transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{showPasswordSection ? "Ocultar troca de senha" : "Deseja alterar sua senha de acesso?"}</span>
            </button>

            {showPasswordSection && (
              <div className="p-4 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-sm space-y-3">
                <Input
                  label="Nova Senha (deixe em branco para manter a atual)"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                />
                <p className="text-[11px] text-[#8C8983]">
                  Se preenchido, sua senha de login será atualizada imediatamente.
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0F1115]/10">
            <div className="flex items-center gap-2 text-xs text-[#68655F]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Dados protegidos e sincronizados com Supabase</span>
            </div>

            <Button
              type="submit"
              variant="champagne"
              size="lg"
              isLoading={isPending}
              className="w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Salvar Alterações do Perfil</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Coluna Lateral: Pré-visualização do Perfil Público em Tempo Real */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        <div className="border-b border-[#0F1115]/10 pb-3">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Visualização Pública
          </span>
          <h2 className="font-serif text-lg text-[#0F1115] mt-0.5">
            Como os clientes verão você
          </h2>
        </div>

        {/* Card Mockup de Corretor de Alto Padrão */}
        <div className="bg-[#FFFFFF] border border-[#0F1115]/10 rounded-sm overflow-hidden shadow-elevation group">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1E29]">
            <img
              src={photoUrl}
              alt={name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#F7EFCF] font-mono">
                {creci || "CRECI PENDENTE"}
              </span>
              <h3 className="font-serif text-xl font-normal leading-tight mt-0.5">
                {name || "Seu Nome Completo"}
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-[#55524D] font-light leading-relaxed line-clamp-3">
              {bio || "Sem biografia cadastrada."}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#0F1115]/10 text-xs text-[#4A4742]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#9B7826]">
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>WhatsApp: +{whatsapp.replace(/\D/g, "")}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Olá ${name}, gostaria de saber mais sobre seu portfólio de imóveis de luxo.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-sm bg-[#0B0D12] text-[#FBF9F5] hover:bg-[#1A1E29] transition-all shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Testar Link WhatsApp</span>
              </a>
            </div>

            {initialBroker && (
              <div className="pt-1 text-center">
                <Link
                  href={`/corretores/${initialBroker.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8C8983] hover:text-[#0F1115] transition-colors"
                >
                  <span>Abrir página pública no portal</span>
                  <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                </Link>
              </div>
            )}
          </div>

          <div className="bg-[#FBF9F5] px-5 py-3 border-t border-[#0F1115]/5 flex items-center justify-between text-[11px] text-[#68655F]">
            <span>Imóveis no Portfólio</span>
            <strong className="text-[#0F1115] font-mono">{propertyCount} mansões</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
