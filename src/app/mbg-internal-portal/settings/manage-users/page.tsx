import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import ManageUsersClient from "./ManageUsersClient";

export default async function ManageUsersPage() {
  const session = await getSession();
  
  // Strict RBAC
  if (session?.role !== "SUPERADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-red-100 shadow-sm">
        <div className="text-6xl mb-4">🛡️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500">Halaman ini hanya dapat diakses oleh Superadmin.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ManageUsersClient initialUsers={users} />;
}
