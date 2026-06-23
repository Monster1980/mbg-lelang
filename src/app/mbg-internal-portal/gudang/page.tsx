import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PawnStatus } from "@prisma/client";
import UnifiedGudangClient from "./UnifiedGudangClient";
import { checkAndTransitionExpiredContracts } from "@/lib/gudang";

export default async function GudangUnifiedPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/mbg-internal-portal/login");
  }

  // Auto-transition expired active contracts to PROSES_LELANG
  await checkAndTransitionExpiredContracts();

  // Fetch metrics for Dashboard and Lifecycle
  const activeStatuses = [PawnStatus.AKTIF, PawnStatus.PERPANJANG, PawnStatus.PROSES_LELANG];

  const [activeContracts, soldContracts, allCounts, totalBarangFisik] = await Promise.all([
    prisma.pawnContract.findMany({
      where: { status: { in: activeStatuses } },
      select: { appraisalValue: true }
    }),
    prisma.pawnContract.findMany({
      where: { status: PawnStatus.TERJUAL },
      select: { sellingPrice: true, appraisalValue: true }
    }),
    prisma.pawnContract.groupBy({
      by: ['status'],
      _count: { status: true }
    }),
    prisma.physicalItem.count()
  ]);

  const activeLoanCapital = activeContracts.reduce((sum, c) => sum + Number(c.appraisalValue), 0);
  const netProfit = soldContracts.reduce((sum, c) => {
    const sp = c.sellingPrice ? Number(c.sellingPrice) : 0;
    const ap = Number(c.appraisalValue);
    return sum + (sp - ap);
  }, 0);

  // Default counts map
  const statusCounts = {
    AKTIF: 0,
    PERPANJANG: 0,
    PROSES_LELANG: 0,
    LELANG: 0,
    TERJUAL: 0,
    TEBUS: 0,
  };

  allCounts.forEach(c => {
    if (statusCounts.hasOwnProperty(c.status)) {
      statusCounts[c.status as keyof typeof statusCounts] = c._count.status;
    }
  });

  const lifecycleCounts = {
    totalBarangFisik,
    totalAktif: statusCounts.AKTIF,
    totalDiperpanjang: statusCounts.PERPANJANG,
    totalProsesLelang: statusCounts.PROSES_LELANG,
    totalSiapLelang: statusCounts.LELANG,
    totalLunas: statusCounts.TERJUAL + statusCounts.TEBUS
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
          Gudang & <span className="text-blue-600">Gadai</span>
        </h1>
        <p className="text-sm md:text-base text-slate-500">
          Manajemen barang fisik, kontrak gadai, dan metrik profitabilitas gudang.
        </p>
      </div>

      <UnifiedGudangClient 
        dashboardData={{ activeLoanCapital, netProfit, statusCounts }}
        lifecycleCounts={lifecycleCounts}
        cashierName={session.email || "Kasir MBG"}
      />
    </div>
  );
}
