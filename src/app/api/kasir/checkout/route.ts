import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    // Validate: must have items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Keranjang kosong. Minimal 1 barang untuk checkout." },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemId || !item.sku || !item.soldPrice || !item.branchName || !item.cashierName) {
        return NextResponse.json(
          { success: false, message: `Data tidak lengkap untuk SKU: ${item.sku || "unknown"}` },
          { status: 400 }
        );
      }
    }

    // Execute batch transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of items) {
        // 1. Verify item exists and is available
        const dbItem = await tx.auctionItem.findUnique({ where: { id: item.itemId } });
        if (!dbItem) {
          throw new Error(`Barang dengan ID ${item.itemId} (SKU: ${item.sku}) tidak ditemukan.`);
        }
        if (dbItem.status === "Terjual") {
          throw new Error(`Barang "${dbItem.title}" (SKU: ${item.sku}) sudah terjual sebelumnya.`);
        }

        // 2. Update item status to Terjual
        const updatedItem = await tx.auctionItem.update({
          where: { id: item.itemId },
          data: { status: "Terjual" },
        });

        // 3. Create sales transaction record
        const salesTx = await tx.salesTransaction.create({
          data: {
            itemId: item.itemId,
            sku: item.sku,
            soldPrice: item.soldPrice,
            branchName: item.branchName,
            cashierName: item.cashierName,
          },
        });

        results.push({ updatedItem, salesTx });
      }

      return results;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
