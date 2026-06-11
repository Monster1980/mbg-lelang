import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  // Secure password check using environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("mbg_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("mbg_session");
  return response;
}
