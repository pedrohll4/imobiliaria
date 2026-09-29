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
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    whatsappFormatted: siteConfig.contact.whatsappFormatted,
    email: siteConfig.contact.email,
    creciJ: siteConfig.contact.creciJ,
    address: siteConfig.contact.address,
    instagram: siteConfig.social.instagram,
  };
}
