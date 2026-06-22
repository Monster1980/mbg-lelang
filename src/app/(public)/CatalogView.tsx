"use client";
import { Status, AuctionItem } from '@prisma/client';

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { 
  LayoutGrid, 
  Laptop, 
  Gem, 
  Car, 
  Watch, 
  Shirt, 
  Package, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  MapPin,
  PlayCircle,
  Flame
} from "lucide-react";

type CatalogViewProps = {
  items: AuctionItem[];
  categories: { category: string }[];
  branches: { branchName: string }[];
  branchFilter?: string;
  initialCategory: string;
  initialSearchQuery: string;
};

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("semua")) return <LayoutGrid className="w-4 h-4" />;
  if (name.includes("elektronik") || name.includes("hp") || name.includes("laptop")) return <Laptop className="w-4 h-4" />;
  if (name.includes("perhiasan") || name.includes("emas")) return <Gem className="w-4 h-4" />;
  if (name.includes("otomotif") || name.includes("motor") || name.includes("mobil")) return <Car className="w-4 h-4" />;
  if (name.includes("jam")) return <Watch className="w-4 h-4" />;
  if (name.includes("fashion") || name.includes("baju") || name.includes("sepatu")) return <Shirt className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
};

export default function CatalogView({
  items,
  categories,
  branches,
  branchFilter,
  initialCategory,
  initialSearchQuery,
}: CatalogViewProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Pagination states
  const [loadedItems, setLoadedItems] = useState<AuctionItem[]>(items);
  const [skip, setSkip] = useState(items.length);
  const [hasMore, setHasMore] = useState(items.length >= 20);
  const [loading, setLoading] = useState(false);
  const isInitialRef = useRef(true);

  // Sync state with props
  useEffect(() => {
    setActiveCategory(initialCategory);
    setSearchQuery(initialSearchQuery);
  }, [initialCategory, initialSearchQuery]);

  useEffect(() => {
    setLoadedItems(items);
    setSkip(items.length);
    setHasMore(items.length >= 20);
    setLoading(false); // Make sure to turn off loading when new props arrive
  }, [items]);

  // Client-side cache for query results
  const cacheRef = useRef<{
    [key: string]: {
      data: AuctionItem[];
      skip: number;
      hasMore: boolean;
    };
  }>({
    "Semua Kategori::": {
      data: items,
      skip: items.length,
      hasMore: items.length >= 20,
    },
  });

  const observerRef = useRef<HTMLDivElement | null>(null);
  const prevCategoryRef = useRef(activeCategory);

  // Removed client-side filter-fetching useEffect since category and search changes are debounced & processed via Server Component routing.

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("skip", skip.toString());
      if (activeCategory !== "Semua Kategori") {
        params.set("category", activeCategory);
      }
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      const res = await fetch(`/api/items?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        const cacheKey = `${activeCategory}::${searchQuery}`;
        const newItems = [...loadedItems, ...result.data];
        const newSkip = skip + result.data.length;
        const newHasMore = result.hasMore;

        // Update query cache for this filter
        cacheRef.current[cacheKey] = {
          data: newItems,
          skip: newSkip,
          hasMore: newHasMore,
        };

        setLoadedItems(newItems);
        setSkip(newSkip);
        setHasMore(newHasMore);
      }
    } catch (err) {
      console.error("Error loading more items:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, skip, activeCategory, searchQuery, loadedItems]);

  // Intersection Observer for scroll triggers
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, handleLoadMore]);

  const displayedItems = loadedItems;

  const handleCategoryClick = (category: string) => {
    if (category === activeCategory) return;
    
    // Instantly reset states to prevent leaking
    setActiveCategory(category);
    setLoadedItems([]);
    setSkip(0);
    setHasMore(false);
    setLoading(true);
    
    const params = new URLSearchParams(window.location.search);
    if (category === "Semua Kategori") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const openModal = (item: AuctionItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = "auto";
  };

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 pb-2">
            <button
              onClick={() => handleCategoryClick("Semua Kategori")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-2 w-full rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                activeCategory === "Semua Kategori"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {getCategoryIcon("Semua Kategori")} <span className="truncate">Semua</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => handleCategoryClick(c.category)}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-2 w-full rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                  activeCategory === c.category
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title={c.category}
              >
                {getCategoryIcon(c.category)} <span className="truncate">{c.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Extreme Density */}
      <div className="relative">
        {loading && loadedItems.length > 0 && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-start justify-center pt-20 rounded-xl">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin shadow-md"></div>
          </div>
        )}
        <div key={`${activeCategory}-${searchQuery}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {loading && loadedItems.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden flex flex-col group border relative text-left w-full animate-pulse border-gray-150">
                <div className="relative aspect-[4/3] w-full bg-slate-200"></div>
                <div className="p-2 sm:p-4 flex flex-col flex-grow bg-white space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="mt-auto pt-3">
                    <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : displayedItems.length > 0 ? (
          displayedItems.map((item, index) => {
            const isUnavailable = item.status === Status.Terjual;
            const conditionLabel = item.kondisi;
            
            // Mock recommendation logic
            const isRecommended = item.kondisi === "Baru" || Number(item.price) > 5000000;

            return (
              <button
                key={item.id}
                onClick={() => { if(!isUnavailable) openModal(item) }}
                className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden flex flex-col group border relative text-left w-full focus:outline-none content-visibility-card ${
                  isUnavailable ? "grayscale opacity-50 border-gray-150 shadow-none cursor-not-allowed" : "border-gray-150 shadow-none md:shadow-md md:hover:-translate-y-1 md:hover:shadow-lg transition-all duration-300"
                }`}
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  {item.images && item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`object-cover ${!isUnavailable && "group-hover:scale-105 transition-transform duration-500"}`}
                      priority={index === 0 ? true : index < 4}
                      fetchPriority={index === 0 ? "high" : undefined}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] sm:text-sm">
                      Tanpa Gambar
                    </div>
                  )}
                  
                  {isUnavailable && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 backdrop-blur-[1px]">
                      <span className="px-2 py-1 sm:px-4 sm:py-2 border-2 border-red-600 text-red-600 font-black text-[8px] sm:text-xl tracking-widest rounded-lg transform -rotate-12 bg-red-50/80 shadow-lg uppercase">
                        {item.status}
                      </span>
                    </div>
                  )}

                  {/* Recommendation Badge */}
                  {!isUnavailable && isRecommended && (
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
                      <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 rounded-md sm:rounded-lg text-[7px] sm:text-[10px] uppercase font-black shadow-md bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Pilihan Terbaik</span>
                      </span>
                    </div>
                  )}

                  {/* Condition Badge */}
                  <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                    <span
                      className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 flex items-center justify-center rounded-md sm:rounded-lg text-[7px] sm:text-[10px] uppercase font-black border border-white/10 shadow-none md:shadow-md md:backdrop-blur-md ${
                        conditionLabel === "Baru"
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {conditionLabel}
                    </span>
                  </div>
                </div>

                <div className="p-2 sm:p-4 flex flex-col flex-grow bg-white">
                  <div className="text-[8px] sm:text-[10px] text-brand-600 font-bold tracking-wider uppercase mb-0.5 sm:mb-1 truncate">
                    {item.category}
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug mb-1 sm:mb-2 line-clamp-2 text-[10px] sm:text-base group-hover:text-brand-600 transition-colors h-8 sm:h-12 overflow-hidden">
                    {item.title}
                  </h3>
                  
                  <div className="mt-auto pt-1 sm:pt-3">
                    <div className="text-[11px] sm:text-xl font-black text-brand-700 mb-1 sm:mb-2 truncate">
                      {formatIDR(item.price)}
                    </div>
                    <div className="flex items-center text-[8px] sm:text-[11px] text-slate-500 gap-1 pt-1.5 sm:pt-2 border-t border-slate-100">
                      <MapPin className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-brand-500 flex-shrink-0" />
                      <span className="truncate">{item.branchName.replace("MBG Cabang ", "")}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Package className="w-12 h-12 mb-3 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak ada barang</h3>
            <p className="text-sm text-slate-500">Kategori atau pencarian yang Anda tuju sedang kosong.</p>
            <button onClick={() => {setSearchQuery(""); setActiveCategory("Semua Kategori")}} className="mt-4 px-5 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors">
              Reset Filter
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Intersection Observer Target & Loading State */}
      {hasMore && (
        <div ref={observerRef} className="col-span-full flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm border border-slate-200"
          >
            {loading ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        </div>
      )}

      {loading && !hasMore && (
        <div className="col-span-full flex justify-center py-8">
          <div className="text-slate-500 text-sm font-medium">Memuat katalog...</div>
        </div>
      )}

      {/* Modal / Drawer for Instant Product Details */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300">
          {/* Dismiss overlay */}
          <div className="absolute inset-0" onClick={closeModal}></div>
          
          <div className="bg-white w-full sm:w-[500px] md:w-[700px] h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            {/* Header/Close */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button onClick={closeModal} className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-sm backdrop-blur-sm transition-all border border-slate-200/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="overflow-y-auto flex-grow pb-24 sm:pb-6">
              
              {/* Image Carousel */}
              <div className="relative aspect-square sm:aspect-video w-full bg-slate-100">
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <>
                    <Image 
                      src={selectedItem.images[currentImageIndex]} 
                      alt={selectedItem.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain sm:object-cover"
                    />
                    {selectedItem.images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? selectedItem.images.length - 1 : prev - 1) }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-md text-slate-800 hover:bg-white"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === selectedItem.images.length - 1 ? 0 : prev + 1) }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-md text-slate-800 hover:bg-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {selectedItem.images.map((_: string, idx: number) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-brand-600' : 'w-1.5 bg-white/60'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                    <Package className="w-12 h-12 opacity-20" />
                    <span className="text-sm font-medium">Tanpa Gambar</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 sm:p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black text-white ${selectedItem.kondisi === 'Baru' ? 'bg-emerald-700' : 'bg-slate-700'}`}>
                      {selectedItem.kondisi === 'Baru' ? 'Baru' : 'Bekas'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-black bg-brand-100 text-brand-700">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {selectedItem.title}
                  </h2>
                  <div className="text-2xl sm:text-3xl font-black text-brand-700 mt-2">
                    {formatIDR(selectedItem.price)}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 gap-1.5 mt-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Tersedia di: <span className="font-semibold text-slate-700">{selectedItem.branchName}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-sm sm:prose-base max-w-none text-slate-600">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Deskripsi Produk</h3>
                  <div className="whitespace-pre-wrap">{selectedItem.description}</div>
                  
                  {selectedItem.defects && selectedItem.kondisi !== 'Baru' && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <h4 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                         Kondisi / Minus:
                      </h4>
                      <p className="text-sm text-amber-800 m-0">{selectedItem.defects}</p>
                    </div>
                  )}
                </div>

                {/* YouTube Demo */}
                {selectedItem.youtubeUrl && extractYoutubeId(selectedItem.youtubeUrl) && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-red-600" /> Video Review / Demo
                    </h3>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-md">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${extractYoutubeId(selectedItem.youtubeUrl)}`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="absolute sm:relative bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex items-center gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedItem.branchName)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 sm:py-3.5 px-4 rounded-xl font-bold transition-all text-sm sm:text-base border border-slate-200 shadow-sm hover:shadow-md"
                title="Petunjuk Lokasi"
              >
                <MapPin className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${selectedItem.whatsappNumber.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo Admin MBG ${selectedItem.branchName}, saya tertarik dengan barang ini: ${selectedItem.title} (SKU: ${selectedItem.sku})`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-grow flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 sm:py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
