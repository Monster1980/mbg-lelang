"use client";

import { Printer, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import PrintLabelEppos from '@/components/PrintLabelEppos';

export default function AdminItemDetailClient({ item, formattedPrice }: { item: any, formattedPrice: string }) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {/* Hide this top bar during printing */}
      <div className="flex justify-between items-center mb-8 print:hidden relative z-10">
        <Link href="/admin/items" className="flex items-center gap-2 text-text-muted hover:text-brand-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Daftar
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 font-medium"
        >
          <Printer className="w-5 h-5" />
          Print Barcode
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Info Card (hidden in print) */}
        <div className="md:col-span-2 space-y-6 print:hidden">
          <div className="glass rounded-3xl p-8 border border-white/10 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">{item.title}</h1>
                <p className="text-text-secondary text-sm">{item.branchName} • {item.category}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gradient-gold">{formattedPrice}</div>
                <div className={`mt-2 inline-flex px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                    item.status === 'Tersedia' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'Dipesan' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-surface-elevated p-4 rounded-xl mb-6 border border-white/5">
              <div><span className="text-text-muted block mb-1">Status Kondisi</span><span className="font-bold text-text-primary">{item.kondisi === 'Baru' ? '✨ Baru' : '♻️ Bekas'}</span></div>
              <div><span className="text-text-muted block mb-1">WhatsApp CS</span><span className="font-medium text-text-primary">{item.whatsappNumber}</span></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-muted mb-2">Deskripsi:</h4>
              <p className="text-text-secondary text-sm whitespace-pre-line leading-relaxed">{item.description}</p>
            </div>
            
            {item.defects && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Catatan Minus / Defect:</h4>
                <p className="text-red-200/80 text-sm">{item.defects}</p>
              </div>
            )}
          </div>
          
          <div className="glass rounded-3xl p-6 border border-white/10 relative z-10">
            <h4 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Galeri Gambar
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {item.images.map((img: string, i: number) => (
                <div key={i} className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-surface-elevated border border-white/10 shadow-inner">
                  <img src={img} alt={`Img ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {item.images.length === 0 && <span className="text-sm text-text-muted">Tidak ada gambar</span>}
            </div>
          </div>
        </div>

        {/* Print Area - Barcode Label */}
        <div className="md:col-span-1">
          <PrintLabelEppos 
            branchName={item.branchName}
            title={item.title}
            category={item.category}
            kondisi={item.kondisi}
            sku={item.sku}
            sellingPrice={item.price}
          />
        </div>

      </div>
    </div>
  );
}
