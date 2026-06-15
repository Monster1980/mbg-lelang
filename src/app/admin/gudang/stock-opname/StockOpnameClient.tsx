"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  ScanSearch,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
  Hash,
  Package,
  X,
  ArrowDown,
  ShieldCheck,
  RefreshCw,
  Gavel,
  CheckCircle2,
  Camera,
  Info,
} from "lucide-react";

type PawnContract = {
  id: string;
  uniqueCode: string;
  status: string;
  customerName: string;
  appraisalValue: number;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
};

type PhysicalItem = {
  id: string;
  itemName: string;
  category: string;
  serialNumber: string | null;
  branchName: string;
  currentRack: string;
  description: string | null;
  images: string[];
  contracts: PawnContract[];
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  AKTIF: { label: "Aktif", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200", icon: ShieldCheck },
  DIPERPANJANG: { label: "Diperpanjang", color: "text-blue-700", bg: "bg-blue-100 border-blue-200", icon: RefreshCw },
  LUNAS: { label: "Lunas", color: "text-green-700", bg: "bg-green-100 border-green-200", icon: CheckCircle2 },
  LELANG: { label: "Lelang", color: "text-amber-700", bg: "bg-amber-100 border-amber-200", icon: Gavel },
};

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function StockOpnameClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PhysicalItem | null>(null);
  const [matchedCode, setMatchedCode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLookup = useCallback(async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/admin/gudang/lookup?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.data);
        setMatchedCode(data.matchedCode);
      } else {
        setError(data.message || "Kode tidak ditemukan.");
      }
    } catch (err) {
      setError("Kesalahan jaringan saat mencari kode.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(query);
  };

  // Barcode scanner integration
  const startCamera = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("opname-scanner");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 120 }, aspectRatio: 1.5 },
        (decodedText: string) => {
          // On successful scan
          setQuery(decodedText.trim());
          stopCamera();
          setIsScannerOpen(false);
          handleLookup(decodedText.trim());
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Gagal mengakses kamera. Pastikan izin telah diberikan.");
    }
  }, [handleLookup]);

  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.error("Stop camera error:", err);
    }
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [isScannerOpen, startCamera, stopCamera]);

  const latestContract = result?.contracts[result.contracts.length - 1];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan kode unik gadai..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2 font-semibold text-sm"
        >
          <Camera className="w-5 h-5" />
          <span className="hidden md:inline">Scan</span>
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors font-bold text-sm disabled:opacity-50 shadow-sm flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanSearch className="w-5 h-5" />}
          <span className="hidden md:inline">Cari</span>
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
          <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Mencari kode...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Physical Item Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Image header */}
            {result.images && result.images.length > 0 && (
              <div className="relative aspect-[21/9] bg-slate-100">
                <Image
                  src={result.images[0]}
                  alt={result.itemName}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">{result.itemName}</h2>
                </div>
              </div>
            )}

            {!result.images?.length && (
              <div className="p-5 pb-0">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{result.itemName}</h2>
              </div>
            )}

            {/* Info grid */}
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Kategori
                </div>
                <div className="text-sm font-bold text-slate-900">{result.category}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Rak
                </div>
                <div className="text-sm font-bold text-slate-900">{result.currentRack}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Cabang
                </div>
                <div className="text-sm font-bold text-slate-900">{result.branchName}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Serial
                </div>
                <div className="text-sm font-bold text-slate-900">{result.serialNumber || "—"}</div>
              </div>
            </div>

            {result.description && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                  <Info className="w-3 h-3" /> Deskripsi
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.description}</p>
              </div>
            )}
          </div>

          {/* Contract Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-600" />
              Riwayat Kontrak Gadai ({result.contracts.length} kontrak)
            </h3>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-200" />

              <div className="space-y-0">
                {result.contracts.map((contract, index) => {
                  const config = statusConfig[contract.status] || statusConfig.AKTIF;
                  const StatusIcon = config.icon;
                  const isMatched = contract.uniqueCode === matchedCode;
                  const isLatest = index === result.contracts.length - 1;

                  return (
                    <div key={contract.id} className="relative flex gap-4 group">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0 mt-1">
                        <div className={`w-[35px] h-[35px] rounded-full flex items-center justify-center border-2 transition-all ${
                          isLatest
                            ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30"
                            : isMatched
                            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30"
                            : "bg-white border-slate-300 text-slate-400"
                        }`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-6 ${index === result.contracts.length - 1 ? 'pb-0' : ''}`}>
                        <div className={`rounded-xl p-4 border transition-all ${
                          isMatched
                            ? "border-amber-300 bg-amber-50 ring-2 ring-amber-200"
                            : isLatest
                            ? "border-brand-200 bg-brand-50"
                            : "border-slate-200 bg-slate-50"
                        }`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{contract.uniqueCode}</code>
                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${config.bg} ${config.color}`}>
                                  {config.label}
                                </span>
                                {isMatched && (
                                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-amber-500 text-white">
                                    Kode Discan
                                  </span>
                                )}
                                {isLatest && (
                                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-brand-600 text-white">
                                    Terbaru
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Nasabah: <span className="font-semibold text-slate-700">{contract.customerName}</span></p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-black text-slate-900">{formatIDR(Number(contract.appraisalValue))}</div>
                              <div className="text-[10px] text-slate-500">Taksiran</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 flex-wrap">
                            <span>Mulai: <strong className="text-slate-700">{formatDate(contract.startDate)}</strong></span>
                            {contract.endDate && (
                              <span>Selesai: <strong className="text-slate-700">{formatDate(contract.endDate)}</strong></span>
                            )}
                          </div>

                          {contract.notes && (
                            <p className="text-xs text-slate-600 mt-2 bg-white/60 rounded-lg p-2 border border-slate-100">{contract.notes}</p>
                          )}
                        </div>

                        {/* Arrow connector */}
                        {index < result.contracts.length - 1 && (
                          <div className="flex items-center justify-center py-1">
                            <ArrowDown className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 flex items-center justify-between px-4 bg-slate-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <ScanSearch className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold">Scan Kode Gadai</h3>
            </div>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
            <div id="opname-scanner" className="w-full h-full" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]">
              <div className="w-64 h-32 border-2 border-brand-500 rounded-xl relative opacity-80">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 rounded-br-xl" />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-500/50 shadow-[0_0_8px_rgba(79,70,229,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes scan {
              0% { top: 0; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
