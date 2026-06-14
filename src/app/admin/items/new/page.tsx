"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { UploadCloud, CheckCircle, AlertCircle, X, Video, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type CompressedImage = {
  url: string;
  originalSize: number;
  compressedSize: number;
};

export default function AddItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);

  const [formData, setFormData] = useState({
    sku: "",
    title: "",
    branchName: "MBG Cabang Pasuruan",
    category: "Elektronik",
    price: "",
    kondisi: "Baru",
    whatsappNumber: "6281234567890",
    description: "",
    defects: "",
    youtubeUrl: "",
  });

  // ─── Currency Masking ──────────────────────────────────────────────────────
  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("id-ID").format(Number(digits));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCurrency(rawValue);
    setFormData({ ...formData, price: formatted });
  };

  const getCleanPrice = (): number => {
    return Number(formData.price.replace(/\./g, ""));
  };

  // ─── Multiple Image Upload ─────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    const newImages: CompressedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const compressedFile = await imageCompression(file, options);

        const reader = new FileReader();
        const result = await new Promise<string>((resolve) => {
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => resolve(reader.result as string);
        });

        newImages.push({
          url: result,
          originalSize: file.size,
          compressedSize: compressedFile.size,
        });
      } catch (err) {
        console.error("Failed to compress image:", err);
        setError(`Gagal mengkompres gambar ke-${i + 1}`);
      }
    }

    setCompressedImages((prev) => [...prev, ...newImages]);
    // Reset input so the same files can be re-selected
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setCompressedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submit Handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.sku.trim()) {
      setError("SKU / ID Barang wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: getCleanPrice(),
        images: compressedImages.length > 0
          ? compressedImages.map((img) => img.url)
          : ["https://placehold.co/800x600/f1f5f9/94a3b8?text=No+Image"],
        youtubeUrl: formData.youtubeUrl.trim() || null,
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin/items");
        router.refresh();
      } else {
        setError(data.message || "Gagal menyimpan barang");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSaved = compressedImages.reduce((acc, img) => acc + img.originalSize - img.compressedSize, 0);
  const totalOriginal = compressedImages.reduce((acc, img) => acc + img.originalSize, 0);

  const inputClassName =
    "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Barang Baru</h1>
        <p className="text-slate-500 mt-1">
          Masukkan detail barang lelang atau preloved ke dalam katalog.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ROW 1 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Input SKU / ID Barang <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.replace(/\D/g, "") })}
                className={inputClassName}
                placeholder="Contoh: 001234"
              />
              <p className="text-xs text-slate-400 mt-1">Harus unik. Hanya angka yang diperbolehkan.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClassName}
                placeholder="Contoh: iPhone 13 Pro Max"
              />
            </div>

            {/* ROW 2 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClassName}
              >
                <option>Elektronik</option>
                <option>Fashion</option>
                <option>Perhiasan</option>
                <option>Jam Tangan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Kondisi Barang</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kondisi: "Baru" })}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all shadow-sm ${
                    formData.kondisi === "Baru"
                      ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  ✨ Baru
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kondisi: "Bekas" })}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all shadow-sm ${
                    formData.kondisi === "Bekas"
                      ? "border-slate-700 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  ♻️ Bekas
                </button>
              </div>
            </div>

            {/* ROW 3 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rp</span>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={formData.price}
                  onChange={handlePriceChange}
                  className={`${inputClassName} pl-10`}
                  placeholder="5.000.000"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Ketik angka, titik pemisah ribuan otomatis muncul.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp CS <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className={inputClassName}
                placeholder="628..."
              />
            </div>

            {/* ROW 4 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lokasi Cabang</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-medium flex items-center gap-2 cursor-not-allowed shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                MBG Cabang Pasuruan (Terkunci)
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-red-500" />
                Link Video Demo YouTube (Opsional)
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className={inputClassName}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* ROW 5 - Textareas */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deskripsi Barang <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClassName}
                placeholder="Spesifikasi dan kelengkapan..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Minus / Defect (Opsional)
              </label>
              <textarea
                rows={5}
                value={formData.defects}
                onChange={(e) => setFormData({ ...formData, defects: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                placeholder="Catat jika ada lecet, kerusakan kecil, dll."
              />
            </div>
          </div>

          {/* ─── Multiple Image Upload ─────────────────────────────────────────── */}
          <div className="border-t border-slate-200 pt-6 mt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Upload Gambar (Bisa Banyak, Otomatis Dikompres)
            </label>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-500 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-brand-600">Klik untuk upload gambar</span> (bisa pilih banyak)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Maks. 5MB per file, format JPG/PNG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>

              {/* Image Previews Grid */}
              {compressedImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      {compressedImages.length} gambar terupload
                    </p>
                    {totalOriginal > 0 && (
                      <p className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                        Total hemat: {Math.round((totalSaved / totalOriginal) * 100)}% ({formatBytes(totalSaved)})
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {compressedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-square"
                      >
                        <img
                          src={img.url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatBytes(img.compressedSize)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── QR Code Preview + Submit ──────────────────────────────────────── */}
          <div className="border-t border-slate-200 pt-6 mt-2 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* QR Code Preview */}
            {formData.sku.trim() && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <QRCodeSVG
                    value={formData.sku.trim()}
                    size={80}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <QrCode className="w-3.5 h-3.5" /> QR Code Preview
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">{formData.sku.trim()}</p>
                  <p className="text-[10px] text-slate-400 mt-1">QR akan tersedia setelah disimpan</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-70 disabled:hover:shadow-md flex items-center gap-2 ml-auto"
            >
              {loading ? "Menyimpan..." : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
