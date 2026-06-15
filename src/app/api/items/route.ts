import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required SKU
    if (!body.sku || !body.sku.trim()) {
      return NextResponse.json(
        { success: false, message: "SKU wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedSku = body.sku.trim();
    if (!/^\d+$/.test(trimmedSku)) {
      return NextResponse.json(
        { success: false, message: "SKU harus berupa angka saja." },
        { status: 400 }
      );
    }

    // Create item with manual SKU
    const newItem = await prisma.auctionItem.create({
      data: {
        sku: trimmedSku,
        branchName: body.branchName,
        title: body.title,
        category: body.category,
        description: body.description,
        defects: body.defects || null,
        kondisi: body.kondisi,
        price: body.price,
        status: "Tersedia",
        images: body.images || [],
        whatsappNumber: body.whatsappNumber,
        youtubeUrl: body.youtubeUrl || null,
      }
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    console.error("Failed to create item:", error);

    // Handle Prisma unique constraint violation on SKU
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      return NextResponse.json(
        { success: false, message: "Waduh, SKU sudah terdaftar di sistem! Silakan gunakan SKU lain." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("q");

    const where: any = {
      branchName: {
        contains: "Pasuruan",
        mode: "insensitive" as const,
      },
      status: {
        notIn: ["Terjual", "Dipesan"],
      },
    };

    if (category && category !== "Semua Kategori") {
      where.category = category;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.auctionItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.auctionItem.count({ where });

    // Serialize to prevent any Decimal parsing issues
    const serializedItems = JSON.parse(JSON.stringify(items));

    return NextResponse.json({
      success: true,
      data: serializedItems,
      hasMore: skip + items.length < total,
    });
  } catch (error: any) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
