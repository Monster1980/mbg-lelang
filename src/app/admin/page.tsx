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
  // Query Total Active Items
  const totalActive = await prisma.auctionItem.count({
    where: { status: "Tersedia" }
  });

  // Query Sold Today and Revenue Today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const soldTodayItems = await prisma.salesTransaction.findMany({
    where: { transactionDate: { gte: startOfDay } }
  });

  const totalSoldToday = soldTodayItems.length;
  const revenueToday = soldTodayItems.reduce((acc, item) => acc + Number(item.soldPrice), 0);

  // Group by categories for the chart
  const categoriesDb = await prisma.auctionItem.groupBy({
    by: ['category'],
    _count: true,
  });

  const categoryData = categoriesDb.map(c => ({
    name: c.category,
    total: Number(c._count)
  }));

  return (
    <AdminDashboardClient 
      totalActive={totalActive} 
      totalSoldToday={totalSoldToday}
      revenueToday={revenueToday}
      categoryData={categoryData}
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
