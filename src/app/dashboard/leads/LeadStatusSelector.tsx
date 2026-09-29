"use client";

import React, { useState, useTransition } from "react";
import { updateLeadStatusAction } from "@/actions/leadActions";
import { MessageSquare, Phone, Mail, ArrowUpRight, Clock } from "lucide-react";

interface LeadItemProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    createdAt: Date | string;
    property?: {
      id: string;
      title: string;
      code: string;
    } | null;
  };
}

const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo Lead" },
  { value: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { value: "VISITA_AGENDADA", label: "Visita Agendada" },
  { value: "PROPOSTA", label: "Proposta Enviada" },
  { value: "FECHADO", label: "Negócio Fechado" },
  { value: "PERDIDO", label: "Perdido / Desistência" },
];

export function LeadStatusSelector({ lead }: LeadItemProps) {
  const [status, setStatus] = useState(lead.status);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateLeadStatusAction(lead.id, newStatus);
    });
  };

  // WhatsApp link para responder o cliente diretamente
  const cleanPhone = lead.phone.replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const greeting = `Olá ${lead.name}, tudo bem? Sou o consultor responsável pelo imóvel ${lead.property?.title || "de alto padrão"}. Recebi sua mensagem através do portal e estou à disposição.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(greeting)}`;

  return (
    <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle space-y-4 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0F1115]/5">
        <div>
          <h3 className="font-serif text-lg font-medium text-[#0F1115]">
            {lead.name}
          </h3>
          {lead.property ? (
            <p className="text-xs text-[#8C8983] font-light">
              Interesse em: <strong className="text-[#0F1115] font-normal">{lead.property.title}</strong> ({lead.property.code})
            </p>
          ) : (
            <p className="text-xs text-[#8C8983]">Contato Institucional</p>
          )}
        </div>

        {/* Seletor de Status Reativo */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-wider text-[#8C8983]">
            Status:
          </label>
          <select
            value={status}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded-xs border font-medium cursor-pointer transition-colors focus:outline-none ${
              status === "NOVO"
                ? "bg-[#D4AF37]/15 text-[#9B7826] border-[#D4AF37]/30"
                : status === "VISITA_AGENDADA"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : status === "FECHADO"
                ? "bg-emerald-900 text-white border-emerald-900"
                : "bg-[#F4F1EA] text-[#0F1115] border-[#0F1115]/15"
            }`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mensagem do Lead */}
      <div className="p-3 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs text-xs text-[#4A4742] leading-relaxed">
        &ldquo;{lead.message}&rdquo;
      </div>

      {/* Contatos & Ações Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#6B6862]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            {lead.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
            {lead.email}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#8C8983] flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] text-[#0B0D12] font-semibold text-[11px] uppercase tracking-wider rounded-xs hover:bg-[#C29F2D] transition-all shadow-sm"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Responder no WhatsApp</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
