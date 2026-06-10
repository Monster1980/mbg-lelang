import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
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
    total: c._count._all
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
