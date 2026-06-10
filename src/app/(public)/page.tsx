import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Status } from "@prisma/client";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PublicHomePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams.category as string | undefined;
  const branchFilter = resolvedParams.branch as string | undefined;

  const where = {
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(branchFilter ? { branchName: branchFilter } : {}),
  };

  const items = await prisma.auctionItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.auctionItem.groupBy({
    by: ["category"],
  });

  const branches = await prisma.auctionItem.groupBy({
    by: ["branchName"],
  });

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-extrabold text-text-primary mb-2">
          Katalog <span className="text-gradient-brand">MBG</span>
        </h1>
        <p className="text-sm md:text-base text-text-secondary">
          Temukan barang preloved & lelang terbaik dari seluruh cabang kami.
        </p>
      </div>

      {/* Filter Pills - Mobile-friendly horizontal scroll */}
      <div className="mb-8 space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Kategori</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
              href={`/?${new URLSearchParams({ ...(branchFilter ? { branch: branchFilter } : {}) }).toString()}`}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                !categoryFilter
                  ? "gradient-brand text-white shadow-md shadow-brand-500/20"
                  : "bg-surface-elevated text-text-secondary border border-white/5 hover:text-text-primary"
              }`}
            >
              Semua Kategori
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/?${new URLSearchParams({ category: c.category, ...(branchFilter ? { branch: branchFilter } : {}) }).toString()}`}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                  categoryFilter === c.category
                    ? "gradient-brand text-white shadow-md shadow-brand-500/20"
                    : "bg-surface-elevated text-text-secondary border border-white/5 hover:text-text-primary"
                }`}
              >
                {c.category}
              </Link>
            ))}
          </div>
        </div>

        {/* Branch Filter */}
        <div>
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Lokasi Cabang</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
              href={`/?${new URLSearchParams({ ...(categoryFilter ? { category: categoryFilter } : {}) }).toString()}`}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                !branchFilter
                  ? "gradient-brand text-white shadow-md shadow-brand-500/20"
                  : "bg-surface-elevated text-text-secondary border border-white/5 hover:text-text-primary"
              }`}
            >
              Semua Cabang
            </Link>
            {branches.map((b) => (
              <Link
                key={b.branchName}
                href={`/?${new URLSearchParams({ branch: b.branchName, ...(categoryFilter ? { category: categoryFilter } : {}) }).toString()}`}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                  branchFilter === b.branchName
                    ? "gradient-brand text-white shadow-md shadow-brand-500/20"
                    : "bg-surface-elevated text-text-secondary border border-white/5 hover:text-text-primary"
                }`}
              >
                {b.branchName.replace("MBG Cabang ", "")}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          const isUnavailable = item.status === Status.Terjual || item.status === Status.Dipesan;
          
          const CardWrapper: any = isUnavailable ? 'div' : Link;
          const wrapperProps: any = isUnavailable ? {} : { href: `/katalog/${item.id}` };

          return (
            <CardWrapper
              key={item.id}
              {...wrapperProps}
              className={`glass rounded-2xl overflow-hidden flex flex-col group border relative ${
                isUnavailable ? "grayscale opacity-80 border-white/10" : "border-white/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/20 transition-all duration-300 hover:border-white/20"
              }`}
            >
              <div className="relative aspect-[4/3] w-full bg-surface-elevated overflow-hidden">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover ${!isUnavailable && "group-hover:scale-105 transition-transform duration-500"}`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                    Tanpa Gambar
                  </div>
                )}
                
                {/* Unavailable Overlay */}
                {isUnavailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
                    <span className="px-4 py-2 border-2 border-red-500 text-red-500 font-black text-xl tracking-widest rounded-lg transform -rotate-12 bg-black/40 shadow-2xl">
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

              <div className="p-4 flex flex-col flex-grow bg-surface-card/50">
                <div className="text-[10px] text-brand-400 font-bold tracking-wider uppercase mb-1">
                  {item.category}
                </div>
                <h3 className="font-semibold text-text-primary leading-snug mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-brand-300 transition-colors">
                  {item.title}
                </h3>
                
                <div className="mt-auto pt-3">
                  <div className="text-lg sm:text-xl font-black text-gradient-gold mb-2">
                    {formatIDR(item.price)}
                  </div>
                  <div className="flex items-center text-[11px] text-text-muted gap-1.5 pt-2 border-t border-white/5">
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
        })}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center glass rounded-2xl border border-white/5">
            <div className="text-4xl mb-3 opacity-50">📦</div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Tidak ada barang</h3>
            <p className="text-sm text-text-muted">Kategori atau cabang yang Anda cari sedang kosong.</p>
            <Link href="/" className="mt-4 px-5 py-2 rounded-lg bg-white/5 text-text-primary text-sm font-semibold hover:bg-white/10 transition-colors">
              Reset Filter
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
