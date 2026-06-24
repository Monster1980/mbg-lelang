"use client";

import { useState, useMemo } from "react";
import { Printer, FileText, Lock, CheckSquare, Square, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Item = {
  id: number;
  sku: string;
  title: string;
  branchName: string;
  price: number;
  status: string;
  nomorInduk: string | null;
  parentId: number | null;
  variantImageUrl: string | null;
};

type Props = {
  items: Item[];
  cashierName: string;
};

export default function LaporanClient({ items, cashierName }: Props) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group items by nomorInduk (grouped parent-child items) or individual SKUs (non-grouped)
  const groups = useMemo(() => {
    const map: { [key: string]: Item[] } = {};
    const individualItems: Item[] = [];

    items.forEach(item => {
      if (item.nomorInduk) {
        if (!map[item.nomorInduk]) {
          map[item.nomorInduk] = [];
        }
        map[item.nomorInduk].push(item);
      } else {
        individualItems.push(item);
      }
    });

    const groupedList = Object.keys(map).map(nomInduk => {
      const groupItems = map[nomInduk];
      // A group is locked if it has child variants (items with parentId !== null) and at least one variant is unsold
      // status 'Tersedia' / 'RETUR' / 'Dipesan' implies not 'Terjual'
      const hasUnsoldVariants = groupItems.some(item => item.parentId !== null && item.status !== "Terjual");
      return {
        id: nomInduk,
        nomorInduk: nomInduk,
        items: groupItems,
        isLocked: hasUnsoldVariants,
      };
    });

    // Individual items are treated as separate groups
    individualItems.forEach(item => {
      const isLocked = item.status !== "Terjual";
      groupedList.push({
        id: `indiv-${item.id}`,
        nomorInduk: `Non-Group (${item.sku})`,
        items: [item],
        isLocked,
      });
    });

    return groupedList;
  }, [items]);

  const handleToggleGroup = (groupId: string, isLocked: boolean) => {
    if (isLocked) return;
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    const unlockableGroupIds = groups.filter(g => !g.isLocked).map(g => g.id);
    if (selectedGroupIds.length === unlockableGroupIds.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(unlockableGroupIds);
    }
  };

  const selectedItemsToPrint = useMemo(() => {
    const list: Item[] = [];
    groups.forEach(g => {
      if (selectedGroupIds.includes(g.id)) {
        list.push(...g.items);
      }
    });
    return list;
  }, [selectedGroupIds, groups]);

  const totalAppraisalValue = selectedItemsToPrint.reduce((sum, item) => sum + item.price, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 1. Normal View (hidden during print) */}
      <div className={`${isPrintMode ? "hidden" : "block"} space-y-6 print:hidden`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kompilasi Berita Acara</h1>
            <p className="text-slate-500 mt-1">Pilih nomor induk atau barang yang seluruh sub-barangnya telah terjual untuk dicetak.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/mbg-internal-portal"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Portal
            </Link>
            <button
              onClick={() => {
                if (selectedGroupIds.length === 0) return;
                setIsPrintMode(true);
              }}
              disabled={selectedGroupIds.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer disabled:cursor-not-allowed animate-in fade-in"
            >
              <FileText className="w-5 h-5" /> Kompilasikan Berita Acara ({selectedItemsToPrint.length} item)
            </button>
          </div>
        </div>

        {/* Groups Selection Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-150 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Daftar Pengelompokan Barang</h2>
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
            >
              {selectedGroupIds.length === groups.filter(g => !g.isLocked).length ? "Kosongkan Semua" : "Pilih Semua yang Unlocked"}
            </button>
          </div>

          <div className="divide-y divide-slate-150">
            {groups.map((group) => {
              const isChecked = selectedGroupIds.includes(group.id);
              return (
                <div
                  key={group.id}
                  onClick={() => handleToggleGroup(group.id, group.isLocked)}
                  className={`p-6 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between cursor-pointer ${
                    group.isLocked
                      ? "bg-slate-50/50 cursor-not-allowed"
                      : isChecked
                      ? "bg-blue-50/40 border-l-4 border-blue-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {group.isLocked ? (
                        <div className="w-5 h-5 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : isChecked ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-slate-900 font-mono text-sm">Nomor Induk: {group.nomorInduk}</span>
                        {group.isLocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider">
                            🔒 Cetak Terkunci (Seluruh sub-barang harus terjual semua)
                          </span>
                        )}
                        {!group.isLocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            ✅ Siap Cetak
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total {group.items.length} sub-barang di bawah grup ini.
                      </div>

                      {/* Sub Items detailed list */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        {group.items.map((subItem) => (
                          <div key={subItem.id} className="flex items-center justify-between p-2 bg-slate-100/50 rounded-lg text-xs font-medium border border-slate-200/40">
                            <span className="text-slate-700 truncate pr-2" title={subItem.title}>{subItem.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold shrink-0 ${
                              subItem.status === "Terjual"
                                ? "bg-slate-700 text-white"
                                : subItem.status === "RETUR"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {subItem.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap self-end md:self-center">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Nilai</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {formatIDR(group.items.reduce((s, it) => s + it.price, 0))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Print Layout & Matrix Compilation */}
      <div className={`${isPrintMode ? "block" : "hidden"} space-y-6`}>
        {/* Navigation & Print Actions Toolbar (hidden in physical printer) */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <button
            onClick={() => setIsPrintMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali Edit Pilihan
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-all shadow-md text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Sekarang (A4)
          </button>
        </div>

        {/* Printable Document A4 Frame */}
        <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-lg max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0 print:mx-0 print:w-full bg-white text-slate-900 font-serif">
          {/* Document Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-800 pb-6 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-wider font-sans">PT. MAJU BERSAMA GADAI (PT MBG)</h2>
            <p className="text-xs font-sans tracking-wide font-medium">Kantor Cabang: Pasuruan - Sangar • Telp: (0343) 424132</p>
            <h1 className="text-lg font-extrabold uppercase border border-slate-800 py-1.5 px-4 inline-block font-sans mt-4">
              BERITA ACARA PENJUALAN BARANG LELANG
            </h1>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <p>
              Pada hari ini, <span className="font-bold font-sans">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>, telah direkapitulasi data penjualan barang jaminan gadai yang telah jatuh tempo dan dilelang sepenuhnya di PT MBG Cabang Pasuruan.
            </p>
            
            <p>
              Berikut adalah matriks rincian barang lelang yang telah terjual secara sah:
            </p>

            {/* A4 printable matrix table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-800 my-6">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800">
                  <th className="border border-slate-800 px-3 py-2 text-center font-bold">No</th>
                  <th className="border border-slate-800 px-3 py-2 font-bold">Nomor Induk</th>
                  <th className="border border-slate-800 px-3 py-2 font-bold">SKU Varian</th>
                  <th className="border border-slate-800 px-3 py-2 font-bold">Nama Barang</th>
                  <th className="border border-slate-800 px-3 py-2 text-right font-bold">Harga Terjual</th>
                </tr>
              </thead>
              <tbody>
                {selectedItemsToPrint.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-800">
                    <td className="border border-slate-800 px-3 py-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 px-3 py-2 font-mono">{item.nomorInduk || "-"}</td>
                    <td className="border border-slate-800 px-3 py-2 font-mono">{item.sku}</td>
                    <td className="border border-slate-800 px-3 py-2 font-sans font-medium">{item.title}</td>
                    <td className="border border-slate-800 px-3 py-2 text-right font-mono font-bold">{formatIDR(item.price)}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
                  <td colSpan={4} className="border border-slate-800 px-3 py-2.5 text-right uppercase tracking-wider font-sans">TOTAL PENERIMAAN B.A:</td>
                  <td className="border border-slate-800 px-3 py-2.5 text-right font-mono text-sm font-black">{formatIDR(totalAppraisalValue)}</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-4">
              Demikian berita acara ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya sebagai bukti rekapitulasi pelaporan transaksi harian cabang.
            </p>

            {/* Signature blocks */}
            <div className="grid grid-cols-2 gap-8 pt-16 mt-16 text-center font-sans">
              <div className="space-y-16">
                <div>
                  <p className="text-xs text-slate-500">Dibuat Oleh,</p>
                  <p className="font-bold text-slate-800 mt-1">Kasir PT MBG Pasuruan</p>
                </div>
                <div className="border-t border-slate-300 pt-2 w-48 mx-auto font-bold text-slate-900">
                  {cashierName}
                </div>
              </div>
              <div className="space-y-16">
                <div>
                  <p className="text-xs text-slate-500">Disetujui Oleh,</p>
                  <p className="font-bold text-slate-800 mt-1">Pimpinan Cabang</p>
                </div>
                <div className="border-t border-slate-300 pt-2 w-48 mx-auto font-bold text-slate-400">
                  ( Tanda Tangan & Stempel )
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
