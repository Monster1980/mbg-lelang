export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import LaporanLelangClient from "./LaporanLelangClient";

export default async function LaporanSiapLelangPage() {
  const physicalItems = await prisma.physicalItem.findMany({
    include: {
      contracts: {
        orderBy: { createdAt: "desc" },
      },
      auctionItems: {
        where: {
          isMarketplaceVisible: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter items whose latest contract status is LELANG and has no visible marketplace listing
  const filteredItems = physicalItems.filter((item) => {
    const latestContract = item.contracts[0];
    const isLelang = latestContract && latestContract.status === "LELANG";
    const hasVisibleListing = item.auctionItems.length > 0;
    return isLelang && !hasVisibleListing;
  });

  // Serialize data for client component
  const serializedItems = filteredItems.map((item) => {
    const latestContract = item.contracts[0];
    return {
      id: item.id,
      itemName: item.itemName,
      serialNumber: item.serialNumber || "-",
      currentRack: item.currentRack,
      uniqueCode: latestContract?.uniqueCode || "-",
      endDate: latestContract?.endDate ? new Date(latestContract.endDate).toISOString() : null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Laporan Barang Siap Lelang</h1>
        <p className="text-slate-500 mt-1">
          Daftar barang fisik gudang yang status kontraknya telah jatuh tempo/LELANG, tetapi belum dipublikasikan ke marketplace.
        </p>
      </div>

      <LaporanLelangClient items={serializedItems} />
    </div>
  );
}
