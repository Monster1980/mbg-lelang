"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Printer,
  PackageSearch,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  EyeOff,
  Eye,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";

type Item = {
  id: number;
  sku: string;
  title: string;
  branchName: string;
  price: any;
  status: string;
  isMarketplaceVisible: boolean;
  hasWarranty?: boolean;
};

type SortField = "sku" | "title" | "price" | "status" | null;
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export default function ItemsTableClient({ items }: { items: Item[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", status: "", hasWarranty: false });
  const [actionLoading, setActionLoading] = useState(false);
  const [returnConfirm, setReturnConfirm] = useState<{
    isOpen: boolean;
    itemId: number | null;
    itemSku: string | null;
    itemName: string | null;
  }>({
    isOpen: false,
    itemId: null,
    itemSku: null,
    itemName: null,
  });
  const router = useRouter();

  // Fetch user role on mount for RBAC
  useEffect(() => {
    fetch("/api/admin/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserRole(data.data.role);
        }
      })
      .catch(() => {});
  }, []);

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  // Format a raw number string into Indonesian dot-separated thousands (e.g. "8000000" → "8.000.000")
  const formatRupiahMask = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("id-ID").format(Number(digits));
  };

  // Strip dots from masked string back to raw number (e.g. "8.000.000" → 8000000)
  const parseRupiahMask = (value: string): number => {
    return Number(value.replace(/\./g, "")) || 0;
  };

  const formatBranchName = (name: string) => {
    if (name && name.toLowerCase().includes("pasuruan")) {
      return "Cabang Pasuruan - Sangar";
    }
    return name;
  };

  // 1. Filter by search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.sku.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery]);

  // 2. Sort
  const sortedItems = useMemo(() => {
    if (!sortField) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "sku":
          cmp = Number(a.sku) - Number(b.sku);
          if (isNaN(cmp)) cmp = a.sku.localeCompare(b.sku);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title, "id");
          break;
        case "price":
          cmp = Number(a.price) - Number(b.price);
          break;
        case "status": {
          const statusOrder: Record<string, number> = {
            Terjual: 0,
            Dipesan: 1,
            Tersedia: 2,
            RETUR: 3,
          };
          cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
          break;
        }
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredItems, sortField, sortDirection]);

  // 3. Paginate
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  // Reset page on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection]);

  // Sort toggle handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort icon renderer
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  // ──── Action Handlers ────

  const handleToggleVisibility = async (item: Item) => {
    try {
      const res = await fetch(`/api/admin/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isMarketplaceVisible: !item.isMarketplaceVisible,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle visibility failed:", err);
    }
  };

  const openEditModal = (item: Item) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title,
      price: formatRupiahMask(String(item.price)),
      status: item.status,
      hasWarranty: !!item.hasWarranty,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          price: parseRupiahMask(editForm.price),
          status: editForm.status,
          hasWarranty: editForm.hasWarranty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        setSelectedItem(null);
        router.refresh();
      } else {
        alert(data.message || "Gagal memperbarui barang.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (item: Item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${selectedItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalOpen(false);
        setSelectedItem(null);
        router.refresh();
      } else {
        alert(data.message || "Gagal menghapus barang.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  // Return Action Bridge
  const handleReturnItem = async (itemId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RETUR",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Barang berhasil diretur and kini tersedia kembali untuk dijual.");
        router.refresh();
      } else {
        alert(data.message || "Gagal memproses retur.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const isSuperAdmin = userRole === "SUPERADMIN";

  // ──── Status Badge ────
  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
        status === "Tersedia"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : status === "Terjual"
          ? "bg-slate-700 text-white border border-slate-800"
          : status === "RETUR"
          ? "bg-rose-50 text-rose-700 border border-rose-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {status}
    </span>
  );

  // ──── Pagination Controls ────
  const PaginationBar = () => {
    if (sortedItems.length <= ITEMS_PER_PAGE) return null;
    return (
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-500 font-medium">
          Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari{" "}
          <span className="text-slate-900 font-bold">{totalPages}</span>
          <span className="hidden sm:inline text-slate-400 ml-2">
            ({sortedItems.length} barang)
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] justify-center"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari SKU atau Nama Barang..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm text-sm font-medium min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md min-h-[32px]"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results count when searching */}
      {searchQuery.trim() && (
        <p className="text-xs text-slate-500 font-medium px-1">
          Menampilkan {filteredItems.length} dari {items.length} barang
        </p>
      )}

      {/* ═══════════ Desktop Table ═══════════ */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("sku")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    SKU
                    <SortIcon field="sku" />
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("title")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Nama Barang
                    <SortIcon field="title" />
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("price")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Harga
                    <SortIcon field="price" />
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("status")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-blue-50/50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  } ${!item.isMarketplaceVisible ? "opacity-50" : ""}`}
                >
                  <td className="px-6 py-4 font-mono text-slate-900 font-bold">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="max-w-[220px] truncate" title={item.title}>
                        {item.title}
                      </div>
                      {!item.isMarketplaceVisible && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-orange-100 text-orange-600 border border-orange-200">
                          Hidden
                        </span>
                      )}
                      {item.hasWarranty && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-blue-100 text-blue-600 border border-blue-200">
                          🛡️ Garansi
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatBranchName(item.branchName)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {formatIDR(item.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 items-center">
                      {/* Hide/Show Toggle */}
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className={`p-1.5 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          item.isMarketplaceVisible
                            ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                            : "text-orange-500 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          item.isMarketplaceVisible
                            ? "Sembunyikan dari Marketplace"
                            : "Tampilkan di Marketplace"
                        }
                      >
                        {item.isMarketplaceVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {/* Print */}
                      <Link
                        href={`/mbg-internal-portal/items/${item.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Detail & Print Barcode"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                      {/* External link */}
                      <Link
                        href={`/katalog/${item.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Lihat di Publik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {/* Superadmin: Retur (only for Terjual) */}
                      {isSuperAdmin && item.status === "Terjual" && (
                        <button
                          onClick={() => setReturnConfirm({ isOpen: true, itemId: item.id, itemSku: item.sku, itemName: item.title })}
                          className="p-1.5 rounded-lg text-orange-500 hover:text-orange-700 hover:bg-orange-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Proses Retur Barang"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-6a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m1-3h8a4 4 0 014 4v6m-9 5h.01M12 12h.01" />
                          </svg>
                        </button>
                      )}
                      {/* Superadmin: Edit */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Edit Barang"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {/* Superadmin: Delete */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 bg-white"
                  >
                    <div className="flex flex-col items-center">
                      <PackageSearch className="w-12 h-12 mb-3 opacity-20" />
                      {searchQuery.trim()
                        ? `Tidak ada barang dengan SKU atau nama "${searchQuery}".`
                        : "Belum ada barang terdaftar."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ Mobile Card List ═══════════ */}
      <div className="block md:hidden space-y-3">
        {paginatedItems.map((item, idx) => (
          <div
            key={item.id}
            className={`border border-gray-150 rounded-xl p-4 shadow-none flex flex-col gap-3 content-visibility-card ${
              idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
            } ${!item.isMarketplaceVisible ? "opacity-50" : ""}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  {!item.isMarketplaceVisible && (
                    <span className="shrink-0 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold bg-orange-100 text-orange-600 border border-orange-200">
                      Hidden
                    </span>
                  )}
                  {item.hasWarranty && (
                    <span className="shrink-0 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold bg-blue-100 text-blue-600 border border-blue-200">
                      🛡️ Garansi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  SKU: {item.sku}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatBranchName(item.branchName)}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">
                  {formatIDR(item.price)}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <StatusBadge status={item.status} />
              <div className="flex gap-1.5 items-center">
                {/* Hide/Show Toggle */}
                <button
                  onClick={() => handleToggleVisibility(item)}
                  className={`p-1.5 rounded-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    item.isMarketplaceVisible
                      ? "text-slate-400 hover:text-orange-600 bg-slate-50"
                      : "text-orange-500 hover:text-emerald-600 bg-orange-50"
                  }`}
                >
                  {item.isMarketplaceVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <Link
                  href={`/mbg-internal-portal/items/${item.id}`}
                  className="text-slate-400 hover:text-slate-700 p-1.5 bg-slate-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Printer className="w-4 h-4" />
                </Link>
                <Link
                  href={`/katalog/${item.id}`}
                  target="_blank"
                  className="text-slate-400 hover:text-slate-700 p-1.5 bg-slate-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {/* Superadmin: Retur (only for Terjual) */}
                {isSuperAdmin && item.status === "Terjual" && (
                  <button
                    onClick={() => setReturnConfirm({ isOpen: true, itemId: item.id, itemSku: item.sku, itemName: item.title })}
                    className="text-orange-500 hover:text-orange-700 p-1.5 bg-orange-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Proses Retur Barang"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-6a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m1-3h8a4 4 0 014 4v6m-9 5h.01M12 12h.01" />
                    </svg>
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-slate-400 hover:text-blue-600 p-1.5 bg-slate-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="text-slate-400 hover:text-red-600 p-1.5 bg-slate-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {paginatedItems.length === 0 && (
          <div className="py-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            <PackageSearch className="w-10 h-10 mb-2 opacity-20 mx-auto" />
            <p className="text-sm">
              {searchQuery.trim()
                ? `Tidak ada barang.`
                : "Belum ada barang."}
            </p>
          </div>
        )}
      </div>

      {/* ═══════════ Pagination ═══════════ */}
      <PaginationBar />

      {/* ═══════════ EDIT MODAL ═══════════ */}
      {editModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !actionLoading && setEditModalOpen(false)}
          />
          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Barang
                </h3>
              </div>
              <button
                onClick={() => !actionLoading && setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono">
                SKU: {selectedItem.sku}
              </div>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 min-h-[44px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Harga (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, price: formatRupiahMask(e.target.value) }))
                  }
                  placeholder="0"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 min-h-[44px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 min-h-[44px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipesan">Dipesan</option>
                  <option value="Terjual">Terjual</option>
                </select>
              </div>
              {/* Warranty */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editHasWarranty"
                  checked={editForm.hasWarranty}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, hasWarranty: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editHasWarranty" className="text-sm font-semibold text-slate-700">
                  🛡️ Memiliki Garansi Resmi MBG
                </label>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={actionLoading || !editForm.title.trim() || !editForm.price}
                className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DELETE MODAL ═══════════ */}
      {deleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !actionLoading && setDeleteModalOpen(false)}
          />
          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-red-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hapus Barang?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Anda akan menghapus barang ini secara permanen:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3 text-left">
                <p className="text-sm font-bold text-red-900">
                  {selectedItem.title}
                </p>
                <p className="text-xs text-red-600 font-mono mt-1">
                  SKU: {selectedItem.sku}
                </p>
              </div>
              <p className="text-xs text-red-500 mt-3 font-medium">
                Aksi ini tidak dapat dibatalkan.
              </p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-red-100 bg-red-50/30 rounded-b-2xl">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 bg-white border border-slate-200 flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {actionLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ RETURN CONFIRMATION MODAL ═══════════ */}
      {returnConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Proses Retur</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin memproses retur untuk barang <span className="font-semibold text-slate-900">&quot;{returnConfirm.itemName}&quot;</span>? Aksi ini akan mengurangi total pendapatan berjalan.
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReturnConfirm({ isOpen: false, itemId: null, itemSku: null, itemName: null })}
                className="w-full py-2.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all min-h-[44px] flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={async () => {
                  if (returnConfirm.itemId !== null) {
                    await handleReturnItem(returnConfirm.itemId);
                  }
                  setReturnConfirm({ isOpen: false, itemId: null, itemSku: null, itemName: null });
                }}
                className="w-full py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all min-h-[44px] flex items-center justify-center disabled:opacity-50"
              >
                Oke, Proses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
