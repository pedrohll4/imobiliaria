"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registrado com sucesso:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Falha ao registrar Service Worker:", err);
        });
    }

    // 2. Verificar se já está rodando em modo standalone (já instalado)
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (checkStandalone) {
      setIsStandalone(true);
      return;
    }

    // 3. Detectar se é dispositivo iOS (iPhone / iPad)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 4. Capturar evento de instalação no Android/Chrome/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissedUntil = localStorage.getItem("ya_pwa_dismissed");
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Se for iOS e nunca dispensou, mostra o banner após alguns segundos
    if (isIosDevice) {
      const dismissedUntil = localStorage.getItem("ya_pwa_dismissed");
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setTimeout(() => setShowBanner(true), 3500);
      }
    }

    // Evento quando o app for instalado
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccessfully(true);
      setTimeout(() => setInstalledSuccessfully(false), 5000);
    });

    // Escutar evento customizado para acionar instalação de qualquer botão do site (ex: navbar/footer)
    const handleTriggerPrompt = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else if (isIosDevice) {
        setShowIOSModal(true);
      } else {
        // Fallback genérico com modal
        setShowIOSModal(true);
      }
    };

    window.addEventListener("trigger-pwa-install", handleTriggerPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("trigger-pwa-install", handleTriggerPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Não incomoda de novo pelas próximas 48 horas
    localStorage.setItem("ya_pwa_dismissed", String(Date.now() + 48 * 60 * 60 * 1000));
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Notificação de sucesso de instalação */}
      {installedSuccessfully && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0E1117] text-[#FBF9F5] border border-[#D4AF37]/50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Aplicativo Instalado</p>
            <p className="text-xs text-stone-300">O ícone oficial agora está disponível na tela do seu celular.</p>
          </div>
        </div>
      )}

      {/* Banner Flutuante de Instalação (Mobile & Desktop) */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-[#0B0D12]/95 backdrop-blur-xl border border-[#D4AF37]/30 text-[#FBF9F5] p-4 rounded-2xl shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Efeito sutil de luz dourada ao fundo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10">
              {/* Ícone 3D em miniatura */}
              <div className="relative w-13 h-13 rounded-xl overflow-hidden shadow-lg border border-[#D4AF37]/40 flex-shrink-0 bg-[#0E1117]">
                <img
                  src="/icons/icon-192x192.png"
                  alt="App Yuri Almeida Imóveis"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                    Aplicativo Oficial
                  </span>
                </div>
                <h4 className="text-sm font-serif text-white font-medium truncate mt-0.5">
                  Yuri Almeida Imóveis
                </h4>
                <p className="text-[11px] text-stone-400 leading-tight mt-1">
                  Instale no seu celular para acesso rápido e exclusivo às melhores oportunidades.
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="absolute top-1 right-1 p-1.5 text-stone-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/[0.08] relative z-10">
              <button
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#ECC66B] to-[#BF8A28] text-[#0B0D12] text-xs font-semibold py-2.5 px-3.5 rounded-lg shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar no Celular</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-stone-400 hover:text-stone-200 px-3 py-2 transition-colors font-medium"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guiado para iPhone (Safari iOS) e Outros Navegadores */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E1117] border border-[#D4AF37]/30 text-[#FBF9F5] w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-6">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Topo com Ícone 3D */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-[#D4AF37]/50 bg-[#0E1117] flex-shrink-0">
                <img
                  src="/icons/icon-192x192.png"
                  alt="App Yuri Almeida Imóveis"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                  Instalação no Celular
                </span>
                <h3 className="font-serif text-lg text-white font-medium">
                  Yuri Almeida Imóveis
                </h3>
                <p className="text-xs text-stone-400">
                  {isIOS ? "Guia rápido para iPhone (iOS)" : "Adicionar à tela de início"}
                </p>
              </div>
            </div>

            {/* Passos de Instalação */}
            <div className="space-y-3.5 text-xs text-stone-300 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-stone-200">
                        No navegador Safari, toque no botão de <strong>Compartilhar</strong> na barra inferior:
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded text-[11px] text-[#D4AF37]">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Ícone de Compartilhar</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-stone-200">
                        Role as opções para cima e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>:
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded text-[11px] text-[#D4AF37]">
                        <PlusSquare className="w-3.5 h-3.5" />
                        <span>Adicionar à Tela de Início</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-stone-200">
                        Toque em <strong>Adicionar</strong> no canto superior direito. O aplicativo aparecerá com o ícone oficial 3D na sua tela!
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-stone-200">
                        Toque no menu do navegador (três pontinhos no canto superior direito).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-stone-200">
                        Selecione <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-semibold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-stone-200">
                        Confirme a instalação para ter acesso direto sem barra de navegador.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full bg-[#D4AF37] text-[#0B0D12] text-xs font-semibold py-2.5 rounded-lg hover:bg-[#C29F2D] transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Função utilitária para acionar a instalação de qualquer botão do site
 */
export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
  }
}
