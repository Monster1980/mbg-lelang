import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 });
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      asal_cabang: user.asal_cabang,
      role: user.role,
    };

    const sessionToken = await encrypt(sessionData);

    const cookieStore = await cookies();
    cookieStore.set("mbg_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("mbg_session");
  return NextResponse.json({ success: true });
}
