import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's details. Requires SUPERADMIN role.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (session?.role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { email, password, nama_lengkap, asal_cabang, role } = body;

    // Validate email uniqueness if email is changed
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id }
        }
      });
      if (existingUser) {
        return NextResponse.json({ success: false, message: "Email sudah terdaftar" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (nama_lengkap) updateData.nama_lengkap = nama_lengkap;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (asal_cabang) updateData.asal_cabang = asal_cabang;

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nama_lengkap: updatedUser.nama_lengkap,
        role: updatedUser.role,
        asal_cabang: updatedUser.asal_cabang,
      }
    });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes a user. Requires SUPERADMIN role.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (session?.role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server." }, { status: 500 });
  }
}
