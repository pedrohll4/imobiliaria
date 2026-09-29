"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateMyProfileAction, BrokerActionResult } from "@/actions/brokerActions";
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

// Avatares de alto padrão pré-selecionados para facilitar escolha rápida
const PRESET_AVATARS = [
  {
    name: "Executiva Elegante",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Consultor Alfaiataria",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Especialista Moderna",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Diretor Contemporâneo",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Retrato Minimalista",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Studio Editorial",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
];

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
                ? "bg-[#C5A880]/10 border-[#C5A880] text-[#0F1115]"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-[#8E6F3E] shrink-0 mt-0.5" />
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
              <span className="text-[10px] uppercase font-mono tracking-widest bg-[#C5A880]/20 text-[#8E6F3E] px-2 py-0.5 rounded-xs">
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#C5A880] shadow-md transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute bottom-0 right-0 bg-[#0B0D12] text-[#FBF9F5] p-1.5 rounded-full border border-white shadow-sm">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="w-full space-y-3">
                <Input
                  label="URL da Imagem de Perfil"
                  name="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  required
                />
                
                {/* Seletores rápidos de fotos para teste imediato */}
                <div>
                  <span className="text-[11px] font-medium text-[#8C8983] uppercase tracking-wider block mb-1.5">
                    Ou selecione um retrato de estúdio contemporâneo:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-xs border transition-all ${
                          photoUrl === preset.url
                            ? "border-[#C5A880] bg-[#C5A880]/15 text-[#0F1115] font-semibold"
                            : "border-[#0F1115]/10 bg-[#FBF9F5] text-[#68655F] hover:border-[#0F1115]/30 hover:text-[#0F1115]"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
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
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8E6F3E] hover:text-[#0F1115] transition-colors"
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
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
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
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] font-semibold flex items-center gap-1.5">
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
              <span className="text-[10px] uppercase tracking-widest text-[#E8DCC4] font-mono">
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
                <Mail className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#8E6F3E]">
                <Smartphone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
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
                  <ExternalLink className="w-3 h-3 text-[#C5A880]" />
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
