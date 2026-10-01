import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || !session.impersonatedBy) {
    if (session?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.impersonatedBy },
    include: { brokerProfile: true },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await setSessionCookie({
    userId: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: "ADMIN",
    brokerId: adminUser.brokerProfile?.id,
  });

  return NextResponse.redirect(new URL("/admin/corretores", request.url));
}
