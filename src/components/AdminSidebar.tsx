"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackageSearch, PlusCircle, LogOut, ScanLine, BarChart3, Users } from "lucide-react";
import { Role } from "@prisma/client";

export default function AdminSidebar({ role, userBranch }: { role: Role, userBranch: string }) {
  const pathname = usePathname();
  const router = useRouter();

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

  if (role === "SUPERADMIN") {
    menuItems.push({ name: "Kelola Pengguna", href: "/admin/settings/manage-users", icon: Users });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-10">
      <div className="h-16 flex flex-col justify-center px-6 border-b border-slate-200">
        <span className="text-xl font-black text-brand-700 tracking-tight leading-none">MBG Admin</span>
        <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">{userBranch}</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          let isItemActive = false;
          if (item.href === "/admin" || item.href === "/admin/items") {
            isItemActive = pathname === item.href;
          } else {
            isItemActive = pathname.startsWith(item.href);
          }

          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isItemActive 
                  ? "bg-brand-600 text-white font-semibold shadow-md shadow-brand-500/20" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isItemActive ? "text-white" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex flex-col gap-1 mb-4 px-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Akses</span>
          <span className="text-sm font-semibold text-slate-700">{role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
