import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { seedUserData } from "@/lib/seed";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name, email, password } // Em produção, adicione bcrypt hash aqui
    });
    await seedUserData(user.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
