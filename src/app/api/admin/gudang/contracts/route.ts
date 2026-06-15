import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PawnStatus } from "@prisma/client";

// POST — Add a new PawnContract to an existing PhysicalItem (renewal/extension)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { physicalItemId, uniqueCode, customerName, appraisalValue, notes } = body;

    if (!physicalItemId || !uniqueCode || !customerName || appraisalValue == null) {
      return NextResponse.json(
        { success: false, message: "Field wajib: physicalItemId, uniqueCode, customerName, appraisalValue." },
        { status: 400 }
      );
    }

    // Verify physical item exists
    const physicalItem = await prisma.physicalItem.findUnique({ where: { id: physicalItemId } });
    if (!physicalItem) {
      return NextResponse.json(
        { success: false, message: "Barang fisik tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check for duplicate unique code
    const existing = await prisma.pawnContract.findUnique({ where: { uniqueCode } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kode unik "${uniqueCode}" sudah terdaftar di sistem!` },
        { status: 409 }
      );
    }

    // Close the previous active/extended contract
    await prisma.pawnContract.updateMany({
      where: {
        physicalItemId,
        status: { in: [PawnStatus.AKTIF, PawnStatus.DIPERPANJANG] },
      },
      data: {
        status: PawnStatus.DIPERPANJANG,
        endDate: new Date(),
      },
    });

    const contract = await prisma.pawnContract.create({
      data: {
        uniqueCode,
        customerName,
        appraisalValue: parseFloat(appraisalValue),
        physicalItemId,
        notes: notes || null,
        status: PawnStatus.AKTIF,
      },
    });

    const serialized = JSON.parse(JSON.stringify(contract));
    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("Failed to create pawn contract:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH — Update contract status (critical LELANG pipeline)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { contractId, status: newStatus, whatsappNumber, priceForSale } = body;

    if (!contractId || !newStatus) {
      return NextResponse.json(
        { success: false, message: "Field wajib: contractId, status." },
        { status: 400 }
      );
    }

    // Validate status enum
    if (!Object.values(PawnStatus).includes(newStatus)) {
      return NextResponse.json(
        { success: false, message: `Status tidak valid. Pilih: ${Object.values(PawnStatus).join(", ")}` },
        { status: 400 }
      );
    }

    const contract = await prisma.pawnContract.findUnique({
      where: { id: contractId },
      include: { physicalItem: true },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Kontrak gadai tidak ditemukan." },
        { status: 404 }
      );
    }

    // Update the contract status
    const updatedContract = await prisma.pawnContract.update({
      where: { id: contractId },
      data: {
        status: newStatus as PawnStatus,
        endDate: newStatus === PawnStatus.LUNAS || newStatus === PawnStatus.LELANG ? new Date() : undefined,
      },
    });

    const physicalItem = contract.physicalItem;

    // ═══════════════════════════════════════════════════════════════════
    // CRITICAL PIPELINE: LELANG → Auto-create AuctionItem for marketplace
    // ═══════════════════════════════════════════════════════════════════
    if (newStatus === PawnStatus.LELANG) {
      // Check if a marketplace listing already exists for this physical item
      const existingListing = await prisma.auctionItem.findFirst({
        where: { physicalItemId: physicalItem.id },
      });

      if (!existingListing) {
        // Generate SKU from timestamp
        const skuBase = Date.now().toString().slice(-8);

        await prisma.auctionItem.create({
          data: {
            sku: skuBase,
            branchName: physicalItem.branchName,
            title: physicalItem.itemName,
            category: physicalItem.category,
            description: physicalItem.description || "Barang lelang gadai — silakan hubungi admin untuk detail.",
            kondisi: "Bekas",
            price: priceForSale ? parseFloat(priceForSale) : Number(contract.appraisalValue),
            status: "Tersedia",
            images: physicalItem.images,
            whatsappNumber: whatsappNumber || "08123456789",
            physicalItemId: physicalItem.id,
          },
        });
      } else {
        // Reactivate existing listing
        await prisma.auctionItem.update({
          where: { id: existingListing.id },
          data: { status: "Tersedia" },
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // REVERSE PIPELINE: Non-LELANG → Hide from marketplace
    // ═══════════════════════════════════════════════════════════════════
    if (newStatus === PawnStatus.AKTIF || newStatus === PawnStatus.DIPERPANJANG || newStatus === PawnStatus.LUNAS) {
      // If there's an active marketplace listing for this item, disable it
      await prisma.auctionItem.updateMany({
        where: {
          physicalItemId: physicalItem.id,
          status: "Tersedia",
        },
        data: {
          status: "Terjual",
        },
      });
    }

    const serialized = JSON.parse(JSON.stringify(updatedContract));
    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("Failed to update contract status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
