import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando limpeza e preparação do ambiente para produção real...");

  // 1. Apagar dados fictícios do banco
  console.log("Removendo leads de teste...");
  await prisma.lead.deleteMany();

  console.log("Removendo diferenciais de teste...");
  await prisma.propertyFeature.deleteMany();

  console.log("Removendo fotos de teste...");
  await prisma.propertyImage.deleteMany();

  console.log("Removendo imóveis fictícios...");
  await prisma.property.deleteMany();

  console.log("Removendo corretores fictícios (Helena, Rodrigo, Camila)...");
  await prisma.broker.deleteMany();

  console.log("Removendo usuários de teste...");
  await prisma.user.deleteMany();

  // 2. Criar a conta oficial do Administrador
  const adminPassword = await bcrypt.hash("admin123456", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@imobiliaria.com",
      passwordHash: adminPassword,
      name: "Administrador Geral",
      role: "ADMIN",
      active: true,
    },
  });

  // Criar perfil de corretor para o admin poder navegar por tudo
  await prisma.broker.create({
    data: {
      userId: adminUser.id,
      name: "Administrador Geral",
      email: "admin@imobiliaria.com",
      phone: "(11) 3045-8000",
      whatsapp: "5511999998888",
      creci: "Diretoria",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      bio: "Diretoria e governança imobiliária.",
    },
  });

  console.log("Conta de Administrador criada com sucesso:");
  console.log("  E-mail: admin@imobiliaria.com");
  console.log("  Senha:  admin123456");

  // 3. Inicializar configurações editáveis do site
  const existingSetting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (!existingSetting) {
    await prisma.siteSetting.create({
      data: {
        id: "default",
        name: "Sua Imobiliária",
        tagline: "Residências e Empreendimentos de Alto Padrão",
        logoText: "IMV",
        logoUrl: null,
        phone: "(11) 3045-8000",
        whatsapp: "5511999998888",
        email: "contato@imobiliaria.com",
        creciJ: "CRECI 00.000-J",
        street: "Avenida Principal, 1000",
        neighborhood: "Jardins",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000",
        instagram: "https://instagram.com",
      },
    });
    console.log("Configurações padrão inicializadas no banco de dados.");
  }

  console.log("Banco de dados do Supabase 100% limpo e pronto para o cliente!");
}

main()
  .catch((e) => {
    console.error("Erro na limpeza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
