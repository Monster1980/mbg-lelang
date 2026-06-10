"use client";

import { useState, useRef, useEffect } from "react";
import { ScanBarcode, UserCircle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function KasirPOSPage() {
  const [cashierName, setCashierName] = useState("");
  const [skuInput, setSkuInput] = useState("");
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastTx, setLastTx] = useState<any>(null); // To hold data for the receipt
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on barcode input if a cashier is selected and no item is currently being viewed
  useEffect(() => {
    if (!item && cashierName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [item, cashierName]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuInput.trim()) return;
    if (!cashierName) {
      setError("Silakan pilih nama kasir terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setItem(null);

    try {
      const res = await fetch(`/api/kasir/scan?sku=${encodeURIComponent(skuInput.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setItem(data.data);
        playBeep(true);
      } else {
        setError(data.message || "Barang tidak ditemukan.");
        playBeep(false);
        setSkuInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      setError("Kesalahan jaringan saat mencari barang.");
      setSkuInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!item) return;
    
    setLoading(true);
    setError("");

    try {
      const payload = {
        itemId: item.id,
        sku: item.sku,
        soldPrice: item.price,
        branchName: item.branchName,
        cashierName: cashierName,
      };

      const res = await fetch("/api/kasir/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`Transaksi Berhasil! ${item.sku} telah terjual.`);
        
        // Save tx data for receipt printing
        setLastTx({
          ...item,
          cashierName,
          txDate: new Date().toLocaleString("id-ID", { 
            day: "2-digit", month: "short", year: "numeric", 
            hour: "2-digit", minute: "2-digit" 
          }),
        });

        setItem(null);
        setSkuInput("");
        
        // Trigger Print Window
        setTimeout(() => {
          window.print();
          // Return focus to scanner after printing dialog is handled
          setTimeout(() => inputRef.current?.focus(), 1000);
        }, 500);

      } else {
        setError(data.message || "Gagal memproses transaksi.");
      }
    } catch (err) {
      setError("Kesalahan jaringan saat proses transaksi.");
    } finally {
      setLoading(false);
    }
  };

  const playBeep = (isSuccess: boolean) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (isSuccess) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      }
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {
      console.error("Audio beep not supported", e);
    }
  };

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  }

  const cashierList = ["Admin Pusat", "Kasir Andi (JKT)", "Kasir Budi (BDG)", "Kasir Citra (SBY)"];

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <ScanBarcode className="w-8 h-8 text-brand-400" /> Modul POS Kasir
          </h1>
          <p className="text-text-secondary mt-1">Sistem kasir toko fisik. Tembak barcode untuk mempercepat transaksi offline.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2 relative z-10">
                <UserCircle className="w-5 h-5 text-brand-400" /> Petugas Kasir
              </label>
              <select 
                value={cashierName} 
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-500 transition-all font-semibold relative z-10"
              >
                <option value="" disabled>-- Pilih Nama Kasir --</option>
                {cashierList.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              
              <hr className="my-6 border-white/5 relative z-10" />

              <label className="block text-sm font-medium text-text-primary mb-2 relative z-10">Scan Barcode (SKU)</label>
              <form onSubmit={handleScan} className="relative z-10">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  disabled={loading || !!item}
                  placeholder={cashierName ? "Arahkan scanner..." : "Pilih kasir dulu"}
                  className={`w-full bg-surface-elevated border-2 rounded-xl px-4 py-4 text-text-primary text-xl font-mono tracking-widest focus:outline-none transition-all ${
                    !cashierName ? 'opacity-50 cursor-not-allowed border-white/10' : 'border-brand-500/50 focus:border-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
                  autoComplete="off"
                />
                <button type="submit" className="hidden">Scan</button>
              </form>
              <p className="text-xs text-text-muted mt-3 relative z-10 leading-relaxed">Sistem otomatis mendeteksi saat scanner menembakkan kode dan akan langsung mencetak struk jika transaksi sukses.</p>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200 font-medium">{success}</p>
              </div>
            )}
          </div>

          {/* Right Column: Scanned Item & Checkout */}
          <div className="lg:col-span-2">
            {item ? (
              <div className="glass rounded-3xl overflow-hidden border border-brand-500/30 shadow-2xl shadow-brand-500/10 animate-in zoom-in-95 duration-300 flex flex-col h-full">
                <div className="p-6 bg-brand-500/10 border-b border-brand-500/20 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-brand-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Barang Ditemukan
                  </h2>
                  <button 
                    onClick={() => { setItem(null); setSkuInput(""); setTimeout(() => inputRef.current?.focus(), 100); }}
                    className="text-sm text-text-muted hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    <RefreshCw className="w-4 h-4" /> Batal Transaksi
                  </button>
                </div>
                
                <div className="p-8 flex flex-col md:flex-row gap-8 flex-grow">
                  <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex-shrink-0 relative">
                    {item.images[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">Tanpa Gambar</div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-sm font-mono text-brand-400 font-bold mb-1 tracking-widest bg-brand-500/10 inline-block px-2 py-0.5 rounded">{item.sku}</div>
                      <h3 className="text-3xl font-black text-white mt-2 leading-tight">{item.title}</h3>
                      <p className="text-text-secondary text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {item.branchName}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-surface-elevated p-4 rounded-xl border border-white/5">
                      <div><span className="text-xs text-text-muted block uppercase tracking-widest font-bold mb-1">Kategori</span><span className="font-semibold text-white">{item.category}</span></div>
                      <div><span className="text-xs text-text-muted block uppercase tracking-widest font-bold mb-1">Kondisi</span><span className="font-bold text-green-400">Grade {item.grade}</span></div>
                    </div>
                    
                    <div className="pt-4">
                      <span className="text-sm text-text-muted block uppercase tracking-widest font-bold mb-1">Total Tagihan</span>
                      <div className="text-4xl font-black text-gradient-gold">
                        {formatIDR(item.price)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface-elevated border-t border-white/10 mt-auto">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xl uppercase tracking-widest shadow-lg shadow-[#25D366]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? "Memproses Data..." : "Selesaikan & Cetak Struk"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] glass rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 opacity-60 bg-surface-elevated/50">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
                  <ScanBarcode className="w-24 h-24 text-text-muted relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Menunggu Pemindaian</h3>
                <p className="text-text-secondary max-w-sm leading-relaxed">
                  Arahkan scanner ke stiker barcode barang. Sistem akan memuat detail barang secara kilat.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THERMAL PRINTER RECEIPT TEMPLATE - ONLY VISIBLE DURING PRINT */}
      {lastTx && (
        <div className="hidden print:block text-black bg-white w-full max-w-[80mm] mx-auto p-4 text-sm font-mono absolute top-0 left-0">
          <div className="text-center mb-4">
            <h1 className="font-black text-2xl tracking-tight">PT MBG</h1>
            <p className="font-bold text-xs">{lastTx.branchName}</p>
            <p className="text-[10px] mt-1">Katalog Lelang & Bekas</p>
          </div>
          
          <div className="border-t-2 border-black border-dashed py-2 mb-2 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span>Tgl:</span>
              <span>{lastTx.txDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{lastTx.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode:</span>
              <span>CASH / OFFLINE</span>
            </div>
          </div>
          
          <div className="border-t-2 border-black border-dashed py-4 mb-2">
            <div className="font-bold mb-1">{lastTx.title}</div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-bold">SKU:</span>
              <span>{lastTx.sku}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black/20">
              <span>TOTAL</span>
              <span>{formatIDR(lastTx.price)}</span>
            </div>
          </div>
          
          <div className="border-t-2 border-black border-dashed pt-4 text-center text-[10px]">
            <p className="font-bold mb-1">TERIMA KASIH</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
            <p className="mt-4 opacity-50">Powered by MBG System</p>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              body { background-color: white !important; margin: 0; padding: 0; }
              .print\\:hidden { display: none !important; }
              .print\\:block { visibility: visible; display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
              .print\\:block * { visibility: visible; }
              @page { size: 80mm auto; margin: 0; }
            }
          `}} />
        </div>
      )}
    </>
  );
}
