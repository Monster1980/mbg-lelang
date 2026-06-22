import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { checkAndTransitionExpiredContracts } from "@/lib/gudang";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mbg_session")?.value;
  const session = await decrypt(sessionCookie);
  
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Auto-transition expired active contracts to PROSES_LELANG
  await checkAndTransitionExpiredContracts();

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");

  if (!sku) {
    return NextResponse.json({ success: false, message: "SKU parameter is required" }, { status: 400 });
  }

  try {
    // Search PawnContract by uniqueCode
    const contract = await prisma.pawnContract.findUnique({
      where: { uniqueCode: sku },
      include: { physicalItem: true }
    });

    if (contract) {
      return NextResponse.json({ success: true, data: contract });
    }

    // If not found in current contracts, check if it's a legacy or previous SKU
    const historicalContract = await prisma.pawnContract.findFirst({
      where: { previousSku: sku },
      include: { physicalItem: true }
    });

    if (historicalContract) {
      return NextResponse.json({ 
        success: true, 
        message: "Found as historical/previous SKU.",
        data: historicalContract 
      });
    }

    return NextResponse.json({ success: false, message: "SKU tidak ditemukan di database gudang." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
