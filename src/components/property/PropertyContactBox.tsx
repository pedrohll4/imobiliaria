"use client";

import React, { useState, useTransition } from "react";
import {
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Share2,
  Check,
  User,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createLeadAction, LeadActionResult } from "@/actions/leadActions";

interface PropertyContactBoxProps {
  property: {
    id: string;
    code: string;
    title: string;
    price: number;
    purpose: string;
    condoFee?: number | null;
    propertyTax?: number | null;
  };
  broker?: {
    id: string;
    name: string;
    creci: string;
    phone: string;
    whatsapp: string;
    photoUrl: string;
    bio: string;
  } | null;
}

export function PropertyContactBox({ property, broker }: PropertyContactBoxProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"WHATSAPP" | "INTEREST" | "VISIT">("WHATSAPP");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submissionResult, setSubmissionResult] = useState<LeadActionResult | null>(null);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(property.price);

  const displayPrice = formattedPrice;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openLeadModal = (type: "WHATSAPP" | "INTEREST" | "VISIT") => {
    setModalType(type);
    setSubmissionResult(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("source", modalType);

    startTransition(async () => {
      const res = await createLeadAction(null, formData);
      setSubmissionResult(res);

      if (res.success && res.whatsappUrl) {
        if (typeof window !== "undefined") {
          // Abre a conversa no WhatsApp em uma nova aba
          window.open(res.whatsappUrl, "_blank");
        }
      }
    });
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-7 rounded-sm shadow-subtle space-y-6 sticky top-28">
        {/* Preço e Encargos */}
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#8C8983] font-medium">
            Valor de Venda
          </span>
          <p className="font-serif text-3xl font-normal text-[#0F1115] mt-1 tracking-tight">
            {displayPrice}
          </p>

          {(property.condoFee || property.propertyTax) && (
            <div className="flex items-center gap-4 text-xs text-[#6B6862] mt-2 pt-2 border-t border-[#0F1115]/5">
              {property.condoFee && (
                <span>
                  Condomínio:{" "}
                  <strong>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(property.condoFee)}
                  </strong>
                </span>
              )}
              {property.propertyTax && (
                <span>
                  IPTU:{" "}
                  <strong>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(property.propertyTax)}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Informações do Corretor Responsável */}
        {broker ? (
          <div className="pt-4 border-t border-[#0F1115]/10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Corretor Responsável
            </span>
            <div className="flex items-center gap-3.5 mt-2.5">
              <img
                src={broker.photoUrl}
                alt={broker.name}
                className="w-13 h-13 rounded-full object-cover border border-[#0F1115]/10"
              />
              <div>
                <h4 className="font-serif text-base font-medium text-[#0F1115]">
                  {broker.name}
                </h4>
                <p className="text-xs text-[#8C8983] font-mono tracking-wider">
                  {broker.creci}
                </p>
                <p className="text-xs text-[#4A4742] mt-0.5">{broker.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-[#0F1115]/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#8C8983]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#0F1115]">
                Equipe de Atendimento Privado
              </h4>
              <p className="text-xs text-[#8C8983]">Consultoria imobiliária especializada</p>
            </div>
          </div>
        )}

        {/* Botões de Ação com Captura Prévia de Lead */}
        <div className="space-y-2.5 pt-2">
          {/* Botão Falar no WhatsApp: captura lead e inicia WhatsApp */}
          <button
            type="button"
            onClick={() => openLeadModal("WHATSAPP")}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm active:scale-[0.99]"
          >
            <MessageSquare className="w-4 h-4 text-[#0B0D12]" />
            <span>Falar no WhatsApp</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#0B0D12]" />
          </button>

          {/* Botão Tenho Interesse */}
          <Button
            variant="primary"
            onClick={() => openLeadModal("INTEREST")}
            className="w-full py-3 text-xs uppercase tracking-widest"
          >
            Tenho Interesse
          </Button>

          {/* Botão Agendar Visita Privada */}
          <Button
            variant="outline"
            onClick={() => openLeadModal("VISIT")}
            className="w-full py-2.5 text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Agendar Visita Privada</span>
          </Button>
        </div>

        {/* Botão Compartilhar */}
        <div className="pt-2 border-t border-[#0F1115]/5 flex items-center justify-between">
          <span className="text-xs text-[#8C8983] font-light">Código: {property.code}</span>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6862] hover:text-[#0F1115] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Link copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Captura de Lead & Conexão WhatsApp */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === "WHATSAPP"
            ? "Falar no WhatsApp com o Consultor"
            : modalType === "INTEREST"
            ? "Demonstração de Interesse"
            : "Agendamento de Visita Privada"
        }
        subtitle={`Referente ao imóvel: ${property.title} (Cód. ${property.code})`}
      >
        {submissionResult?.success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl text-[#0F1115]">
                {modalType === "WHATSAPP"
                  ? "Atendimento Solicitado com Sucesso!"
                  : "Solicitação Enviada com Sucesso"}
              </h4>
              <p className="text-xs text-[#6B6862] font-light max-w-sm mx-auto leading-relaxed">
                Seu contato foi salvo em nossa central de atendimento e direcionado diretamente para{" "}
                <strong>{broker?.name || "nossa equipe"}</strong>.
              </p>
            </div>

            {submissionResult.whatsappUrl && (
              <div className="pt-3 pb-1">
                <a
                  href={submissionResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#0B0D12]" />
                  <span>Continuar para a Conversa no WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4 text-[#0B0D12]" />
                </a>
                <p className="text-[11px] text-[#8C8983] font-light mt-1.5">
                  Uma nova janela do WhatsApp deve ter sido aberta automaticamente.
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="text-xs uppercase tracking-wider"
              >
                Fechar Janela
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="propertyId" value={property.id} />

            {/* Honeypot anti-spam */}
            <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
              <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
            </div>

            {submissionResult?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submissionResult.error}</span>
              </div>
            )}

            <div className="p-3 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs text-xs text-[#6B6862] leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                {modalType === "WHATSAPP"
                  ? "Informe seu nome e WhatsApp para iniciarmos seu atendimento exclusivo com o consultor responsável."
                  : "Preencha seus dados para que nosso consultor prepare as informações completas do imóvel para você."}
              </span>
            </div>

            <Input
              name="name"
              label="Seu Nome Completo *"
              placeholder="Ex: Dra. Mariana Albuquerque"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="phone"
                type="tel"
                label="WhatsApp com DDD *"
                placeholder="(69) 99234-5678"
                required
              />
              <Input
                name="email"
                type="email"
                label="E-mail (opcional)"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            <Textarea
              name="message"
              label="Mensagem ou Dúvida Inicial"
              rows={3}
              defaultValue={
                modalType === "VISIT"
                  ? `Olá! Gostaria de agendar uma visita privada ao imóvel ${property.title} (${property.code}).`
                  : modalType === "WHATSAPP"
                  ? `Olá! Tenho interesse no imóvel ${property.title} (${property.code}) e gostaria de atendimento.`
                  : `Olá! Tenho interesse no imóvel ${property.title} (${property.code}) e gostaria de mais informações.`
              }
            />

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#0F1115]/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="champagne"
                isLoading={isPending}
                className="px-6 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"
              >
                {modalType === "WHATSAPP" ? (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Iniciar no WhatsApp</span>
                  </>
                ) : modalType === "INTEREST" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enviar e Conversar</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirmar Solicitação</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
