import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, sku, soldPrice, branchName, cashierName } = body;

    if (!itemId || !sku || !soldPrice || !branchName || !cashierName) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    // Execute Database Transaction to ensure atomicity
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Double check item status
      const item = await tx.auctionItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Barang tidak ditemukan.");
      if (item.status === "Terjual") throw new Error("Barang sudah terjual sebelumnya.");

      // 2. Update item status to 'Terjual'
      const updatedItem = await tx.auctionItem.update({
        where: { id: itemId },
        data: { status: "Terjual" },
      });

      // 3. Create Sales Transaction audit record
      const salesTx = await tx.salesTransaction.create({
        data: {
          itemId,
          sku,
          soldPrice,
          branchName,
          cashierName,
        },
      });

      return { updatedItem, salesTx };
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
