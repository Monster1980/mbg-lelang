import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * GET /api/admin/users/me
 * Returns the current authenticated user's role from the session JWT.
 * Used by client components for RBAC visibility decisions.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        email: session.email,
        nama_lengkap: session.nama_lengkap,
        asal_cabang: session.asal_cabang,
        role: session.role,
      },
    });
  } catch (error: any) {
    console.error("Failed to get current user:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
