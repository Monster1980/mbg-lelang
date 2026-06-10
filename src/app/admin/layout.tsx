"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackageSearch, PlusCircle, LogOut, ScanLine, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "POS Kasir", href: "/admin/kasir", icon: ScanLine },
    { name: "Semua Barang", href: "/admin/items", icon: PackageSearch },
    { name: "Tambah Barang", href: "/admin/items/new", icon: PlusCircle },
    { name: "Laporan", href: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-surface-primary flex">
      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-white/10 flex flex-col fixed inset-y-0 z-10 bg-surface-primary/50">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-black text-gradient-gold tracking-tight">MBG Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            let isItemActive = false;
            if (item.href === "/admin") {
              isItemActive = pathname === "/admin";
            } else {
              isItemActive = pathname.startsWith(item.href);
            }

            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isItemActive 
                    ? "bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30 shadow-inner" 
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <Icon className={`w-5 h-5 ${isItemActive ? "text-brand-400" : "text-text-muted"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-y-auto">
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
