"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Filter } from "lucide-react";
import DateRangePicker, { DateRange } from "@/components/DateRangePicker";

const toLocalIsoDateString = (date: Date | null): string => {
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === "null") return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

const formatBranchName = (name: string) => {
  if (name && name.toLowerCase().includes("pasuruan")) {
    return "Cabang Pasuruan - Sangar";
  }
  return name;
};

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
    from: parseLocalDate(currentStart),
    to: parseLocalDate(currentEnd),
  });

  // Sync state with URL props when they change (e.g. on navigation or browser back/forward)
  useEffect(() => {
    setBranch(currentBranch);
    setDateRange({
      from: parseLocalDate(currentStart),
      to: parseLocalDate(currentEnd),
    });
  }, [currentBranch, currentStart, currentEnd]);

  const navigateWithFilters = (selectedBranch: string, selectedRange: DateRange) => {
    const params = new URLSearchParams();
    if (selectedBranch && selectedBranch !== "all") {
      params.set("branch", selectedBranch);
    }

    if (selectedRange.from) {
      const startStr = toLocalIsoDateString(selectedRange.from);
      const endStr = toLocalIsoDateString(selectedRange.to || selectedRange.from);
      params.set("start", startStr);
      params.set("end", endStr);
    }

    router.push(`/admin/reports?${params.toString()}`);
  };

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    navigateWithFilters(newBranch, dateRange);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    navigateWithFilters(branch, newRange);
  };

  const handleExportExcel = () => {
    console.log("handleExportExcel triggered!");
    const params = new URLSearchParams();
    if (branch) {
      params.set("branch", branch);
    }
    if (dateRange.from) {
      const startStr = toLocalIsoDateString(dateRange.from);
      const endStr = toLocalIsoDateString(dateRange.to || dateRange.from);
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
      <div className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          FILTER LAPORAN
        </div>
        <div className="max-w-xs w-full">
          <div className="hidden">
            <label className="block text-xs text-slate-600 mb-1 font-medium">Cabang</label>
            <select
              disabled={!isSuperAdmin}
              value={branch}
              onChange={(e) => handleBranchChange(e.target.value)}
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
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} placeholder="Semua Waktu" />
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

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
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
                    <div className="text-slate-900 font-medium">{formatBranchName(tx.branchName)}</div>
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

      {/* Mobile Card List (visible only on mobile) */}
      <div className="block md:hidden space-y-3">
        {initialTransactions.map((tx) => (
          <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 mb-1 inline-block">
                  {tx.sku}
                </span>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{tx.item.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(tx.transactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • {new Date(tx.transactionDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="font-bold text-slate-900 text-sm">{formatIDR(tx.soldPrice)}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-50 text-[11px] flex justify-between text-slate-600">
              <span className="truncate pr-2">{formatBranchName(tx.branchName)}</span>
              <span className="font-medium whitespace-nowrap shrink-0">Kasir: {tx.cashierName}</span>
            </div>
          </div>
        ))}
        {initialTransactions.length === 0 && (
          <div className="py-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm">Tidak ada transaksi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
