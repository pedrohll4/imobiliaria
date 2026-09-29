"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LocationAutocomplete } from "@/components/common/LocationAutocomplete";

export function PropertyFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados dos filtros baseados na URL
  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "");
  const [parkingSpaces, setParkingSpaces] = useState(searchParams.get("parkingSpaces") || "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") || "");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();

    params.set("purpose", "VENDA");
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    if (parkingSpaces) params.set("parkingSpaces", parkingSpaces);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);

    // Manter ordenação se existir
    const currentSort = searchParams.get("sort");
    if (currentSort) params.set("sort", currentSort);

    router.push(`/imoveis?${params.toString()}`);
    setMobileDrawerOpen(false);
  };

  const resetFilters = () => {
    setType("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setMinArea("");
    setMaxArea("");
    router.push("/imoveis");
    setMobileDrawerOpen(false);
  };

  const filterFormContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#0F1115]/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-lg font-medium text-[#0F1115]">
            Filtros Avançados
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-[#8C8983] hover:text-[#0F1115] flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* Localização em Rondônia */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
          Localização em Rondônia
        </label>
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          placeholder="Ex: Porto Velho, Alphaville, Cacoal..."
          inputClassName="w-full text-xs px-3.5 py-2.5 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          dropdownClassName="w-full sm:w-[320px]"
        />

        {/* Chips de Cidades Principais de RO */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["Porto Velho", "Alphaville", "Ji-Paraná", "Cacoal", "Vilhena"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setLocation(location === city ? "" : city)}
              className={`text-[10px] px-2 py-0.5 rounded-xs border transition-colors ${
                location === city
                  ? "bg-[#D4AF37] text-[#0B0D12] border-[#D4AF37] font-semibold"
                  : "bg-white text-[#68655F] border-[#0F1115]/10 hover:border-[#0F1115]/30 hover:text-[#0F1115]"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Tipologia */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
          Tipo de Imóvel
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
        >
          <option value="">Todos os Tipos</option>
          <option value="APARTAMENTO">Apartamento</option>
          <option value="COBERTURA">Cobertura</option>
          <option value="CASA">Casa</option>
          <option value="CONDOMINIO">Casa em Condomínio</option>
          <option value="FAZENDA">Fazenda / Haras</option>
          <option value="CHACARA">Chácara</option>
          <option value="SOBRADO">Sobrado</option>
          <option value="TERRENO">Terreno / Lote</option>
          <option value="COMERCIAL">Comercial Boutique</option>
        </select>
      </div>

      {/* Faixa de Preço */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
          Faixa de Preço (R$)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Mínimo"
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Máximo"
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Quartos e Banheiros */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
            Quartos Mín.
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
            Vagas Mín.
          </label>
          <select
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="6">6+</option>
          </select>
        </div>
      </div>

      {/* Área (m²) */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#4A4742]">
          Área Útil (m²)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            placeholder="Mín m²"
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          />
          <input
            type="number"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            placeholder="Máx m²"
            className="w-full text-xs px-3 py-2 bg-white border border-[#0F1115]/15 rounded-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Botão de Aplicação */}
      <Button
        variant="primary"
        onClick={applyFilters}
        className="w-full py-3 text-xs uppercase tracking-widest font-semibold"
      >
        Filtrar Imóveis
      </Button>
    </div>
  );

  return (
    <>
      {/* Botão Flutuante / Barra de Ação Mobile */}
      <div className="lg:hidden mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
          Filtrar Catálogo
        </Button>
      </div>

      {/* Sidebar Desktop Fixa */}
      <aside className="hidden lg:block w-72 shrink-0 bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 rounded-sm shadow-subtle self-start sticky top-28">
        {filterFormContent}
      </aside>

      {/* Drawer Gaveta Mobile */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FFFFFF] h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8C8983] hover:text-[#0F1115]"
              aria-label="Fechar filtros"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-4">{filterFormContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
