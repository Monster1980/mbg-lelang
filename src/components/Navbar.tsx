import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-gradient-gold tracking-tight">MBG</span>
            <span className="text-text-primary font-semibold hidden sm:block tracking-wide">KATALOG LELANG</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-sm font-bold text-text-primary hover:text-brand-400 transition-colors uppercase tracking-widest">Katalog</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
