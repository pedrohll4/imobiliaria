"use client";

import React from "react";
import { Download } from "lucide-react";

interface PwaInstallButtonProps {
  className?: string;
  variant?: "button" | "link";
}

export function PwaInstallButton({ className = "", variant = "link" }: PwaInstallButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-[#0E1117] border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-2.5 rounded-sm hover:bg-[#1A1F2C] transition-all font-medium ${className}`}
      >
        <img
          src="/icons/icon-192x192.png"
          alt="App Icon"
          className="w-4 h-4 rounded-sm object-cover"
        />
        <span>Instalar Aplicativo</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#F6EEDA] transition-colors uppercase tracking-wider font-medium text-left ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
      <span>Instalar App no Celular</span>
    </button>
  );
}
