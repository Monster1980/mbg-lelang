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
import { createClient } from "@/utils/supabase/client";

type Item = {
  id: number;
  sku: string;
  title: string;
  branchName: string;
  price: any;
  status: string;
  isMarketplaceVisible: boolean;
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
  const [editForm, setEditForm] = useState({ title: "", price: "", status: "" });
  const [actionLoading, setActionLoading] = useState(false);
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

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_items" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
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
        // Reset sort
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
      price: String(item.price),
      status: item.status,
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
          price: Number(editForm.price),
          status: editForm.status,
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

  const isSuperAdmin = userRole === "SUPERADMIN";

  // ──── Status Badge ────
  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
        status === "Tersedia"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : status === "Terjual"
          ? "bg-slate-700 text-white border border-slate-800"
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm text-sm font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md"
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
                {/* SKU */}
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("sku")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    SKU
                    <SortIcon field="sku" />
                  </button>
                </th>
                {/* Nama Barang */}
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("title")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Nama Barang
                    <SortIcon field="title" />
                  </button>
                </th>
                {/* Harga */}
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("price")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Harga
                    <SortIcon field="price" />
                  </button>
                </th>
                {/* Status */}
                <th className="px-6 py-4 font-semibold">
                  <button
                    onClick={() => handleSort("status")}
                    className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                {/* Aksi */}
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
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.branchName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {formatIDR(item.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Hide/Show Toggle */}
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className={`p-1.5 rounded-lg transition-all ${
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
                        href={`/admin/items/${item.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        title="Detail & Print Barcode"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                      {/* External link */}
                      <Link
                        href={`/katalog/${item.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        title="Lihat di Publik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {/* Superadmin: Edit */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit Barang"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {/* Superadmin: Delete */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
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
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  {!item.isMarketplaceVisible && (
                    <span className="shrink-0 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold bg-orange-100 text-orange-600 border border-orange-200">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  SKU: {item.sku}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.branchName}
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
              <div className="flex gap-1.5">
                {/* Hide/Show Toggle */}
                <button
                  onClick={() => handleToggleVisibility(item)}
                  className={`p-1.5 rounded-md transition-all ${
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
                  href={`/admin/items/${item.id}`}
                  className="text-slate-400 hover:text-slate-700 p-1.5 bg-slate-50 rounded-md"
                >
                  <Printer className="w-4 h-4" />
                </Link>
                <Link
                  href={`/katalog/${item.id}`}
                  target="_blank"
                  className="text-slate-400 hover:text-slate-700 p-1.5 bg-slate-50 rounded-md"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {isSuperAdmin && (
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-slate-400 hover:text-blue-600 p-1.5 bg-slate-50 rounded-md"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="text-slate-400 hover:text-red-600 p-1.5 bg-slate-50 rounded-md"
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipesan">Dipesan</option>
                  <option value="Terjual">Terjual</option>
                </select>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={actionLoading || !editForm.title.trim() || !editForm.price}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 bg-white border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
