"use client";

import React, { useTransition } from "react";
import { reassignPropertyBrokerAction } from "@/actions/propertyActions";
import { Loader2 } from "lucide-react";

interface PropertyBrokerReassignProps {
  propertyId: string;
  currentBrokerId?: string | null;
  brokers: { id: string; name: string; creci: string }[];
}

export function PropertyBrokerReassignSelect({
  propertyId,
  currentBrokerId,
  brokers,
}: PropertyBrokerReassignProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newBrokerId = val === "NONE" ? null : val;
    startTransition(async () => {
      await reassignPropertyBrokerAction(propertyId, newBrokerId);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        defaultValue={currentBrokerId || "NONE"}
        onChange={handleChange}
        disabled={isPending}
        className="text-[11px] font-medium text-[#0F1115] bg-[#FBF9F5] hover:bg-[#F4F1EA] border border-[#0F1115]/15 rounded-xs px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all max-w-[190px] truncate"
        title="Alterar corretor responsável pelo imóvel"
      >
        <option value="NONE">🏢 Imobiliária Geral</option>
        {brokers.map((b) => (
          <option key={b.id} value={b.id}>
            👤 {b.name} ({b.creci})
          </option>
        ))}
      </select>
      {isPending && (
        <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37] shrink-0" />
      )}
    </div>
  );
}
