export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ItemsTableClient from "./ItemsTableClient";

export default async function AdminItemsPage() {
  const items = await prisma.auctionItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal to number for client component
  const serializedItems = items.map((item) => ({
    id: item.id,
    sku: item.sku,
    title: item.title,
    branchName: item.branchName,
    price: Number(item.price),
    status: item.status,
    isMarketplaceVisible: item.isMarketplaceVisible,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Barang</h1>
          <p className="text-slate-500 mt-1">Daftar semua barang di katalog.</p>
        </div>
        <Link 
          href="/mbg-internal-portal/items/new" 
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Tambah Barang
        </Link>
      </div>

      <ItemsTableClient items={serializedItems} />
    </div>
  );
}
