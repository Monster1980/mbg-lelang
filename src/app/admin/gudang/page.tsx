export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Warehouse, ScanSearch, PackagePlus, ArrowRight, Gavel, ShieldCheck, RefreshCw, Archive } from "lucide-react";

export default async function GudangPage() {
  const totalItems = await prisma.physicalItem.count();

  const contractStats = await prisma.pawnContract.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statusMap: Record<string, number> = {};
  contractStats.forEach((s) => {
    statusMap[s.status] = s._count.id;
  });

  const statCards = [
    { label: "Total Barang Fisik", value: totalItems, icon: Archive, color: "bg-slate-700" },
    { label: "Kontrak Aktif", value: statusMap["AKTIF"] || 0, icon: ShieldCheck, color: "bg-emerald-600" },
    { label: "Diperpanjang", value: statusMap["DIPERPANJANG"] || 0, icon: RefreshCw, color: "bg-blue-600" },
    { label: "Siap Lelang", value: statusMap["LELANG"] || 0, icon: Gavel, color: "bg-amber-600" },
    { label: "Lunas", value: statusMap["LUNAS"] || 0, icon: ShieldCheck, color: "bg-green-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-brand-100 rounded-xl">
            <Warehouse className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Gudang & Gadai</h1>
            <p className="text-sm text-slate-500">Manajemen barang fisik, kontrak gadai, dan pipeline lelang.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-900">{card.value}</div>
              <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/gudang/stock-opname"
          className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-300 hover:shadow-lg transition-all flex items-start gap-4"
        >
          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <ScanSearch className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-700 transition-colors">Stock Opname</h3>
            <p className="text-sm text-slate-500 mb-3">Scan kode unik untuk melihat riwayat lengkap & lokasi rak barang.</p>
            <div className="flex items-center text-sm font-bold text-brand-600 gap-1">
              Buka Scanner <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/gudang/tambah"
          className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-300 hover:shadow-lg transition-all flex items-start gap-4"
        >
          <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <PackagePlus className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-700 transition-colors">Registrasi Barang Baru</h3>
            <p className="text-sm text-slate-500 mb-3">Daftarkan barang fisik baru dan buat kontrak gadai pertama.</p>
            <div className="flex items-center text-sm font-bold text-brand-600 gap-1">
              Tambah Barang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
