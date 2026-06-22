import { Status } from '@prisma/client';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { success: false, message: "startDate dan endDate wajib disertakan." },
        { status: 400 }
      );
    }

    const start = new Date(startDateParam);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDateParam);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid." },
        { status: 400 }
      );
    }

    // 1. Fetch current active stock items (Tersedia)
    const totalActive = await prisma.auctionItem.count({
      where: { status: Status.Tersedia }
    });

    // 2. Fetch sales transactions in date range
    const sales = await prisma.salesTransaction.findMany({
      where: {
        transactionDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        item: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        transactionDate: "desc"
      }
    });

    // 3. Summarize metrics
    const totalSold = sales.length;
    const totalRevenue = sales.reduce((sum, tx) => sum + Number(tx.soldPrice), 0);

    // 4. Generate daily trend data (smooth, no missing dates)
    const dailyMap: { [key: string]: { date: string; formattedDate: string; revenue: number; count: number } } = {};
    const tempDate = new Date(start);
    // Limit loop to max 5 years to prevent memory leaks if date range is extremely large
    let safetyCounter = 0;
    while (tempDate <= end && safetyCounter < 2000) {
      const key = tempDate.toISOString().split("T")[0];
      const formattedDate = tempDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dailyMap[key] = { date: key, formattedDate, revenue: 0, count: 0 };
      tempDate.setDate(tempDate.getDate() + 1);
      safetyCounter++;
    }

    sales.forEach(tx => {
      const key = new Date(tx.transactionDate).toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += Number(tx.soldPrice);
        dailyMap[key].count += 1;
      }
    });
    const dailySalesData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Generate Category Pie Chart data (sales distribution)
    const categoriesMap: { [key: string]: number } = {};
    sales.forEach(tx => {
      const cat = tx.item?.category || "Lainnya";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });
    const categoryData = Object.keys(categoriesMap).map(name => ({
      name,
      total: categoriesMap[name]
    }));

    // 6. Generate Cashier Bar Chart data (revenue performance)
    const cashierMap: { [key: string]: number } = {};
    sales.forEach(tx => {
      const cashier = tx.cashierName || "Kasir Utama";
      cashierMap[cashier] = (cashierMap[cashier] || 0) + Number(tx.soldPrice);
    });
    const cashierData = Object.keys(cashierMap).map(name => ({
      name,
      revenue: cashierMap[name]
    }));

    // 7. Format recent transactions
    const recentTransactions = sales.slice(0, 15).map(tx => ({
      id: tx.id,
      sku: tx.sku,
      itemTitle: tx.item?.title || "Item Terhapus",
      transactionDate: tx.transactionDate,
      cashierName: tx.cashierName,
      branchName: tx.branchName,
      soldPrice: Number(tx.soldPrice)
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalActive,
        totalSold,
        totalRevenue,
        dailySalesData,
        categoryData,
        cashierData,
        recentTransactions
      }
    });

  } catch (error: any) {
    console.error("Dashboard analytics API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
