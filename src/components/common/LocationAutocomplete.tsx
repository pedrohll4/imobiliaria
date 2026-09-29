"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Building2, Trees, Compass, X, Check } from "lucide-react";

export interface LocationOption {
  label: string;
  value: string;
  city: string;
  type: "CONDOMINIO" | "BAIRRO" | "CIDADE" | "AGRO";
}

export const RONDONIA_LOCATIONS: LocationOption[] = [
  { label: "Alphaville Porto Velho", value: "Alphaville", city: "Porto Velho, RO", type: "CONDOMINIO" },
  { label: "Ecoville Porto Velho", value: "Ecoville", city: "Porto Velho, RO", type: "CONDOMINIO" },
  { label: "Bairro Olaria", value: "Olaria", city: "Porto Velho, RO", type: "BAIRRO" },
  { label: "Bairro Liberdade", value: "Liberdade", city: "Porto Velho, RO", type: "BAIRRO" },
  { label: "Bairro Rio Madeira & Orla Náutica", value: "Rio Madeira", city: "Porto Velho, RO", type: "BAIRRO" },
  { label: "San Pelegrino", value: "San Pelegrino", city: "Porto Velho, RO", type: "CONDOMINIO" },
  { label: "Porto Velho (Toda a Capital)", value: "Porto Velho", city: "Rondônia", type: "CIDADE" },
  { label: "Ji-Paraná", value: "Ji-Paraná", city: "Rondônia", type: "CIDADE" },
  { label: "Bairro Dois de Abril", value: "Dois de Abril", city: "Ji-Paraná, RO", type: "BAIRRO" },
  { label: "Cacoal", value: "Cacoal", city: "Rondônia", type: "CIDADE" },
  { label: "Bosque dos Ipês", value: "Bosque dos Ipês", city: "Cacoal, RO", type: "CONDOMINIO" },
  { label: "Vilhena", value: "Vilhena", city: "Rondônia", type: "CIDADE" },
  { label: "Jardim Eldorado", value: "Jardim Eldorado", city: "Vilhena, RO", type: "BAIRRO" },
  { label: "Ariquemes", value: "Ariquemes", city: "Rondônia", type: "CIDADE" },
  { label: "Grandes Fazendas & Haras em RO", value: "Fazenda", city: "Rondônia (Agronegócio)", type: "AGRO" },
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  autoSelectFirst?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Porto Velho, Alphaville, Cacoal...",
  className = "",
  inputClassName = "",
  dropdownClassName = "w-[360px] sm:w-[420px] max-w-[calc(100vw-2.5rem)]",
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções com base no texto digitado (insensível a acentos e maiúsculas)
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredLocations = value.trim()
    ? RONDONIA_LOCATIONS.filter((item) => {
        const query = normalize(value);
        return (
          normalize(item.label).includes(query) ||
          normalize(item.value).includes(query) ||
          normalize(item.city).includes(query)
        );
      })
    : RONDONIA_LOCATIONS;

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: LocationOption) => {
    onChange(item.value);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredLocations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLocations.length - 1
      );
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0 && filteredLocations[activeIndex]) {
        e.preventDefault();
        handleSelect(filteredLocations[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getTypeBadge = (type: LocationOption["type"]) => {
    switch (type) {
      case "CONDOMINIO":
        return {
          label: "Condomínio",
          icon: Compass,
          className: "bg-[#D4AF37]/20 text-[#9B7826] border-[#D4AF37]/40",
        };
      case "BAIRRO":
        return {
          label: "Bairro Nobre",
          icon: MapPin,
          className: "bg-[#0B0D12]/5 text-[#4A4742] border-[#0F1115]/10",
        };
      case "CIDADE":
        return {
          label: "Cidade",
          icon: Building2,
          className: "bg-[#0B0D12] text-[#FBF9F5] border-transparent",
        };
      case "AGRO":
        return {
          label: "Agronegócio",
          icon: Trees,
          className: "bg-emerald-900/10 text-emerald-800 border-emerald-300",
        };
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full focus:outline-none ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              inputRef.current?.focus();
            }}
            className="p-1 text-[#8C8983] hover:text-[#0F1115] transition-colors"
            title="Limpar localização"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown de Sugestões de Rondônia */}
      {isOpen && (
        <div className={`absolute left-0 top-full mt-2.5 bg-[#FFFFFF] border border-[#0F1115]/15 rounded-sm shadow-2xl z-[100] max-h-80 flex flex-col animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden ${dropdownClassName}`}>
          <div className="px-3.5 py-2.5 bg-[#FBF9F5] border-b border-[#0F1115]/10 flex items-center justify-between whitespace-nowrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8983]">
              {value.trim() ? "Resultados em Rondônia" : "Principais Regiões de Rondônia"}
            </span>
            <span className="text-[10px] font-mono text-[#D4AF37]">RO • Brasil</span>
          </div>

          <div className="overflow-y-auto divide-y divide-[#0F1115]/5">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((item, index) => {
                const badge = getTypeBadge(item.type);
                const IconComponent = badge.icon;
                const isSelected =
                  normalize(value.trim()) === normalize(item.value) ||
                  normalize(value.trim()) === normalize(item.label);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${item.value}-${index}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      isActive
                        ? "bg-[#D4AF37]/10"
                        : "hover:bg-[#FBF9F5]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xs bg-[#0B0D12]/5 flex items-center justify-center shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#0F1115] truncate">
                            {item.label}
                          </span>
                          {isSelected && (
                            <Check className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#8C8983] block truncate">
                          {item.city}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-xs border shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#8C8983]">
                <p>Nenhuma região pré-definida com "{value}".</p>
                <p className="text-[11px] text-[#55524D] mt-1">
                  Pressione <strong>Buscar</strong> para pesquisar mesmo assim em todo o banco de dados.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
