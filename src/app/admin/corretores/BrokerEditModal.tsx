"use client";

import React, { useState, useActionState, useRef } from "react";
import { updateBrokerByAdminAction, BrokerActionResult } from "@/actions/brokerActions";
import { uploadBrokerImageAction } from "@/actions/uploadActions";
import { uploadDirectToSupabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/imageOptimization";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Edit2, UploadCloud, Loader2, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

interface BrokerEditModalProps {
  broker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    creci: string;
    photoUrl: string;
    bio: string;
    canAssignBroker?: boolean;
  };
}

export function BrokerEditModal({ broker }: BrokerEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(broker.photoUrl);
  const [canAssignBroker, setCanAssignBroker] = useState(broker.canAssignBroker ?? false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<BrokerActionResult | null, FormData>(
    async (prev, formData) => {
      formData.set("brokerId", broker.id);
      formData.set("photoUrl", photoUrl);
      formData.set("canAssignBroker", String(canAssignBroker));
      const res = await updateBrokerByAdminAction(prev, formData);
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
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        mimeType: "image/webp",
      });

      let uploadedUrl: string | null = null;
      const directRes = await uploadDirectToSupabase(compressed.file, "brokers");
      if (directRes.success && directRes.url) {
        uploadedUrl = directRes.url;
      } else {
        const fd = new FormData();
        fd.append("file", compressed.file);
        const res = await uploadBrokerImageAction(fd);
        if (res.success && res.url) {
          uploadedUrl = res.url;
        } else {
          throw new Error(directRes.error || res.error || "Falha no upload para o Supabase.");
        }
      }

      setPhotoUrl(uploadedUrl);
      setUploadFeedback("Foto atualizada e enviada para o Supabase CDN!");
    } catch (err: any) {
      console.error("Erro no upload da foto:", err);
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-[#8C8983] hover:text-[#0F1115] transition-colors rounded-xs hover:bg-[#F4F1EA]"
        title="Editar corretor e foto"
      >
        <Edit2 className="w-4 h-4 text-[#D4AF37]" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Editar Consultor: ${broker.name}`}
        subtitle="Altere a fotografia, contatos comerciais, CRECI e credenciais de acesso."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Seção da Fotografia com Upload Direto */}
          <div className="p-3 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F1115] block">
              Fotografia Profissional
            </span>

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
                  alt={broker.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>

              <div className="flex-1 space-y-1.5">
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
                      <span>Trocar Foto do Dispositivo</span>
                    </>
                  )}
                </Button>

                {photoUrl.includes("supabase.co") && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    Supabase Storage CDN
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

            <Input
              name="photoUrl"
              label="Ou Link Direto da Foto (URL)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="name"
              label="Nome Completo *"
              defaultValue={broker.name}
              required
            />
            <Input
              name="creci"
              label="Registro CRECI *"
              defaultValue={broker.creci}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="email"
              type="email"
              label="E-mail Corporativo (Login) *"
              defaultValue={broker.email}
              required
            />
            <Input
              name="newPassword"
              type="password"
              label="Nova Senha (opcional)"
              placeholder="Deixe em branco para manter"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="phone"
              label="Telefone Comercial *"
              defaultValue={broker.phone}
              required
            />
            <Input
              name="whatsapp"
              label="WhatsApp (com DDD) *"
              defaultValue={broker.whatsapp}
              required
            />
          </div>

          <Textarea
            name="bio"
            label="Mini-biografia Editorial"
            rows={3}
            defaultValue={broker.bio}
          />

          {/* Permissão Especial de Gestão & Delegação */}
          <div className="p-3.5 bg-[#FBF9F5] border border-[#D4AF37]/40 rounded-xs space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={canAssignBroker}
                onChange={(e) => setCanAssignBroker(e.target.checked)}
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
