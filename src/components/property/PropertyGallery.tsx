"use client";

import React, { useState } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  alt?: string | null;
}

export function PropertyGallery({ images, title }: { images: ImageItem[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-[#161922] flex items-center justify-center text-white/50">
        Sem imagens disponíveis
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      {/* Imagem Principal de Grande Porte */}
      <div
        className="relative w-full aspect-[16/9] md:aspect-[16/8] overflow-hidden bg-[#12151D] rounded-sm group cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 bg-[#0B0D12]/80 hover:bg-[#0B0D12] text-white backdrop-blur-md px-3.5 py-2 rounded-xs text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Ver Galeria ({selectedIndex + 1}/{images.length})</span>
        </button>
      </div>

      {/* Miniaturas Navegáveis */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[16/10] overflow-hidden rounded-xs transition-all border ${
                selectedIndex === idx
                  ? "border-[#C5A880] ring-1 ring-[#C5A880] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `${title} miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox em Tela Cheia */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            aria-label="Fechar galeria"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-6xl max-h-[85vh] flex flex-col items-center">
            <img
              src={currentImage.url}
              alt={currentImage.alt || title}
              className="max-w-full max-h-[78vh] object-contain rounded-xs shadow-2xl"
            />
            <p className="text-xs text-white/60 font-mono tracking-widest mt-4 uppercase">
              Foto {selectedIndex + 1} de {images.length}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
