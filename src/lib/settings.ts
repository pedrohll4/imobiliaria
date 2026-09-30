import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export async function getSiteSettings() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (setting) {
      return {
        name: setting.name || siteConfig.name,
        tagline: setting.tagline || siteConfig.tagline,
        logoText: setting.logoText || siteConfig.logoText,
        logoUrl: setting.logoUrl || siteConfig.logoUrl,
        logoSubtitle: setting.logoSubtitle !== null && setting.logoSubtitle !== undefined ? setting.logoSubtitle : "Imóveis Exclusivos",
        phone: setting.phone || siteConfig.contact.phone,
        whatsapp: setting.whatsapp || siteConfig.contact.whatsapp,
        whatsappFormatted: setting.phone || siteConfig.contact.whatsappFormatted,
        email: setting.email || siteConfig.contact.email,
        creciJ: setting.creciJ || siteConfig.contact.creciJ,
        address: {
          street: setting.street || siteConfig.contact.address.street,
          neighborhood: setting.neighborhood || siteConfig.contact.address.neighborhood,
          city: setting.city || siteConfig.contact.address.city,
          state: setting.state || siteConfig.contact.address.state,
          zipCode: setting.zipCode || siteConfig.contact.address.zipCode,
        },
        instagram: setting.instagram || siteConfig.social.instagram,

        // Conteúdo Editorial & Textos da Home
        heroBadge: setting.heroBadge || "Curadoria Imobiliária Exclusiva",
        heroTitle: setting.heroTitle || "Encontre o imóvel que combina com a sua próxima história.",
        heroSubtitle: setting.heroSubtitle || "Residências singulares, coberturas e refúgios contemporâneos selecionados com rigor arquitetônico e discrição inegociável.",
        heroBgImage: setting.heroBgImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85",

        philosophyBadge: setting.philosophyBadge || "Nossa Filosofia",
        philosophyTitle: setting.philosophyTitle || "A arquitetura como expressão máxima do bem-viver.",
        philosophyText: setting.philosophyText || "Não comercializamos apenas metros quadrados. Representamos residências que inspiram, acolhem e valorizam o patrimônio das famílias mais exigentes com curadoria cirúrgica.",

        featuredTitle: setting.featuredTitle || "Imóveis Selecionados",
        featuredSubtitle: setting.featuredSubtitle || "Coleção de residências notáveis que transcendem o convencional pela localização privilegiada e excelência construtiva.",

        // Página Sobre
        aboutTitle: setting.aboutTitle || "A Arte de Viver com Distinção",
        aboutSubtitle: setting.aboutSubtitle || "Fundada sob a premissa de que uma residência transcende paredes e metragem: ela é o cenário onde vidas extraordinárias se desenrolam.",
        aboutHistoryTitle: setting.aboutHistoryTitle || "Curadoria Imobiliária Inspirada na Alta Arquitetura",
        aboutHistoryText1: setting.aboutHistoryText1 || "Nascemos para atender um público que valoriza design atemporal, materiais nobres e privacidade inegociável. Nossa equipe não atua com volume indiscriminado de imóveis, mas com uma seleção criteriosa de casas com assinaturas prestigiadas, coberturas singulares e propriedades rurais com vocação para o lazer refinado.",
        aboutHistoryText2: setting.aboutHistoryText2 || "Cada empreendimento inserido em nosso acervo passa por rigorosa auditoria jurídica e técnica, garantindo segurança patrimonial absoluta tanto para quem adquire quanto para quem aliena.",
        aboutImage: setting.aboutImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      };
    }
  } catch (e) {
    console.error("Erro ao carregar configurações do banco:", e);
  }

  return {
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    logoText: siteConfig.logoText,
    logoUrl: siteConfig.logoUrl,
    logoSubtitle: "Imóveis Exclusivos",
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    whatsappFormatted: siteConfig.contact.whatsappFormatted,
    email: siteConfig.contact.email,
    creciJ: siteConfig.contact.creciJ,
    address: siteConfig.contact.address,
    instagram: siteConfig.social.instagram,

    // Padrões
    heroBadge: "Curadoria Imobiliária Exclusiva",
    heroTitle: "Encontre o imóvel que combina com a sua próxima história.",
    heroSubtitle: "Residências singulares, coberturas e refúgios contemporâneos selecionados com rigor arquitetônico e discrição inegociável.",
    heroBgImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85",

    philosophyBadge: "Nossa Filosofia",
    philosophyTitle: "A arquitetura como expressão máxima do bem-viver.",
    philosophyText: "Não comercializamos apenas metros quadrados. Representamos residências que inspiram, acolhem e valorizam o patrimônio das famílias mais exigentes com curadoria cirúrgica.",

    featuredTitle: "Imóveis Selecionados",
    featuredSubtitle: "Coleção de residências notáveis que transcendem o convencional pela localização privilegiada e excelência construtiva.",

    aboutTitle: "A Arte de Viver com Distinção",
    aboutSubtitle: "Fundada sob a premissa de que uma residência transcende paredes e metragem: ela é o cenário onde vidas extraordinárias se desenrolam.",
    aboutHistoryTitle: "Curadoria Imobiliária Inspirada na Alta Arquitetura",
    aboutHistoryText1: "Nascemos para atender um público que valoriza design atemporal, materiais nobres e privacidade inegociável. Nossa equipe não atua com volume indiscriminado de imóveis, mas com uma seleção criteriosa de casas com assinaturas prestigiadas, coberturas singulares e propriedades rurais com vocação para o lazer refinado.",
    aboutHistoryText2: "Cada empreendimento inserido em nosso acervo passa por rigorosa auditoria jurídica e técnica, garantindo segurança patrimonial absoluta tanto para quem adquire quanto para quem aliena.",
    aboutImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  };
}
