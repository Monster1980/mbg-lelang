export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-primary py-10 mt-auto relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="mb-6 flex justify-center">
          <span className="text-xl font-black text-gradient-gold tracking-tight">MBG</span>
        </div>
        <p className="mb-2 font-semibold text-text-primary">PT Mitra Bisnis Gadai</p>
        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">Platform O2O (Online-to-Offline) Katalog Barang Bekas & Lelang. Telusuri online, transaksikan dengan aman di cabang kami.</p>
        
        <div className="pt-6 border-t border-white/10 text-xs text-text-muted flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} PT MBG. Hak cipta dilindungi.</span>
          <span className="hidden sm:block">•</span>
          <a href="#" className="hover:text-text-secondary transition-colors">Syarat & Ketentuan</a>
          <span className="hidden sm:block">•</span>
          <a href="#" className="hover:text-text-secondary transition-colors">Kebijakan Privasi</a>
        </div>
      </div>
    </footer>
  );
}
