import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: "Curadoria exclusiva de imóveis de alto padrão, coberturas, residências assinadas e propriedades singulares.",
  keywords: ["imóveis de luxo", "coberturas", "alto padrão", "imobiliária boutique", "arquitetura contemporânea"],
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: "Curadoria de imóveis singulares e residências de alto padrão.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FBF9F5] text-[#0F1115]">
        {children}
      </body>
    </html>
  );
}
