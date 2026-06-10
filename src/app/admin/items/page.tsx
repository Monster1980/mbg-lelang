import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ExternalLink, Printer } from "lucide-react";

export default async function AdminItemsPage() {
  const items = await prisma.auctionItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Manajemen Barang</h1>
          <p className="text-text-secondary mt-1">Daftar semua barang di katalog.</p>
        </div>
        <Link 
          href="/admin/items/new" 
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          Tambah Barang
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Nama Barang</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-brand-400 font-bold">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    <div className="max-w-[250px] truncate" title={item.title}>{item.title}</div>
                    <div className="text-xs text-text-muted mt-1">{item.branchName}</div>
                  </td>
                  <td className="px-6 py-4 text-text-primary font-medium">{formatIDR(item.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      item.status === 'Tersedia' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'Dipesan' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/items/${item.id}`} className="text-text-muted hover:text-brand-400 transition-colors flex flex-col items-center gap-1" title="Detail & Print Barcode">
                        <Printer className="w-5 h-5" />
                      </Link>
                      <Link href={`/katalog/${item.id}`} target="_blank" className="text-text-muted hover:text-white transition-colors flex flex-col items-center gap-1" title="Lihat di Publik">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center">
                      <PackageSearch className="w-12 h-12 mb-3 opacity-20" />
                      Belum ada barang terdaftar.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
