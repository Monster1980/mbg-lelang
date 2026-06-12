"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

export default function AddItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compressedImageUrl, setCompressedImageUrl] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    branchName: "MBG Cabang Pasuruan",
    category: "Elektronik",
    price: "",
    grade: "A",
    whatsappNumber: "6281234567890",
    description: "",
    defects: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setCompressedSize(compressedFile.size);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setCompressedImageUrl(reader.result as string);
      };
    } catch (err) {
      console.error(err);
      setError("Gagal mengkompres gambar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        images: compressedImageUrl ? [compressedImageUrl] : ["https://placehold.co/800x600/1a1a2e/e0e0e0?text=No+Image"],
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/items");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menyimpan barang");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const inputClassName = "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Barang Baru</h1>
        <p className="text-slate-500 mt-1">Masukkan detail barang lelang atau preloved ke dalam katalog.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ROW 1 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Barang</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClassName} placeholder="Contoh: iPhone 13 Pro Max" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor WhatsApp CS</label>
              <input required type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className={inputClassName} placeholder="628..." />
            </div>

            {/* ROW 2 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClassName}>
                <option>Elektronik</option>
                <option>Fashion</option>
                <option>Perhiasan</option>
                <option>Jam Tangan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Grade Kondisi</label>
              <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className={inputClassName}>
                <option value="A">Grade A (Mulus)</option>
                <option value="B">Grade B (Minus Dikit)</option>
                <option value="C">Grade C (Minus Banyak)</option>
              </select>
            </div>

            {/* ROW 3 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga (Rp)</label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClassName} placeholder="Contoh: 5000000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lokasi Cabang</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-medium flex items-center gap-2 cursor-not-allowed shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                MBG Cabang Pasuruan (Terkunci)
              </div>
              <p className="text-xs text-slate-500 mt-1.5">SKU akan digenerate otomatis berdasarkan cabang Pasuruan.</p>
            </div>

            {/* ROW 4 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Barang</label>
              <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClassName} placeholder="Spesifikasi dan kelengkapan..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Minus / Defect (Opsional)</label>
              <textarea rows={5} value={formData.defects} onChange={e => setFormData({...formData, defects: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm" placeholder="Catat jika ada lecet, kerusakan kecil, dll." />
            </div>

          </div>

          {/* ROW 5 - Full Width Dropzone */}
          <div className="border-t border-slate-200 pt-6 mt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Upload Gambar (Simulasi Kompresi)</label>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <label className="flex flex-col items-center justify-center w-full md:w-72 h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-500 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600"><span className="font-semibold text-brand-600">Klik untuk upload gambar</span></p>
                  <p className="text-xs text-slate-400 mt-1">Maks. 5MB, format JPG/PNG</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>

              {compressedImageUrl && (
                <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-28 h-28 relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img src={compressedImageUrl} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-green-600 flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-4 h-4" /> Berhasil Dikompres
                    </h4>
                    <div className="text-sm text-slate-600 space-y-1.5">
                      <p>Ukuran Asli: <span className="text-slate-900 font-medium">{formatBytes(originalSize)}</span></p>
                      <p>Hasil Kompresi: <span className="text-brand-600 font-bold">{formatBytes(compressedSize)}</span></p>
                      <p className="text-green-600 font-semibold inline-block px-2 py-0.5 bg-green-50 rounded-md mt-1">
                        Hemat Space: {Math.round((1 - compressedSize / originalSize) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-70 disabled:hover:shadow-md flex items-center gap-2"
            >
              {loading ? "Menyimpan..." : "Simpan & Generate SKU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
