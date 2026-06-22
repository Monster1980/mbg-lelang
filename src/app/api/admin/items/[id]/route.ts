import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/admin/items/[id]
 * Updates an item's fields. 
 * - Visibility toggle (isMarketplaceVisible): allowed for any authenticated admin.
 * - Field edits (title, price, status): requires SUPERADMIN role.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, message: "ID item tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Determine if this is a visibility-only toggle or a field edit
    const isVisibilityToggleOnly =
      Object.keys(body).length === 1 && "isMarketplaceVisible" in body;

    // Field edits require SUPERADMIN
    if (!isVisibilityToggleOnly && session.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Superadmin yang dapat mengedit barang." },
        { status: 403 }
      );
    }

    // Build the update data object safely
    const updateData: any = {};

    if ("title" in body && typeof body.title === "string" && body.title.trim()) {
      updateData.title = body.title.trim();
    }
    if ("price" in body && !isNaN(Number(body.price))) {
      updateData.price = Number(body.price);
    }
    if ("status" in body && ["Tersedia", "Dipesan", "Terjual"].includes(body.status)) {
      updateData.status = body.status;
    }
    if ("isMarketplaceVisible" in body && typeof body.isMarketplaceVisible === "boolean") {
      updateData.isMarketplaceVisible = body.isMarketplaceVisible;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diperbarui." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.auctionItem.update({
      where: { id: itemId },
      data: updateData,
    });

    // Purge public catalog cache so customers see changes instantly
    revalidatePath("/");
    revalidatePath(`/katalog/${itemId}`);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(updatedItem)),
    });
  } catch (error: any) {
    console.error("Failed to update item:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Barang tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/items/[id]
 * Deletes an item. Requires SUPERADMIN role.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    if (session.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Superadmin yang dapat menghapus barang." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, message: "ID item tidak valid." },
        { status: 400 }
      );
    }

    await prisma.auctionItem.delete({
      where: { id: itemId },
    });

    // Purge public catalog cache so deleted items disappear instantly
    revalidatePath("/");
    revalidatePath(`/katalog/${itemId}`);

    return NextResponse.json({ success: true, message: "Barang berhasil dihapus." });
  } catch (error: any) {
    console.error("Failed to delete item:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Barang tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
