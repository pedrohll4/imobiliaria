"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bed, Bath, Car, Maximize2, Heart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface PropertyCardProps {
  property: {
    id: string;
    code: string;
    title: string;
    slug: string;
    type: string;
    purpose: string;
    price: number;
    city: string;
    state: string;
    neighborhood: string;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    builtArea: number;
    status: string;
    isFeatured?: boolean;
    images: { url: string; alt?: string | null; isMain?: boolean }[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const mainImage =
    property.images.find((img) => img.isMain)?.url ||
    property.images[0]?.url ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(property.price);

  const displayPrice =
    property.purpose === "ALUGUEL" ? `${formattedPrice}/mês` : formattedPrice;

  return (
    <div className="group relative bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm overflow-hidden shadow-subtle hover:shadow-elevation hover:border-[#D4AF37]/50 transition-all duration-500 flex flex-col">
      {/* Imagem com Zoom Suave */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1E29]">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay gradiente cinematográfico sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Badges superiores */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          <Badge variant="dark" className="text-[10px] tracking-widest bg-[#0B0D12]/90 backdrop-blur-sm">
            {property.type}
          </Badge>
          <Badge
            variant="champagne"
            className="text-[10px] tracking-widest bg-[#D4AF37] text-[#0B0D12] font-bold"
          >
            {property.purpose === "VENDA" ? "Venda" : "Locação"}
          </Badge>
        </div>

        {/* Botão Favoritar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#0B0D12]/60 hover:bg-[#0B0D12] text-white backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-10"
          aria-label="Favoritar imóvel"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"
            }`}
          />
        </button>

        {/* Código do imóvel e Localização sobre a imagem */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
          <span className="text-[11px] font-mono tracking-wider opacity-80 uppercase">
            Cód. {property.code}
          </span>
          <span className="text-xs font-light text-[#EAE7E1] drop-shadow-sm truncate max-w-[200px]">
            {property.neighborhood}, {property.city}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-[#0F1115] line-clamp-1 group-hover:text-[#9B7826] transition-colors tracking-tight">
            <Link href={`/imoveis/${property.id}`} className="focus:outline-none">
              {property.title}
            </Link>
          </h3>
          <p className="font-serif text-xl font-medium text-[#0B0D12] mt-1.5 tracking-tight">
            {displayPrice}
          </p>
        </div>

        {/* Grid de Especificações */}
        <div className="pt-3 border-t border-[#0F1115]/[0.06] grid grid-cols-4 gap-2 text-center text-[#55524D]">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-medium text-[#0F1115]">
              <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{property.bedrooms}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C8983] mt-0.5 font-light">
              Quartos
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-medium text-[#0F1115]">
              <Bath className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{property.bathrooms}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C8983] mt-0.5 font-light">
              Banhos
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-medium text-[#0F1115]">
              <Car className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{property.parkingSpaces}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C8983] mt-0.5 font-light">
              Vagas
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-medium text-[#0F1115]">
              <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{property.builtArea || "-"}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C8983] mt-0.5 font-light">
              m²
            </span>
          </div>
        </div>

        {/* Botão Ver Imóvel */}
        <div className="pt-1">
          <Link
            href={`/imoveis/${property.id}`}
            className="w-full inline-flex items-center justify-between text-xs uppercase tracking-widest font-semibold py-2.5 px-3 border border-[#0F1115]/10 rounded-sm text-[#0B0D12] bg-[#FBF9F5] group-hover:bg-[#0B0D12] group-hover:text-[#FBF9F5] group-hover:border-[#0B0D12] transition-all duration-300"
          >
            <span>Explorar Residência</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
