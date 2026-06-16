export const dynamic = "force-dynamic";

import StockOpnameClient from "./StockOpnameClient";

export default function StockOpnamePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Stock Opname</h1>
        <p className="text-sm text-slate-500 mt-1">Scan atau masukkan kode unik untuk menelusuri riwayat lengkap barang.</p>
      </div>

      <StockOpnameClient />
    </div>
  );
}
