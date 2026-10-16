"use client";

import React, { useTransition } from "react";
import { reassignLeadBrokerAction } from "@/actions/leadActions";
import { Loader2, UserCheck, User } from "lucide-react";

export interface BrokerOption {
  id: string;
  name: string;
  creci: string;
}

interface LeadBrokerReassignSelectProps {
  leadId: string;
  currentBrokerId?: string | null;
  currentBrokerName?: string | null;
  brokers: BrokerOption[];
  isAdmin: boolean;
}

export function LeadBrokerReassignSelect({
  leadId,
  currentBrokerId,
  currentBrokerName,
  brokers,
  isAdmin,
}: LeadBrokerReassignSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#4A4742] bg-[#F4F1EA] px-2.5 py-1 rounded-xs border border-[#0F1115]/10 font-mono">
        <User className="w-3 h-3 text-[#D4AF37]" />
        <span>Corretor: <strong>{currentBrokerName || "Você"}</strong></span>
      </span>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newBrokerId = val === "NONE" ? null : val;
    startTransition(async () => {
      const res = await reassignLeadBrokerAction(leadId, newBrokerId);
      if (!res.success) {
        alert(res.error || "Erro ao reatribuir corretor.");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
      <label className="text-[10px] uppercase tracking-wider text-[#8C8983] font-semibold shrink-0">
        Corretor:
      </label>
      <select
        defaultValue={currentBrokerId || "NONE"}
        onChange={handleChange}
        disabled={isPending}
        className="text-xs font-semibold text-[#0F1115] bg-[#FBF9F5] hover:bg-[#F4F1EA] border border-[#0F1115]/20 rounded-xs px-2.5 py-1 cursor-pointer focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all max-w-[210px] truncate shadow-xs"
        title="Transferir corretor responsável por este lead"
      >
        <option value="NONE">🏢 Sem Corretor (Geral)</option>
        {brokers.map((b) => (
          <option key={b.id} value={b.id}>
            👤 {b.name} ({b.creci})
          </option>
        ))}
      </select>
      {isPending && <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37] shrink-0" />}
    </div>
  );
}
