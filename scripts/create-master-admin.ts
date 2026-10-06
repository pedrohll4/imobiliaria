import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@imobiliaria.com";
  const rawPassword = "admin123456";
  const name = "Administrador Master";

  console.log(`Configurando conta de Administrador Master (${email})...`);

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { brokerProfile: true },
  });

  if (existingUser) {
    // Se tiver perfil de corretor atrelado, removemos para NÃO aparecer como corretor
    if (existingUser.brokerProfile) {
      console.log("Removendo perfil de corretor associado para manter apenas como Administrador Master...");
      await prisma.broker.delete({
        where: { id: existingUser.brokerProfile.id },
      });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        name,
        passwordHash,
        role: "ADMIN",
        active: true,
      },
    });

    console.log("✅ Usuário Master atualizado com sucesso:", {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      active: updated.active,
    });
  } else {
    // Criar do zero
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
        active: true,
      },
    });

    console.log("✅ Usuário Master criado com sucesso:", {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      active: created.active,
    });
  }

  // Verificar se existe perfil de corretor com este email solto e remover se houver
  const strayBroker = await prisma.broker.findFirst({
    where: { email },
  });
  if (strayBroker) {
    console.log("Removendo registro avulso de corretor...");
    await prisma.broker.delete({ where: { id: strayBroker.id } });
  }

  // Conferir lista de corretores
  const totalBrokers = await prisma.broker.count();
  console.log(`Total de corretores no sistema: ${totalBrokers} (o Admin Master NÃO é corretor).`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar conta:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
