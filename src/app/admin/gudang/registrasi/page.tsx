"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RegistrasiGadaiPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    uniqueCode: "",
    startDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    itemName: "",
    description: "",
    loanAmount: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Strict requirement: "kode unik hanya berupa angka"
    if (name === "uniqueCode") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
      return;
    }
    
    if (name === "loanAmount") {
      // Remove any non-numeric characters for currency formatting
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/gudang/registrasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Extract plain number string for the API
          loanAmount: formData.loanAmount || "0",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Specifically handling the duplicate unique code error (400 Bad Request)
        throw new Error(data.message || "Terjadi kesalahan saat registrasi");
      }

      setSuccess(true);
      // Reset form but keep startDate and some general structure
      setFormData({
        uniqueCode: "",
        startDate: new Date().toISOString().split("T")[0],
        customerName: "",
        customerPhone: "",
        itemName: "",
        description: "",
        loanAmount: "",
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Registrasi Barang Gadai Baru</h1>
        <p className="text-gray-500 mt-2">Masukkan detail nasabah dan barang untuk pendaftaran kontrak gadai.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-start animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Registrasi Gagal</h3>
            <div className="mt-1 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Registrasi barang berhasil disimpan!</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section: Identifikasi Kontrak */}
            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-4 mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Detail Kontrak</h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700">
                Kode Unik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="uniqueCode"
                name="uniqueCode"
                required
                placeholder="Contoh: 10293481"
                value={formData.uniqueCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500">Hanya angka diperbolehkan.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Tanggal Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Section: Identifikasi Nasabah */}
            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-4 mt-4 mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Data Nasabah</h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Nama Nasabah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                placeholder="Nama Lengkap Nasabah"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                No. HP Nasabah <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                required
                placeholder="081234567890"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Section: Detail Barang */}
            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-4 mt-4 mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Detail Barang Gadai</h2>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                required
                placeholder="Contoh: Laptop Asus ROG Strix G15"
                value={formData.itemName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi Barang <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                placeholder="Kondisi, kelengkapan, minus, dsb..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
              <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
                Jumlah Pinjaman (IDR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="loanAmount"
                  name="loanAmount"
                  required
                  placeholder="Rp 0"
                  value={formData.loanAmount ? formatCurrency(formData.loanAmount) : ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-lg font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 mr-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 flex items-center justify-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Registrasi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
