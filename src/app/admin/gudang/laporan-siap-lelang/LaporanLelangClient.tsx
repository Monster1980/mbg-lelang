"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Gavel, ClipboardList, ArrowRight, ArrowLeft } from "lucide-react";

type ReadyItem = {
  id: string;
  itemName: string;
  serialNumber: string;
  currentRack: string;
  uniqueCode: string;
  endDate: string | null;
};

export default function LaporanLelangClient({ items }: { items: ReadyItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Tidak Ada";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.itemName.toLowerCase().includes(q) ||
      item.uniqueCode.toLowerCase().includes(q) ||
      item.currentRack.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Back to Gudang Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/gudang"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Gudang
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Nama Barang, Kode Unik, atau Lokasi Rak..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm text-sm font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery.trim() && (
        <p className="text-xs text-slate-500 font-medium px-1">
          Menampilkan {filteredItems.length} dari {items.length} barang
        </p>
      )}

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Barang</th>
                <th className="px-6 py-4 font-semibold">Kode Unik Terakhir</th>
                <th className="px-6 py-4 font-semibold">Lokasi Rak Asli</th>
                <th className="px-6 py-4 font-semibold">Tanggal Jatuh Tempo</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.itemName}</div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">SN: {item.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.uniqueCode}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs uppercase font-bold">
                      {item.currentRack}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-amber-700 font-bold bg-amber-50/30">
                    {formatDate(item.endDate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/items/new?fromPhysical=${item.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Proses ke Marketplace <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada barang siap lelang.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery.trim()
                          ? `Pencarian untuk "${searchQuery}" tidak menemukan hasil.`
                          : "Semua barang jatuh tempo telah dipublikasikan."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (visible only on mobile) */}
      <div className="block md:hidden space-y-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-sm">{item.itemName}</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[10px] uppercase font-bold">
                  {item.currentRack}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">SN: {item.serialNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-2.5">
              <div>
                <p className="text-slate-400 font-medium">Kode Unik</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{item.uniqueCode}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Jatuh Tempo</p>
                <p className="font-bold text-amber-700 mt-0.5">{formatDate(item.endDate)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50 flex justify-end">
              <Link
                href={`/admin/items/new?fromPhysical=${item.id}`}
                className="w-full text-center inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Proses ke Marketplace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada barang siap lelang.</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {searchQuery.trim()
                ? `Pencarian untuk "${searchQuery}" tidak menemukan hasil.`
                : "Semua barang jatuh tempo telah dipublikasikan."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
