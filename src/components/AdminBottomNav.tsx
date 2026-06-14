"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanLine, PackageSearch, BarChart3 } from "lucide-react";

export default function AdminBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "POS Kasir", href: "/admin/kasir", icon: ScanLine },
    { name: "Semua Barang", href: "/admin/items", icon: PackageSearch },
    { name: "Laporan", href: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center h-16 md:hidden px-2 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        let isActive = false;
        if (tab.href === "/admin" || tab.href === "/admin/items") {
          isActive = pathname === tab.href;
        } else {
          isActive = pathname.startsWith(tab.href);
        }

        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-brand-600" : ""}`} />
            <span className={`text-[10px] font-bold ${isActive ? "text-brand-600" : ""}`}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
