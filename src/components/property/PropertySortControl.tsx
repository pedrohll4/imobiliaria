"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function PropertySortControl({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "recent";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0F1115]/10 mb-8">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#8C8983] font-medium">
          Resultados da Curadoria
        </p>
        <h2 className="font-serif text-2xl font-normal text-[#0F1115]">
          {totalCount} {totalCount === 1 ? "propriedade encontrada" : "propriedades encontradas"}
        </h2>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <label
          htmlFor="sort-select"
          className="text-xs uppercase tracking-wider text-[#6B6862] flex items-center gap-1.5 font-medium"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
          Ordenar:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className="text-xs bg-[#FFFFFF] border border-[#0F1115]/15 px-3 py-2 rounded-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
        >
          <option value="recent">Mais Recentes</option>
          <option value="price_asc">Menor Preço</option>
          <option value="price_desc">Maior Preço</option>
          <option value="area_desc">Maior Área (m²)</option>
        </select>
      </div>
    </div>
  );
}
