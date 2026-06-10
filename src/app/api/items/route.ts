import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to generate Branch Code
const getBranchCode = (branchName: string) => {
  const name = branchName.toUpperCase();
  if (name.includes("JAKARTA")) return "JKT";
  if (name.includes("BANDUNG")) return "BDG";
  if (name.includes("SURABAYA")) return "SBY";
  if (name.includes("SEMARANG")) return "SMG";
  if (name.includes("MEDAN")) return "MDN";
  
  // fallback: first 3 letters of the last word, or just first 3 letters
  const words = branchName.split(" ");
  const lastWord = words[words.length - 1];
  if (lastWord.length >= 3) return lastWord.substring(0, 3).toUpperCase();
  return branchName.substring(0, 3).toUpperCase();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate SKU logic
    const branchCode = getBranchCode(body.branchName);
    const skuPrefix = `MBG-${branchCode}-`;
    
    // Find last item for this branch to get the latest counter
    const lastItem = await prisma.auctionItem.findFirst({
      where: { sku: { startsWith: skuPrefix } },
      orderBy: { sku: 'desc' },
    });

    let counter = 1;
    if (lastItem) {
      const parts = lastItem.sku.split('-');
      if (parts.length === 3) {
        const lastCounter = parseInt(parts[2], 10);
        if (!isNaN(lastCounter)) {
          counter = lastCounter + 1;
        }
      }
    }

    const sku = `${skuPrefix}${String(counter).padStart(3, '0')}`;

    // Create item
    const newItem = await prisma.auctionItem.create({
      data: {
        sku,
        branchName: body.branchName,
        title: body.title,
        category: body.category,
        description: body.description,
        defects: body.defects || null,
        grade: body.grade,
        price: body.price,
        status: "Tersedia",
        images: body.images || [],
        whatsappNumber: body.whatsappNumber,
      }
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    console.error("Failed to create item:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
