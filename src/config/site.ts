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
  name: "IMOBILIÁRIA CONCEITO",
  tagline: "Residências e Empreendimentos de Alto Padrão",
  shortName: "Conceito",
  logoText: "IC",
  logoPlaceholder: "[ IMOBILIÁRIA CONCEITO ]",
  // Quando possuir a imagem da logo oficial, insira a URL aqui:
  logoUrl: undefined,
  
  contact: {
    phone: "(69) 3211-9000",
    whatsapp: "5569999887766",
    whatsappFormatted: "(69) 99988-7766",
    email: "privativo@imobiliariaconceito.com.br",
    address: {
      street: "Avenida Jorge Teixeira, 1850 - Edifício Amazon Corporate, 12º Andar",
      neighborhood: "Embratel",
      city: "Porto Velho",
      state: "RO",
      zipCode: "76820-800",
    },
    creciJ: "CRECI 3.820-J/RO",
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
