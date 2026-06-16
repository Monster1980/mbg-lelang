export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-slate-100"></div>
            <div>
              <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
              <div className="h-6 w-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      {/* Chart Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
        <div className="h-80 w-full bg-slate-50 rounded"></div>
      </div>
    </div>
  );
}

async function DashboardData() {
  const today = new Date();
  
  // Start date: 1st of current month
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0);

  // End date: end of today
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  // Parallelize queries to eliminate sequential blocking and reduce TTFB latency
  const [totalActive, sales] = await Promise.all([
    prisma.auctionItem.count({
      where: { status: "Tersedia" }
    }),
    prisma.salesTransaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate
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
    })
  ]);

  const totalSold = sales.length;
  const totalRevenue = sales.reduce((sum, tx) => sum + Number(tx.soldPrice), 0);

  // Daily trend
  const dailyMap: { [key: string]: { date: string; formattedDate: string; revenue: number; count: number } } = {};
  const tempDate = new Date(startDate);
  while (tempDate <= endDate) {
    const key = tempDate.toISOString().split("T")[0];
    const formattedDate = tempDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    dailyMap[key] = { date: key, formattedDate, revenue: 0, count: 0 };
    tempDate.setDate(tempDate.getDate() + 1);
  }

  sales.forEach(tx => {
    const key = new Date(tx.transactionDate).toISOString().split("T")[0];
    if (dailyMap[key]) {
      dailyMap[key].revenue += Number(tx.soldPrice);
      dailyMap[key].count += 1;
    }
  });
  const dailySalesData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Category Pie Chart
  const categoriesMap: { [key: string]: number } = {};
  sales.forEach(tx => {
    const cat = tx.item?.category || "Lainnya";
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoriesMap).map(name => ({
    name,
    total: categoriesMap[name]
  }));

  // Cashier Bar Chart
  const cashierMap: { [key: string]: number } = {};
  sales.forEach(tx => {
    const cashier = tx.cashierName || "Kasir Utama";
    cashierMap[cashier] = (cashierMap[cashier] || 0) + Number(tx.soldPrice);
  });
  const cashierData = Object.keys(cashierMap).map(name => ({
    name,
    revenue: cashierMap[name]
  }));

  // Recent transactions
  const recentTransactions = sales.slice(0, 15).map(tx => ({
    id: tx.id,
    sku: tx.sku,
    itemTitle: tx.item?.title || "Item Terhapus",
    transactionDate: tx.transactionDate.toISOString(),
    cashierName: tx.cashierName,
    branchName: tx.branchName,
    soldPrice: Number(tx.soldPrice)
  }));

  const initialData = {
    totalActive,
    totalSold,
    totalRevenue,
    dailySalesData,
    categoryData,
    cashierData,
    recentTransactions
  };

  return (
    <AdminDashboardClient 
      initialData={initialData}
      initialStartDate={startDate.toISOString()}
      initialEndDate={endDate.toISOString()}
    />
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Analytics</h1>
        <p className="text-slate-500 mt-1">Ringkasan performa katalog dan penjualan.</p>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
