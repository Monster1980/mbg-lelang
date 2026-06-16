"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Printer, PackageSearch, Search } from "lucide-react";

type Item = {
  id: number;
  sku: string;
  title: string;
  branchName: string;
  price: any;
  status: string;
};

export default function ItemsTableClient({ items }: { items: Item[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sku.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari SKU atau Nama Barang..."
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

      {/* Results count when searching */}
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
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Nama Barang</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4 font-mono text-slate-900 font-bold">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="max-w-[250px] truncate" title={item.title}>{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.branchName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{formatIDR(item.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      item.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'Dipesan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/items/${item.id}`} className="text-slate-500 hover:text-slate-900 transition-colors flex flex-col items-center gap-1" title="Detail & Print Barcode">
                        <Printer className="w-5 h-5" />
                      </Link>
                      <Link href={`/katalog/${item.id}`} target="_blank" className="text-slate-500 hover:text-slate-900 transition-colors flex flex-col items-center gap-1" title="Lihat di Publik">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-white">
                    <div className="flex flex-col items-center">
                      <PackageSearch className="w-12 h-12 mb-3 opacity-20" />
                      {searchQuery.trim()
                        ? `Tidak ada barang dengan SKU atau nama "${searchQuery}".`
                        : "Belum ada barang terdaftar."
                      }
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
          <div key={item.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-none md:shadow-md flex flex-col gap-3 content-visibility-card">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">SKU: {item.sku}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.branchName}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">{formatIDR(item.price)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                item.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                item.status === 'Dipesan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {item.status}
              </span>
              <div className="flex gap-3">
                <Link href={`/admin/items/${item.id}`} className="text-slate-400 hover:text-slate-700 p-1 bg-slate-50 rounded-md">
                  <Printer className="w-4 h-4" />
                </Link>
                <Link href={`/katalog/${item.id}`} target="_blank" className="text-slate-400 hover:text-slate-700 p-1 bg-slate-50 rounded-md">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="py-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            <PackageSearch className="w-10 h-10 mb-2 opacity-20 mx-auto" />
            <p className="text-sm">
              {searchQuery.trim()
                ? `Tidak ada barang.`
                : "Belum ada barang."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
