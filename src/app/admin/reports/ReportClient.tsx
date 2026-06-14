"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Filter, Search } from "lucide-react";
import DateRangePicker, { DateRange } from "@/components/DateRangePicker";

type Transaction = {
  id: number;
  sku: string;
  soldPrice: any;
  branchName: string;
  cashierName: string;
  transactionDate: string;
  item: {
    title: string;
    category: string;
  };
};

type Props = {
  initialTransactions: Transaction[];
  branchList: string[];
  currentBranch: string;
  currentStart: string;
  currentEnd: string;
  isSuperAdmin?: boolean;
};

export default function ReportClient({
  initialTransactions,
  branchList,
  currentBranch,
  currentStart,
  currentEnd,
  isSuperAdmin = false,
}: Props) {
  const router = useRouter();

  // Dynamic branch state (unlocked for superadmin)
  const [branch, setBranch] = useState(currentBranch);

  // Initialize dateRange from initial URL parameters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: currentStart ? new Date(currentStart) : null,
    to: currentEnd ? new Date(currentEnd) : null,
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (branch) {
      params.set("branch", branch);
    }

    if (dateRange.from && dateRange.to) {
      const startStr = dateRange.from.toISOString().split("T")[0];
      const endStr = dateRange.to.toISOString().split("T")[0];
      params.set("start", startStr);
      params.set("end", endStr);
    }

    router.push(`/admin/reports?${params.toString()}`);
  };

  const clearFilters = () => {
    setBranch(isSuperAdmin ? "all" : currentBranch);
    setDateRange({ from: null, to: null });
    router.push(`/admin/reports`);
  };

  const handleExportExcel = () => {
    console.log("handleExportExcel triggered!");
    const params = new URLSearchParams();
    if (branch) {
      params.set("branch", branch);
    }
    if (dateRange.from && dateRange.to) {
      const startStr = dateRange.from.toISOString().split("T")[0];
      const endStr = dateRange.to.toISOString().split("T")[0];
      params.set("start", startStr);
      params.set("end", endStr);
    }
    const url = `/api/admin/reports/export?${params.toString()}`;
    console.log("Triggering download via anchor for: ", url);
    
    // Create a temporary anchor element to trigger the download and bypass any client-side routing
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
      Number(val)
    );
  };

  const totalRevenue = initialTransactions.reduce((acc, tx) => acc + Number(tx.soldPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Laporan Penjualan</h1>
          <p className="text-slate-600 mt-1">Rekapitulasi data transaksi dari cabang Anda.</p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={initialTransactions.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Excel (.xlsx)
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Laporan
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Cabang</label>
            <select
              disabled={!isSuperAdmin}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className={`${
                !isSuperAdmin 
                  ? "bg-slate-50 text-slate-500 cursor-not-allowed" 
                  : "bg-white text-slate-800 cursor-pointer"
              } border border-slate-200 rounded-md px-3 py-2 text-sm outline-none w-48 shadow-sm font-medium`}
            >
              {isSuperAdmin && <option value="all">Semua Cabang</option>}
              {branchList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Rentang Waktu</label>
            <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Semua Waktu" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" /> Terapkan
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-bold tracking-wider uppercase mb-1">Total Transaksi</p>
            <h3 className="text-3xl font-black text-slate-900">{initialTransactions.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
            <span className="text-2xl">🛍️</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-bold tracking-wider uppercase mb-1">Total Pendapatan (Filtered)</p>
            <h3 className="text-3xl font-black text-slate-900">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Tgl Transaksi</th>
                <th className="px-6 py-4 font-semibold">Barang</th>
                <th className="px-6 py-4 font-semibold">Cabang & Kasir</th>
                <th className="px-6 py-4 font-semibold text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(tx.transactionDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{tx.sku}</div>
                    <div className="text-slate-600 text-xs truncate max-w-[200px]" title={tx.item.title}>
                      {tx.item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{tx.branchName}</div>
                    <div className="text-xs text-slate-500">Kasir: {tx.cashierName}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">{formatIDR(tx.soldPrice)}</td>
                </tr>
              ))}
              {initialTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-white">
                    Tidak ada data transaksi pada rentang filter ini.
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
