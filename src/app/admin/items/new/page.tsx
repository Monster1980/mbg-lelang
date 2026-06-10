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
    branchName: "MBG Cabang Jakarta Pusat",
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Tambah Barang Baru</h1>
        <p className="text-text-secondary mt-1">Masukkan detail barang lelang atau preloved ke dalam katalog.</p>
      </div>

      <div className="glass rounded-3xl p-8 border border-white/10 shadow-xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nama Barang</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all" placeholder="Contoh: iPhone 13 Pro Max" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all">
                    <option>Elektronik</option>
                    <option>Fashion</option>
                    <option>Perhiasan</option>
                    <option>Jam Tangan</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Grade Kondisi</label>
                  <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all">
                    <option value="A">Grade A (Mulus)</option>
                    <option value="B">Grade B (Minus Dikit)</option>
                    <option value="C">Grade C (Minus Banyak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Harga (Rp)</label>
                <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all" placeholder="Contoh: 5000000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Pilih Cabang</label>
                <select value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all">
                  <option>MBG Cabang Jakarta Pusat</option>
                  <option>MBG Cabang Bandung</option>
                  <option>MBG Cabang Surabaya</option>
                  <option>MBG Cabang Semarang</option>
                  <option>MBG Cabang Medan</option>
                </select>
                <p className="text-xs text-text-muted mt-1">SKU akan digenerate otomatis berdasarkan cabang.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nomor WhatsApp CS</label>
                <input required type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all" placeholder="628..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Deskripsi Barang</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 transition-all" placeholder="Spesifikasi dan kelengkapan..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Minus / Defect (Opsional)</label>
                <textarea rows={2} value={formData.defects} onChange={e => setFormData({...formData, defects: e.target.value})} className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-red-500 transition-all" placeholder="Catat jika ada lecet, kerusakan kecil, dll." />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">Upload Gambar (Simulasi Kompresi)</label>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <label className="flex flex-col items-center justify-center w-full md:w-64 h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-surface-elevated hover:bg-white/5 hover:border-brand-500 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary"><span className="font-semibold text-brand-400">Klik untuk upload</span></p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>

              {compressedImageUrl && (
                <div className="flex-1 bg-surface-elevated rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                  <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-black/50 flex-shrink-0">
                    <img src={compressedImageUrl} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-green-400 flex items-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4" /> Berhasil Dikompres
                    </h4>
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>Asli: <span className="text-text-primary">{formatBytes(originalSize)}</span></p>
                      <p>Hasil: <span className="text-brand-400 font-bold">{formatBytes(compressedSize)}</span></p>
                      <p className="text-green-500 font-medium">Hemat: {Math.round((1 - compressedSize / originalSize) * 100)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl gradient-brand text-white font-bold hover:shadow-lg hover:shadow-brand-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? "Menyimpan..." : "Simpan & Generate SKU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
