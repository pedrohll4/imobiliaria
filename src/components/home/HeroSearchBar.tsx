"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, DollarSign, Bed } from "lucide-react";
import { LocationAutocomplete } from "@/components/common/LocationAutocomplete";

export function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    params.set("purpose", "VENDA");
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (bedrooms) params.set("bedrooms", bedrooms);

    if (priceRange) {
      if (priceRange === "under-5m") {
        params.set("maxPrice", "5000000");
      } else if (priceRange === "5m-15m") {
        params.set("minPrice", "5000000");
        params.set("maxPrice", "15000000");
      } else if (priceRange === "15m-30m") {
        params.set("minPrice", "15000000");
        params.set("maxPrice", "30000000");
      } else if (priceRange === "above-30m") {
        params.set("minPrice", "30000000");
      }
    }

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

      {/* Caixa de Busca Arquitetônica */}
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

        {/* Tipo de Imóvel */}
        <div className="lg:col-span-3 border-b sm:border-b-0 sm:border-r border-[#0F1115]/10 pb-2 sm:pb-0 sm:pr-3">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
            Tipologia
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full text-sm text-[#0F1115] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="">Todas as Tipologias</option>
            <option value="APARTAMENTO">Apartamentos de Alto Padrão</option>
            <option value="COBERTURA">Coberturas & Penthouses</option>
            <option value="CASA">Casas de Arquitetura Assinada</option>
            <option value="CONDOMINIO">Residências em Condomínio</option>
            <option value="FAZENDA">Haras & Fazendas Nobres</option>
            <option value="TERRENO">Lotes & Terrenos Exclusivos</option>
            <option value="COMERCIAL">Corporativo Boutique</option>
          </select>
        </div>

        {/* Faixa de Preço */}
        <div className="lg:col-span-2 border-b sm:border-b-0 sm:border-r border-[#0F1115]/10 pb-2 sm:pb-0 sm:pr-3">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C8983] font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
            Faixa de Valor
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full text-sm text-[#0F1115] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="">Qualquer Valor</option>
            <option value="under-5m">Até R$ 5 Milhões</option>
            <option value="5m-15m">R$ 5M a R$ 15 Milhões</option>
            <option value="15m-30m">R$ 15M a R$ 30 Milhões</option>
            <option value="above-30m">Acima de R$ 30 Milhões</option>
          </select>
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
