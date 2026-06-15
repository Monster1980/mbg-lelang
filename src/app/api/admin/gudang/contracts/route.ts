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

    const serialized = JSON.parse(JSON.stringify(updatedContract));
    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("Failed to update contract status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
