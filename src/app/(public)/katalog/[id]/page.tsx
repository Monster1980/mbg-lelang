import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageSlider from "./ImageSlider";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DetailPage({ params }: Props) {
  const { id } = await params;

  const item = await prisma.auctionItem.findUnique({
    where: { id: parseInt(id) },
  });

  if (!item) {
    notFound();
  }

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const isUnavailable = item.status === "Terjual" || item.status === "Dipesan";

  const waMessage = `Halo Admin ${
    item.branchName
  }, saya tertarik dengan barang ini:%0A%0A*${
    item.title
  }*%0ASKU: ${item.sku}%0AHarga: ${formatIDR(
    item.price
  )}%0A%0AApakah masih bisa dilihat?`;
  const waLink = `https://wa.me/${item.whatsappNumber}?text=${waMessage}`;

  return (
    <div className="pb-28 sm:pb-12 bg-surface-primary min-h-screen">
      {/* Mobile-friendly Breadcrumbs */}
      <div className="px-4 py-4 max-w-5xl mx-auto flex items-center gap-2 text-[11px] font-medium text-text-muted overflow-x-auto scrollbar-hide whitespace-nowrap">
        <Link href="/" className="hover:text-brand-400 uppercase tracking-wider">Katalog</Link>
        <span className="opacity-40">/</span>
        <span className="uppercase tracking-wider">{item.category}</span>
        <span className="opacity-40">/</span>
        <span className="text-text-secondary truncate">{item.title}</span>
      </div>

      <div className="max-w-5xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-0 sm:gap-8 lg:gap-12">
          {/* Image Slider Component */}
          <div className="w-full">
            <ImageSlider images={item.images} isUnavailable={isUnavailable} status={item.status} />
          </div>

          {/* Details */}
          <div className="px-5 sm:px-0 py-6 sm:py-2">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-widest rounded border ${
                    item.grade === "A" ? "border-green-500/50 text-green-400 bg-green-500/10" :
                    item.grade === "B" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
                    "border-red-500/50 text-red-400 bg-red-500/10"
                }`}>
                  Grade {item.grade}
                </span>
                <span className="text-[11px] text-text-muted font-mono">{item.sku}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
                {item.title}
              </h1>
              
              <div className="text-3xl font-black text-gradient-gold mt-4 mb-2">
                {formatIDR(item.price)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-2xl mb-8 border border-white/5">
              <div>
                <span className="text-text-muted block text-[11px] uppercase tracking-wider font-bold mb-1">Kategori</span>
                <span className="font-semibold text-white">{item.category}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px] uppercase tracking-wider font-bold mb-1">Lokasi</span>
                <span className="font-semibold text-white">{item.branchName.replace("MBG Cabang ", "")}</span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Deskripsi</h3>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {item.defects && (
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30">
                  <h3 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Catatan Minus / Defect
                  </h3>
                  <p className="text-red-200/90 text-sm leading-relaxed">
                    {item.defects}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Button for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 w-full glass-strong border-t border-white/10 p-4 sm:p-6 z-50 transform translate-y-0 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-1">Tertarik?</div>
            <div className="font-bold text-white">{isUnavailable ? 'Barang tidak tersedia' : 'Tanya ketersediaan ke staf'}</div>
          </div>
          <a
            href={isUnavailable ? '#' : waLink}
            target={isUnavailable ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className={`flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all text-sm sm:text-base ${
              isUnavailable 
              ? "bg-white/10 text-text-muted cursor-not-allowed pointer-events-none" 
              : "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 hover:scale-[1.02]"
            }`}
          >
            {!isUnavailable && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            )}
            {isUnavailable ? `Barang ${item.status}` : 'Tanya Admin via WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  );
}
