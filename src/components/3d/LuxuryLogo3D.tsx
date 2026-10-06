"use client";

import React from "react";

export function LuxuryLogo3D() {
  return (
    <div className="relative w-full max-w-lg flex items-center justify-center">
      {/* Halo de iluminação sutil dourado de fundo */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none -z-0" />
      
      {/* Imagem Oficial da Logotipo Yuri Almeida Imóveis */}
      <img
        src="/images/logo-yuri-almeida.png"
        alt="YURI ALMEIDA IMÓVEIS"
        className="relative z-10 w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:scale-[1.02]"
      />
    </div>
  );
}
