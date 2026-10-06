"use client";

import React, { useState, useActionState, useRef } from "react";
import { createBrokerAction, BrokerActionResult } from "@/actions/brokerActions";
import { uploadBrokerImageAction } from "@/actions/uploadActions";
import { compressImage } from "@/lib/imageOptimization";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Plus, UploadCloud, Loader2, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

export function BrokerCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<BrokerActionResult | null, FormData>(
    async (prev, formData) => {
      formData.set("photoUrl", photoUrl);
      const res = await createBrokerAction(prev, formData);
      if (res.success) {
        setIsOpen(false);
      }
      return res;
    },
    null
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setUploadFeedback(null);

    try {
      // Comprime a foto do corretor (máx 800x800 em WebP, fica em torno de ~40KB)
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
        setUploadFeedback("Foto enviada com sucesso para o Supabase Storage!");
      } else {
        throw new Error(res.error || "Falha ao salvar foto no Supabase.");
      }
    } catch (err: any) {
      console.error("Erro no upload da foto do corretor:", err);
      setUploadFeedback(err?.message || "Erro ao processar imagem.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs uppercase tracking-widest px-5 py-3"
      >
        <Plus className="w-4 h-4 text-[#D4AF37]" />
        <span>Cadastrar Corretor</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cadastrar Novo Consultor Imobiliário"
        subtitle="Crie as credenciais de acesso e perfil profissional do novo corretor."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs">
              {state.error}
            </div>
          )}

          <Input name="name" label="Nome Completo *" placeholder="Ex: Lucas Guimarães" required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="email"
              type="email"
              label="E-mail de Login *"
              placeholder="lucas@imobiliaria.com"
              required
            />
            <Input
              name="password"
              type="password"
              label="Senha de Acesso Inicial *"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input name="creci" label="Registro CRECI *" placeholder="SP 241.092-F" required />
            <Input name="phone" label="Telefone Fixo / Celular *" placeholder="(11) 98111-2233" required />
            <Input name="whatsapp" label="WhatsApp (com DDD) *" placeholder="11981112233" required />
          </div>

          {/* Upload de Foto de Perfil Corporativa */}
          <div className="space-y-2 pt-1 border-t border-[#0F1115]/10">
            <label className="text-xs font-medium text-[#0F1115] block">
              Foto de Perfil Corporativa
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border border-[#D4AF37] shadow-xs"
                />
              </div>

              <div className="flex-1 space-y-1">
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
                      <span>Selecionar Foto do Computador / Celular</span>
                    </>
                  )}
                </Button>

                {photoUrl.includes("supabase.co") && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    Hospedada no Supabase CDN
                  </span>
                )}

                {uploadFeedback && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {uploadFeedback}
                  </p>
                )}
              </div>
            </div>

            <input type="hidden" name="photoUrl" value={photoUrl} />
          </div>

          <Textarea
            name="bio"
            label="Mini-biografia Editorial"
            rows={3}
            placeholder="Breve resumo da trajetória, áreas de especialização e diferenciais do corretor..."
            defaultValue="Especialista em propriedades de alto padrão e investimentos imobiliários com atendimento consultivo."
          />

          {/* Permissão Especial de Gestão & Delegação */}
          <div className="p-3.5 bg-[#FBF9F5] border border-[#D4AF37]/40 rounded-xs space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="canAssignBroker"
                value="true"
                className="mt-1 h-4 w-4 rounded border-[#0F1115]/20 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37]"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#0F1115] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  Permissão para Delegar e Atribuir Imóveis
                </span>
                <p className="text-[11px] text-[#6B6862] font-light leading-relaxed">
                  Permite que este corretor cadastre imóveis em nome de outros consultores da equipe (para ajudar colegas) ou sem corretor exclusivo (acervo geral da imobiliária).
                </p>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#0F1115]/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="champagne"
              isLoading={isPending}
              className="px-6 text-xs uppercase tracking-widest font-semibold"
            >
              Criar Credenciais
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
