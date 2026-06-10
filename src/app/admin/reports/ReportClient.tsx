"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Filter, Search, Calendar } from "lucide-react";

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
          <h1 className="text-3xl font-bold text-text-primary">Laporan Penjualan</h1>
          <p className="text-text-secondary mt-1">Rekapitulasi data transaksi dari seluruh kasir cabang.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={initialTransactions.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-surface-elevated disabled:text-text-muted text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export CSV (Excel)
        </button>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Laporan
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Cabang</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-500 outline-none w-48">
              <option value="">Semua Cabang</option>
              {branchList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Tanggal Mulai</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-500 outline-none css-color-scheme-dark" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Tanggal Akhir</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-500 outline-none css-color-scheme-dark" />
          </div>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Terapkan
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted font-bold tracking-wider uppercase mb-1">Total Transaksi</p>
            <h3 className="text-3xl font-black text-white">{initialTransactions.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-2xl">🛍️</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted font-bold tracking-wider uppercase mb-1">Total Pendapatan (Filtered)</p>
            <h3 className="text-3xl font-black text-green-400">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">Tgl Transaksi</th>
                <th className="px-6 py-4 font-semibold">Barang</th>
                <th className="px-6 py-4 font-semibold">Cabang & Kasir</th>
                <th className="px-6 py-4 font-semibold text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-text-primary">{new Date(tx.transactionDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                    <div className="text-xs text-text-muted">{new Date(tx.transactionDate).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary">{tx.sku}</div>
                    <div className="text-text-secondary text-xs truncate max-w-[200px]" title={tx.item.title}>{tx.item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-text-primary font-medium">{tx.branchName}</div>
                    <div className="text-xs text-text-muted">Kasir: {tx.cashierName}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-400">
                    {formatIDR(tx.soldPrice)}
                  </td>
                </tr>
              ))}
              {initialTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                    Tidak ada data transaksi pada rentang filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required for dark mode date inputs across browsers */}
      <style dangerouslySetInnerHTML={{__html: `
        .css-color-scheme-dark { color-scheme: dark; }
      `}} />
    </div>
  );
}
