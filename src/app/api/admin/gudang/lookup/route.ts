import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Lookup any historical unique code and return full lineage
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Parameter 'code' wajib diisi." },
        { status: 400 }
      );
    }

    // Find the contract by unique code
    const contract = await prisma.pawnContract.findUnique({
      where: { uniqueCode: code.trim() },
      include: {
        physicalItem: {
          include: {
            contracts: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, message: `Kode "${code}" tidak ditemukan di sistem.` },
        { status: 404 }
      );
    }

    // Return the full physical item with all its contracts (timeline)
    const serialized = JSON.parse(JSON.stringify(contract.physicalItem));
    return NextResponse.json({
      success: true,
      data: serialized,
      matchedCode: code.trim(),
    });
  } catch (error: any) {
    console.error("Failed to lookup code:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
