"use server";

import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface BrokerActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createBrokerAction(
  prevState: BrokerActionResult | null,
  formData: FormData
): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem cadastrar corretores." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string)?.trim();
  const whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
  const creci = (formData.get("creci") as string)?.trim();
  const photoUrl = (formData.get("photoUrl") as string)?.trim() || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
  const bio = (formData.get("bio") as string)?.trim() || "Consultor imobiliário de alto padrão.";

  if (!name || !email || !password || !phone || !creci) {
    return { success: false, error: "Preencha todos os campos obrigatórios." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { success: false, error: "Já existe um usuário cadastrado com este e-mail." };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "BROKER",
        active: true,
      },
    });

    await prisma.broker.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        whatsapp: whatsapp.startsWith("55") ? whatsapp : `55${whatsapp}`,
        creci,
        photoUrl,
        bio,
      },
    });

    revalidatePath("/admin/corretores");
    revalidatePath("/corretores");

    return { success: true, message: "Corretor cadastrado com sucesso!" };
  } catch (err) {
    console.error("Erro ao criar corretor:", err);
    return { success: false, error: "Erro ao cadastrar corretor." };
  }
}

export async function toggleBrokerStatusAction(brokerId: string): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Não autorizado." };
  }

  try {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker) {
      return { success: false, error: "Corretor não encontrado." };
    }

    const newStatus = !broker.active;

    await prisma.broker.update({
      where: { id: brokerId },
      data: { active: newStatus },
    });

    await prisma.user.update({
      where: { id: broker.userId },
      data: { active: newStatus },
    });

    revalidatePath("/admin/corretores");
    revalidatePath("/corretores");

    return { success: true, message: `Corretor ${newStatus ? "ativado" : "desativado"} com sucesso.` };
  } catch (err) {
    console.error("Erro ao alterar status:", err);
    return { success: false, error: "Erro ao atualizar status do corretor." };
  }
}

export async function updateMyProfileAction(
  prevState: BrokerActionResult | null,
  formData: FormData
): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Você precisa estar conectado para editar o perfil." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  let whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
  const creci = (formData.get("creci") as string)?.trim();
  const photoUrl = (formData.get("photoUrl") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();

  if (!name || !email) {
    return { success: false, error: "Nome e e-mail são obrigatórios." };
  }

  if (whatsapp && !whatsapp.startsWith("55")) {
    whatsapp = `55${whatsapp}`;
  }

  try {
    // Verificar se e-mail já pertence a outro usuário
    const existing = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.userId },
      },
    });

    if (existing) {
      return { success: false, error: "Este e-mail já está sendo utilizado por outro usuário." };
    }

    let passwordHash: string | undefined = undefined;
    if (newPassword) {
      if (newPassword.length < 6) {
        return { success: false, error: "A nova senha deve possuir pelo menos 6 caracteres." };
      }
      passwordHash = await hashPassword(newPassword);
    }

    // Atualizar Usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        email,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    // Atualizar ou Criar perfil de Corretor
    let broker = await prisma.broker.findUnique({
      where: { userId: session.userId },
    });

    let brokerId = session.brokerId;

    if (broker) {
      const updatedBroker = await prisma.broker.update({
        where: { id: broker.id },
        data: {
          name,
          email,
          phone: phone || broker.phone,
          whatsapp: whatsapp || broker.whatsapp,
          creci: creci || broker.creci,
          photoUrl: photoUrl || broker.photoUrl,
          bio: bio || broker.bio,
        },
      });
      brokerId = updatedBroker.id;
    } else {
      const createdBroker = await prisma.broker.create({
        data: {
          userId: session.userId,
          name,
          email,
          phone: phone || "(11) 3045-8000",
          whatsapp: whatsapp || "5511987654321",
          creci: creci || "Diretoria",
          photoUrl: photoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
          bio: bio || "Membro da equipe executiva.",
        },
      });
      brokerId = createdBroker.id;
    }

    // Atualizar o cookie de sessão com os novos dados
    await setSessionCookie({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as "ADMIN" | "BROKER",
      brokerId,
    });

    revalidatePath("/dashboard/perfil");
    revalidatePath("/dashboard");
    revalidatePath("/corretores");
    revalidatePath("/admin/corretores");
    revalidatePath("/imoveis");

    return {
      success: true,
      message: "Seu perfil foi atualizado com sucesso! As alterações já estão salvas no banco de dados.",
    };
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return { success: false, error: "Ocorreu um erro ao atualizar suas informações. Tente novamente." };
  }
}

export async function updateBrokerByAdminAction(
  prevState: BrokerActionResult | null,
  formData: FormData
): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem editar corretores." };
  }

  const brokerId = formData.get("brokerId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  let whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
  const creci = (formData.get("creci") as string)?.trim();
  const photoUrl = (formData.get("photoUrl") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();

  if (!brokerId || !name || !email) {
    return { success: false, error: "Nome e e-mail são obrigatórios." };
  }

  if (whatsapp && !whatsapp.startsWith("55")) {
    whatsapp = `55${whatsapp}`;
  }

  try {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker) {
      return { success: false, error: "Corretor não encontrado." };
    }

    if (email !== broker.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return { success: false, error: "Este e-mail já pertence a outro usuário." };
      }
    }

    let passwordHash: string | undefined = undefined;
    if (newPassword && newPassword.length >= 6) {
      passwordHash = await hashPassword(newPassword);
    }

    await prisma.user.update({
      where: { id: broker.userId },
      data: {
        name,
        email,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await prisma.broker.update({
      where: { id: brokerId },
      data: {
        name,
        email,
        phone: phone || broker.phone,
        whatsapp: whatsapp || broker.whatsapp,
        creci: creci || broker.creci,
        photoUrl: photoUrl || broker.photoUrl,
        bio: bio || broker.bio,
      },
    });

    revalidatePath("/admin/corretores");
    revalidatePath("/corretores");
    revalidatePath(`/corretores/${brokerId}`);
    revalidatePath("/imoveis");
    revalidatePath("/dashboard/perfil");

    return { success: true, message: "Dados e foto do corretor atualizados com sucesso!" };
  } catch (err: any) {
    console.error("Erro ao atualizar corretor:", err);
    return { success: false, error: err?.message || "Erro ao atualizar corretor." };
  }
}

export async function deleteBrokerAction(brokerId: string): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem excluir corretores." };
  }

  try {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker) {
      return { success: false, error: "Corretor não encontrado." };
    }

    // Desvincular imóveis e leads para segurança dos dados
    await prisma.property.updateMany({
      where: { brokerId },
      data: { brokerId: null },
    });

    await prisma.lead.updateMany({
      where: { brokerId },
      data: { brokerId: null },
    });

    await prisma.broker.delete({
      where: { id: brokerId },
    });

    await prisma.user.delete({
      where: { id: broker.userId },
    });

    revalidatePath("/admin/corretores");
    revalidatePath("/corretores");
    revalidatePath("/imoveis");

    return { success: true, message: "Corretor removido com sucesso." };
  } catch (err: any) {
    console.error("Erro ao excluir corretor:", err);
    return { success: false, error: err?.message || "Erro ao excluir corretor." };
  }
}

export async function updateBrokerAvatarInstantAction(
  photoUrl: string,
  targetBrokerId?: string
): Promise<BrokerActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autorizado." };
  }

  try {
    if (
      !photoUrl ||
      typeof photoUrl !== "string" ||
      (!photoUrl.startsWith("http://") &&
        !photoUrl.startsWith("https://") &&
        !photoUrl.startsWith("/"))
    ) {
      return { success: false, error: "URL de fotografia inválida." };
    }

    let brokerIdToUpdate = targetBrokerId;

    if (targetBrokerId) {
      // Se um ID específico foi informado, apenas ADMIN ou o próprio corretor pode alterar
      const isSelf = session.brokerId === targetBrokerId;
      const isAdmin = session.role === "ADMIN";
      if (!isSelf && !isAdmin) {
        return {
          success: false,
          error: "Você não tem autorização para alterar o perfil de outro consultor.",
        };
      }
    }

    if (!brokerIdToUpdate) {
      const broker = await prisma.broker.findUnique({
        where: { userId: session.userId },
      });
      if (broker) {
        brokerIdToUpdate = broker.id;
      } else {
        const created = await prisma.broker.create({
          data: {
            userId: session.userId,
            name: session.name,
            email: session.email,
            phone: "(11) 3045-8000",
            whatsapp: "5511987654321",
            creci: "Diretoria",
            photoUrl,
            bio: "Membro da equipe executiva.",
          },
        });
        brokerIdToUpdate = created.id;
      }
    }

    if (brokerIdToUpdate) {
      await prisma.broker.update({
        where: { id: brokerIdToUpdate },
        data: { photoUrl },
      });
    }

    revalidatePath("/dashboard/perfil");
    revalidatePath("/corretores");
    revalidatePath("/admin/corretores");
    revalidatePath("/imoveis");

    return { success: true, message: "Foto de perfil salva com sucesso no banco de dados!" };
  } catch (err: any) {
    console.error("Erro ao atualizar avatar instantaneamente:", err);
    return { success: false, error: err?.message || "Erro ao salvar foto no banco." };
  }
}

/**
 * Permite ao Administrador acessar o painel de qualquer corretor (Impersonação)
 */
export async function impersonateBrokerAction(brokerId: string) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && !session.impersonatedBy)) {
    throw new Error("Apenas administradores podem acessar o painel de corretores.");
  }

  const originalAdminId = session.impersonatedBy || session.userId;

  const broker = await prisma.broker.findUnique({
    where: { id: brokerId },
    include: { user: true },
  });

  if (!broker || !broker.user) {
    throw new Error("Corretor ou usuário correspondente não encontrado.");
  }

  const isSelf = broker.user.id === originalAdminId;

  await setSessionCookie({
    userId: broker.user.id,
    email: broker.user.email,
    name: broker.name,
    role: isSelf ? "ADMIN" : "BROKER",
    brokerId: broker.id,
    impersonatedBy: isSelf ? undefined : originalAdminId,
  });

  redirect("/dashboard");
}

/**
 * Encerra a impersonação e retorna a sessão para o Administrador original
 */
export async function stopImpersonationAction() {
  redirect("/api/auth/exit-impersonation");
}
