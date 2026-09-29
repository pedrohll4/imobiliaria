"use client";

import React, { useState, useActionState } from "react";
import { ArrowUpRight, Calendar, MessageSquare, Share2, Check, User } from "lucide-react";
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
  const [modalType, setModalType] = useState<"INTEREST" | "VISIT">("INTEREST");
  const [copied, setCopied] = useState(false);

  const [state, formAction, isPending] = useActionState<LeadActionResult | null, FormData>(
    createLeadAction,
    null
  );

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(property.price);

  const displayPrice =
    property.purpose === "ALUGUEL" ? `${formattedPrice} / mês` : formattedPrice;

  // WhatsApp link formatado com o número real do corretor
  const brokerWhatsApp = broker?.whatsapp || "5511987654321";
  const whatsappMessage = `Olá! Tenho interesse no imóvel ${property.title}, código ${property.code}. Gostaria de mais informações.`;
  const whatsappUrl = `https://wa.me/${brokerWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openLeadModal = (type: "INTEREST" | "VISIT") => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-7 rounded-sm shadow-subtle space-y-6 sticky top-28">
        
        {/* Preço e Encargos */}
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#8C8983] font-medium">
            Valor de {property.purpose === "VENDA" ? "Venda" : "Locação"}
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
              <p className="text-xs text-[#8C8983]">Consultoria especializada</p>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-2.5 pt-2">
          {/* Botão WhatsApp com mensagem pré-formatada */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
          </a>

          {/* Botão Tenho Interesse (Abre formulário de lead) */}
          <Button
            variant="primary"
            onClick={() => openLeadModal("INTEREST")}
            className="w-full py-3 text-xs uppercase tracking-widest"
          >
            Tenho Interesse
          </Button>

          {/* Botão Agendar Visita */}
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

      {/* Modal de Envio de Lead */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === "INTEREST" ? "Demonstração de Interesse" : "Agendamento de Visita"}
        subtitle={`Referente ao imóvel: ${property.title} (Cód. ${property.code})`}
      >
        {state?.success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl text-[#0F1115]">
              Solicitação Enviada com Sucesso
            </h4>
            <p className="text-sm text-[#6B6862] font-light max-w-sm mx-auto">
              {state.message}
            </p>
            <div className="pt-4">
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="propertyId" value={property.id} />

            {state?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs">
                {state.error}
              </div>
            )}

            <Input
              name="name"
              label="Nome Completo *"
              placeholder="Ex: Dra. Mariana Albuquerque"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="email"
                type="email"
                label="E-mail Corporativo ou Pessoal *"
                placeholder="seu.email@exemplo.com"
                required
              />
              <Input
                name="phone"
                type="tel"
                label="Telefone / WhatsApp *"
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            <Textarea
              name="message"
              label="Mensagem / Observações"
              rows={3}
              defaultValue={
                modalType === "VISIT"
                  ? `Olá! Gostaria de agendar uma visita ao imóvel ${property.title}. Tenho preferência para o período da tarde.`
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
                variant="primary"
                isLoading={isPending}
                className="px-6"
              >
                {modalType === "INTEREST" ? "Enviar Interesse" : "Confirmar Solicitação"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
