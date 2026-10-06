"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, DollarSign, Bed, ChevronDown, X } from "lucide-react";
import { LocationAutocomplete } from "@/components/common/LocationAutocomplete";

function formatShortCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return "";
  if (num >= 1000000) {
    const mi = num / 1000000;
    return mi % 1 === 0 ? `${mi}M` : `${mi.toFixed(1)}M`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k} mil` : `${k.toFixed(0)} mil`;
  }
  return num.toLocaleString("pt-BR");
}

const PRICE_PRESETS = [
  { label: "Até R$ 200 mil", min: "", max: "200000" },
  { label: "R$ 200 mil a 400 mil", min: "200000", max: "400000" },
  { label: "R$ 400 mil a 700 mil", min: "400000", max: "700000" },
  { label: "R$ 700 mil a 1,2 milhão", min: "700000", max: "1200000" },
  { label: "R$ 1,2 mi a 2,5 milhões", min: "1200000", max: "2500000" },
  { label: "Acima de R$ 2,5 milhões", min: "2500000", max: "" },
];

export function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const pricePopoverRef = useRef<HTMLDivElement>(null);

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(e.target as Node)) {
        setIsPriceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPriceLabel = () => {
    if (!minPrice && !maxPrice) return "Qualquer Valor";
    if (minPrice && maxPrice) return `R$ ${formatShortCurrency(minPrice)} a ${formatShortCurrency(maxPrice)}`;
    if (!minPrice && maxPrice) return `Até R$ ${formatShortCurrency(maxPrice)}`;
    if (minPrice && !maxPrice) return `A partir de R$ ${formatShortCurrency(minPrice)}`;
    return "Qualquer Valor";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    params.set("purpose", "VENDA");
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Selo Superior de Aquisição Exclusiva */}
      <div className="inline-flex rounded-t-sm border-t border-l border-r border-white/20 bg-[#0B0D12]/80 backdrop-blur-md overflow-hidden px-5 py-2.5 gap-2 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        <span className="text-xs uppercase tracking-widest font-semibold text-[#D4AF37]">
          Aquisições & Vendas Exclusivas
        </span>
      </div>

      {/* Caixa de Busca */}
      <form
        onSubmit={handleSearch}
        className="bg-[#FFFFFF] border border-[#0F1115]/10 shadow-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center rounded-b-sm rounded-tr-sm relative z-30"
      >
        {/* Localização com Autocomplete Inteligente em Ariquemes */}
        <div className="lg:col-span-3 border-b sm:border-b-0 sm:border-r border-[#0F1115]/10 pb-2 sm:pb-0 sm:pr-3 relative">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            Localização em Ariquemes
          </label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Setor 01, Setor 03, Condomínios..."
            inputClassName="text-sm text-[#0F1115] placeholder:text-[#B5B2AB] bg-transparent font-normal"
          />
        </div>

        {/* Tipo de Imóvel (Popular e Fácil) */}
        <div className="lg:col-span-3 border-b sm:border-b-0 sm:border-r border-[#0F1115]/10 pb-2 sm:pb-0 sm:pr-3">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
            Tipo de Imóvel
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full text-sm text-[#0F1115] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="">Todos os Tipos</option>
            <option value="CASA">Casa</option>
            <option value="CONDOMINIO">Casa em Condomínio</option>
            <option value="APARTAMENTO">Apartamento</option>
            <option value="TERRENO">Terreno / Lote</option>
            <option value="CHACARA">Chácara / Sítio</option>
            <option value="FAZENDA">Fazenda</option>
            <option value="COMERCIAL">Comercial / Sala / Ponto</option>
            <option value="SOBRADO">Sobrado</option>
            <option value="COBERTURA">Cobertura</option>
          </select>
        </div>

        {/* Faixa de Preço Interativa & Intuitiva */}
        <div
          ref={pricePopoverRef}
          className="lg:col-span-2 border-b sm:border-b-0 sm:border-r border-[#0F1115]/10 pb-2 sm:pb-0 sm:pr-3 relative"
        >
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
            Faixa de Valor
          </label>
          <button
            type="button"
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            className="w-full text-left text-sm text-[#0F1115] flex items-center justify-between gap-1 truncate py-0.5 focus:outline-none"
          >
            <span className={`truncate ${minPrice || maxPrice ? "font-semibold text-[#0F1115]" : "text-[#0F1115]"}`}>
              {getPriceLabel()}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8C8983] shrink-0 transition-transform ${isPriceOpen ? "rotate-180 text-[#D4AF37]" : ""}`} />
          </button>

          {/* Popover Intuitivo de Preços */}
          {isPriceOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2.5 w-[310px] sm:w-[340px] bg-white border border-[#0F1115]/15 shadow-2xl rounded-sm p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#0F1115]/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0F1115]">
                  Definir Faixa de Preço (R$)
                </span>
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="text-[11px] text-[#A39E93] hover:text-[#0F1115] underline"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Inputs Personalizados Mínimo e Máximo */}
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C8983] font-medium block mb-1">
                    Valor Mínimo
                  </label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="Ex: 150000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-[#FBF9F5] border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37] text-[#0F1115]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C8983] font-medium block mb-1">
                    Valor Máximo
                  </label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="Ex: 800000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-[#FBF9F5] border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37] text-[#0F1115]"
                  />
                </div>
              </div>

              {/* Atalhos Rápidos Mais Populares */}
              <div className="space-y-1 mb-3.5">
                <span className="text-[10px] uppercase tracking-wider text-[#8C8983] font-medium block">
                  Faixas Mais Buscadas:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRICE_PRESETS.map((preset) => {
                    const isSelected = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMinPrice("");
                            setMaxPrice("");
                          } else {
                            setMinPrice(preset.min);
                            setMaxPrice(preset.max);
                          }
                        }}
                        className={`text-left text-[11px] px-2.5 py-1.5 rounded-xs border transition-colors truncate ${
                          isSelected
                            ? "bg-[#D4AF37] text-[#0B0D12] border-[#D4AF37] font-semibold shadow-xs"
                            : "bg-[#FBF9F5] text-[#4A4742] border-[#0F1115]/10 hover:border-[#D4AF37]/50 hover:bg-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Concluir Seleção */}
              <button
                type="button"
                onClick={() => setIsPriceOpen(false)}
                className="w-full py-2 bg-[#0B0D12] text-[#FBF9F5] hover:bg-[#1C202C] text-xs uppercase tracking-wider font-medium rounded-xs transition-colors"
              >
                Confirmar Valor
              </button>
            </div>
          )}
        </div>

        {/* Quartos / Suítes */}
        <div className="lg:col-span-2 pb-2 sm:pb-0 sm:pr-2">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
            Quartos
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full text-sm text-[#0F1115] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="">Indiferente</option>
            <option value="2">2+ Quartos</option>
            <option value="3">3+ Quartos</option>
            <option value="4">4+ Quartos</option>
            <option value="5">5+ Quartos</option>
          </select>
        </div>

        {/* Botão Encontrar Imóvel */}
        <div className="lg:col-span-2">
          <button
            type="submit"
            className="w-full h-12 bg-[#0B0D12] text-[#FBF9F5] hover:bg-[#1C202C] active:bg-[#000000] font-medium text-xs uppercase tracking-widest px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md group"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
