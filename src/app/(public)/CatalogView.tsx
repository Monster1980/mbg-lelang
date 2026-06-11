"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Status, AuctionItem } from "@prisma/client";
import ProductSkeleton from "@/components/ProductSkeleton";

type CatalogViewProps = {
  items: AuctionItem[];
  categories: { category: string }[];
  branches: { branchName: string }[];
  branchFilter?: string;
};

export default function CatalogView({
  items,
  categories,
  branches,
  branchFilter,
}: CatalogViewProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Initialize search and category queries from URL on load
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
      setActiveCategory(params.get("category") || "Semua Kategori");

      const handleSearch = (e: Event) => {
        const customEvent = e as CustomEvent<string>;
        setSearchQuery(customEvent.detail || "");
      };

      window.addEventListener("searchChange", handleSearch);
      return () => window.removeEventListener("searchChange", handleSearch);
    }
  }, []);

  // Filter items in memory for instant responsiveness
  const displayedItems = useMemo(() => {
    let filtered = items;

    // Category Filter
    if (activeCategory !== "Semua Kategori") {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, activeCategory, searchQuery]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    // Optional: Update URL for sharing without triggering server fetch
    const params = new URLSearchParams(window.location.search);
    if (category === "Semua Kategori") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  };

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  return (
    <>
      {/* Filter Pills - Mobile-friendly horizontal scroll */}
      <div className="mb-8 space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => handleCategoryClick("Semua Kategori")}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                activeCategory === "Semua Kategori"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => handleCategoryClick(c.category)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                  activeCategory === c.category
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {c.category}
              </button>
            ))}
          </div>
        </div>

        {/* Branch Filter */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lokasi Cabang</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Cabang Aktif: Pasuruan
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedItems.length > 0 ? (
          /* Actual Items */
          displayedItems.map((item) => {
            const isUnavailable = item.status === Status.Terjual || item.status === Status.Dipesan;
            
            const CardWrapper: any = isUnavailable ? 'div' : Link;
            const wrapperProps: any = isUnavailable ? {} : { href: `/katalog/${item.id}` };

            return (
              <CardWrapper
                key={item.id}
                {...wrapperProps}
                className={`bg-white rounded-2xl overflow-hidden flex flex-col group border relative ${
                  isUnavailable ? "grayscale opacity-50 border-slate-200" : "border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                }`}
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`object-cover ${!isUnavailable && "group-hover:scale-105 transition-transform duration-500"}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      Tanpa Gambar
                    </div>
                  )}
                  
                  {/* Unavailable Overlay */}
                  {isUnavailable && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 backdrop-blur-[1px]">
                      <span className="px-4 py-2 border-2 border-red-600 text-red-600 font-black text-xl tracking-widest rounded-lg transform -rotate-12 bg-red-50/80 shadow-lg">
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Grade Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`px-2.5 py-1 flex items-center justify-center rounded-lg text-[10px] uppercase font-black shadow-lg backdrop-blur-md border border-white/10 ${
                        item.grade === "A"
                          ? "bg-green-500/90 text-white"
                          : item.grade === "B"
                          ? "bg-yellow-500/90 text-black"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      Grade {item.grade}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow bg-white">
                  <div className="text-[10px] text-brand-600 font-bold tracking-wider uppercase mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="mt-auto pt-3">
                    <div className="text-lg sm:text-xl font-black text-brand-700 mb-2">
                      {formatIDR(item.price)}
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500 gap-1.5 pt-2 border-t border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{item.branchName.replace("MBG Cabang ", "")}</span>
                    </div>
                  </div>
                </div>
              </CardWrapper>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-4xl mb-3 opacity-50 grayscale">📦</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak ada barang</h3>
            <p className="text-sm text-slate-500">Kategori atau cabang yang Anda cari sedang kosong.</p>
            <Link href="/" className="mt-4 px-5 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors">
              Reset Filter
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
