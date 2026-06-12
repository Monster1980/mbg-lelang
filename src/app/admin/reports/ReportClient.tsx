"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Filter, Search } from "lucide-react";
import DatePicker from "@/components/DatePicker";

type Transaction = {
  id: number;
  sku: string;
  soldPrice: any;
  branchName: string;
  cashierName: string;
  transactionDate: Date;
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
};

export default function ReportClient({ initialTransactions, branchList, currentBranch, currentStart, currentEnd }: Props) {
  const router = useRouter();
  
  const [branch, setBranch] = useState(currentBranch);
  const [start, setStart] = useState(currentStart);
  const [end, setEnd] = useState(currentEnd);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (branch) params.set("branch", branch);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    router.push(`/admin/reports?${params.toString()}`);
  };

  const clearFilters = () => {
    setBranch("");
    setStart("");
    setEnd("");
    router.push(`/admin/reports`);
  };

  const handleExportCSV = () => {
    if (initialTransactions.length === 0) return;

    // Build CSV Content
    const headers = ["ID Transaksi", "Waktu Transaksi", "SKU", "Nama Barang", "Kategori", "Cabang", "Kasir", "Harga Terjual"];
    
    const rows = initialTransactions.map(tx => [
      tx.id,
      new Date(tx.transactionDate).toLocaleString("id-ID"),
      tx.sku,
      `"${tx.item.title.replace(/"/g, '""')}"`,
      tx.item.category,
      tx.branchName,
      tx.cashierName,
      Number(tx.soldPrice)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_MBG_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  }

  const totalRevenue = initialTransactions.reduce((acc, tx) => acc + Number(tx.soldPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Laporan Penjualan</h1>
          <p className="text-slate-600 mt-1">Rekapitulasi data transaksi dari seluruh kasir cabang.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={initialTransactions.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export CSV (Excel)
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Laporan
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Cabang</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none w-48 shadow-sm transition-all hover:bg-slate-50">
              <option value="">Semua Cabang</option>
              {branchList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Tanggal Mulai</label>
            <DatePicker value={start} onChange={setStart} placeholder="Pilih Tanggal Mulai" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Tanggal Akhir</label>
            <DatePicker value={end} onChange={setEnd} placeholder="Pilih Tanggal Akhir" />
          </div>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2 shadow-sm">
              <Search className="w-4 h-4" /> Terapkan
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors shadow-sm">
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
                    <div className="text-slate-900 font-medium">{new Date(tx.transactionDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                    <div className="text-xs text-slate-500">{new Date(tx.transactionDate).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{tx.sku}</div>
                    <div className="text-slate-600 text-xs truncate max-w-[200px]" title={tx.item.title}>{tx.item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{tx.branchName}</div>
                    <div className="text-xs text-slate-500">Kasir: {tx.cashierName}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    {formatIDR(tx.soldPrice)}
                  </td>
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
