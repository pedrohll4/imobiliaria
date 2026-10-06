/**
 * CONFIGURAÇÃO VISUAL E IDENTIDADE DA IMOBILIÁRIA
 * 
 * Este arquivo centraliza todas as informações provisórias da empresa.
 * Quando a identidade visual definitiva for definida, basta atualizar este arquivo
 * para refletir o novo nome, logotipo (URL ou SVG), dados de contato e redes sociais.
 */

export interface SiteConfig {
  name: string;
  tagline: string;
  shortName: string;
  logoText: string;
  logoPlaceholder: string;
  logoUrl?: string; // Preencher quando houver a logo oficial (ex: "/images/logo.svg")
  contact: {
    phone: string;
    whatsapp: string;
    whatsappFormatted: string;
    email: string;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    creciJ: string; // CRECI Jurídico
  };
  social: {
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "YURI ALMEIDA IMÓVEIS",
  tagline: "Residências e Empreendimentos de Alto Padrão",
  shortName: "Yuri Almeida",
  logoText: "YA",
  logoPlaceholder: "[ YURI ALMEIDA IMÓVEIS ]",
  // Logo oficial da marca
  logoUrl: "/images/logo-ya-emblem.png",
  
  contact: {
    phone: "(69) 99368-8063",
    whatsapp: "5569993688063",
    whatsappFormatted: "(69) 99368-8063",
    email: "yurialmeidaimoveis@gmail.com",
    address: {
      street: "Alameda Fortaleza 2950",
      neighborhood: "Setor 03",
      city: "Ariquemes",
      state: "RO",
      zipCode: "76820-800",
    },
    creciJ: "CRECI 5460-J",
  },

  social: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },

  colors: {
    primary: "#0B0D12",
    accent: "#D4AF37",
    background: "#FBF9F5",
  },
};
