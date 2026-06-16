import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowDownToLine, Package, Search } from "lucide-react";

// Forcing dynamic rendering so the daily report is always fresh
export const dynamic = "force-dynamic";

export default async function DailySummaryReportPage() {
  // Get start and end of today in local time zone
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 1. Fetch Today's Outflow (Total Appraisal Value)
  const outflowResult = await prisma.pawnContract.aggregate({
    _sum: {
      appraisalValue: true,
    },
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalOutflow = outflowResult._sum.appraisalValue ? Number(outflowResult._sum.appraisalValue) : 0;

  // 2. Fetch Total Count of Items Received Today
  const totalItemsReceived = await prisma.pawnContract.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // 3. Fetch Chronological Transaction Logs for Today
  const transactions = await prisma.pawnContract.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      physicalItem: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Laporan Harian Kasir</h1>
        <p className="text-slate-500 mt-2">
          Ringkasan transaksi dan penerimaan barang gadai untuk hari ini:{" "}
          <span className="font-semibold text-slate-700">
            {format(now, "EEEE, d MMMM yyyy", { locale: id })}
          </span>
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outflow Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowDownToLine className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Uang Keluar</h3>
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalOutflow)}
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Akumulasi nilai pinjaman yang dicairkan hari ini.
          </div>
        </div>

        {/* Item Count Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package className="w-24 h-24 text-brand-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Barang Diterima</h3>
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {totalItemsReceived} <span className="text-xl text-slate-400 font-medium tracking-normal">Item</span>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Total barang jaminan baru yang terdaftar di sistem.
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Log Transaksi Hari Ini</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
              // Interactive filtering can be added via client component later if needed. 
              // Kept simple for standard chronological view first.
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Waktu</th>
                <th scope="col" className="px-6 py-4 font-semibold">Kode Unik / SKU</th>
                <th scope="col" className="px-6 py-4 font-semibold">Nama Nasabah</th>
                <th scope="col" className="px-6 py-4 font-semibold">Barang Gadai</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Nilai Pinjaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(tx.createdAt), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {tx.uniqueCode}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {tx.customerName}
                    </td>
                    <td className="px-6 py-4">
                      {tx.physicalItem?.itemName || "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(Number(tx.appraisalValue))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    Belum ada transaksi yang tercatat hari ini.
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
