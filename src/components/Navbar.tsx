"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
      isHome 
        ? "bg-[#1e3a8a] border-b border-blue-850/40 text-white" 
        : "bg-white border-b border-slate-200 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className={`transition-all ${isHome ? "bg-white px-4 py-2 rounded-xl shadow-md border border-slate-100/10" : ""}`}>
              <Image 
                src="/lelang/logo.png" 
                alt="MBG Logo" 
                width={180} 
                height={70} 
                className="w-auto h-10 sm:h-12 object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
