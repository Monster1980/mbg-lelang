import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 w-full border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image 
              src="/lelang/logo.png" 
              alt="MBG Logo" 
              width={200} 
              height={80} 
              className="w-auto h-14 sm:h-16 object-contain"
              priority
            />
          </Link>
          <div className="flex-1 flex justify-end">
            <Suspense fallback={<div className="flex-1 max-w-md h-9 bg-slate-100 rounded-full animate-pulse"></div>}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}
