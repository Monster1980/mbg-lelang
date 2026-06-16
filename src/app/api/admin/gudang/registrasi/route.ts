import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      uniqueCode,
      startDate,
      customerName,
      customerPhone,
      itemName,
      description,
      loanAmount,
    } = body;

    // 1. Strict Duplicate Validation Engine
    const existingContract = await prisma.pawnContract.findUnique({
      where: {
        uniqueCode,
      },
    });

    if (existingContract) {
      return NextResponse.json(
        { message: "Kode Unik ini sudah terdaftar di sistem! Gunakan kode selanjutnya." },
        { status: 400 }
      );
    }

    // 2. Unified Database Insertion (Parent-Child Transaction)
    // Map data to the schema. 
    // Phone goes to notes.
    const formattedNotes = customerPhone ? `Phone: ${customerPhone}` : null;
    
    // Default values for required PhysicalItem fields
    const category = "Pawn";
    const branchName = "Pusat"; // Provide a default or derive if needed
    const currentRack = "Receiving";

    const result = await prisma.$transaction(async (tx) => {
      // Create PhysicalItem
      const physicalItem = await tx.physicalItem.create({
        data: {
          itemName,
          category,
          branchName,
          currentRack,
          description,
        },
      });

      // Create PawnContract
      const pawnContract = await tx.pawnContract.create({
        data: {
          uniqueCode,
          customerName,
          appraisalValue: parseFloat(loanAmount),
          physicalItemId: physicalItem.id,
          notes: formattedNotes,
          startDate: startDate ? new Date(startDate) : new Date(),
          status: "AKTIF",
        },
      });

      return { physicalItem, pawnContract };
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during item registration:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
