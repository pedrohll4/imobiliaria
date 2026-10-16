"use client";

import React, { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createManualLeadAction, LeadActionResult } from "@/actions/leadActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  UserPlus,
  Phone,
  Mail,
  Building,
  UserCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { PropertyOption, BrokerOption } from "@/components/leads/ManualLeadModal";

interface ManualLeadFormProps {
  properties: PropertyOption[];
  brokers?: BrokerOption[];
  canAssignBroker?: boolean;
  currentBrokerId?: string;
  currentBrokerName?: string;
}

const SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Cadastro Manual / Interno" },
  { value: "WHATSAPP", label: "WhatsApp Pessoal / Direto" },
  { value: "TELEFONE", label: "Ligação Telefônica" },
  { value: "INDICACAO", label: "Indicação de Cliente ou Parceiro" },
  { value: "PRESENCIAL", label: "Visita Presencial / Escritório" },
  { value: "INSTAGRAM", label: "Instagram / Redes Sociais" },
  { value: "PORTAL", label: "Portal Web" },
  { value: "OUTRO", label: "Outro Canal" },
];

const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo Lead" },
  { value: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { value: "VISITA_AGENDADA", label: "Visita Agendada" },
  { value: "PROPOSTA", label: "Proposta / Em Negociação" },
];

export function ManualLeadForm({
  properties,
  brokers = [],
  canAssignBroker = false,
  currentBrokerId,
  currentBrokerName,
}: ManualLeadFormProps) {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedBrokerId, setSelectedBrokerId] = useState(currentBrokerId || "");
  const [selectedSource, setSelectedSource] = useState("MANUAL");
  const [selectedStatus, setSelectedStatus] = useState("NOVO");

  const [state, formAction, isPending] = useActionState<LeadActionResult | null, FormData>(
    async (prev, formData) => {
      const res = await createManualLeadAction(prev, formData);
      if (res.success) {
        setTimeout(() => {
          router.push("/dashboard/leads");
        }, 1200);
      }
      return res;
    },
    null
  );

  return (
    <form action={formAction} className="bg-[#FFFFFF] border border-[#0F1115]/10 rounded-sm p-6 sm:p-8 space-y-6 shadow-subtle">
      {state?.error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 rounded-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">{state.message}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Redirecionando para a lista de atendimentos...</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#0F1115] pb-2 border-b border-[#0F1115]/10 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#D4AF37]" />
          <span>Dados do Cliente</span>
        </h3>

        <Input
          name="name"
          label="Nome Completo do Cliente *"
          placeholder="Ex: Dr. Roberto Alencar / Mariana Silveira"
          required
          disabled={isPending || state?.success}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="phone"
            label="Telefone / WhatsApp *"
            placeholder="Ex: (11) 98765-4321"
            required
            disabled={isPending || state?.success}
          />

          <Input
            name="email"
            type="email"
            label="E-mail (Opcional)"
            placeholder="cliente@exemplo.com.br"
            disabled={isPending || state?.success}
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="font-serif text-lg text-[#0F1115] pb-2 border-b border-[#0F1115]/10 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#D4AF37]" />
          <span>Origem & Classificação</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742]">
              Canal de Origem
            </label>
            <select
              name="source"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={isPending || state?.success}
              className="w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-2.5 rounded-sm border border-[#0F1115]/15 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742]">
              Status Inicial
            </label>
            <select
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isPending || state?.success}
              className="w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-2.5 rounded-sm border border-[#0F1115]/15 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="font-serif text-lg text-[#0F1115] pb-2 border-b border-[#0F1115]/10 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#D4AF37]" />
          <span>Vínculos & Atendimento</span>
        </h3>

        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742]">
            Imóvel de Interesse (Opcional)
          </label>
          <select
            name="propertyId"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            disabled={isPending || state?.success}
            className="w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-2.5 rounded-sm border border-[#0F1115]/15 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
          >
            <option value="">Nenhum imóvel específico / Contato Geral</option>
            {properties.map((p) => {
              const formattedPrice = p.price
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(p.price)
                : "";
              const loc = [p.neighborhood, p.city].filter(Boolean).join(", ");
              return (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.title} {loc ? `— ${loc}` : ""} {formattedPrice ? `(${formattedPrice})` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-1.5">
          {canAssignBroker ? (
            <>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0F1115] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Definir Corretor Responsável *
                </span>
                <span className="text-[10px] text-[#8C8983] font-normal lowercase">
                  (os dados deste corretor aparecerão no link do lead)
                </span>
              </label>
              <select
                name="brokerId"
                value={selectedBrokerId}
                onChange={(e) => setSelectedBrokerId(e.target.value)}
                disabled={isPending || state?.success}
                className="w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-2.5 rounded-sm border border-[#0F1115]/15 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 font-medium"
                required
              >
                <option value="">Selecione o corretor responsável...</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    👤 {b.name} (CRECI {b.creci})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="p-3 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs flex items-center justify-between text-xs">
              <span className="text-[#6B6862]">Corretor Responsável:</span>
              <span className="font-semibold text-[#0F1115]">
                {currentBrokerName || "Você (Seu Perfil)"}
              </span>
              <input type="hidden" name="brokerId" value={currentBrokerId || ""} />
            </div>
          )}
        </div>

        <Textarea
          name="message"
          label="Observações / Perfil do Cliente"
          rows={4}
          placeholder="Ex: Cliente busca cobertura ou casa com 4 suítes e espaço gourmet até R$ 8 milhões. Prefere contato no período da tarde."
          disabled={isPending || state?.success}
        />
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-[#0F1115]/10">
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6B6862] hover:text-[#0F1115] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Atendimentos</span>
        </Link>

        <Button
          type="submit"
          variant="champagne"
          isLoading={isPending}
          disabled={isPending || state?.success}
          className="px-8 text-xs uppercase tracking-widest font-semibold"
        >
          {state?.success ? "Lead Salvo!" : "Cadastrar Lead"}
        </Button>
      </div>
    </form>
  );
}
