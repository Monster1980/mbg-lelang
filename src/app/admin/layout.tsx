import { getSession } from "@/lib/session";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // If no session, we are likely on the login page (enforced by middleware)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar role={session.role} userBranch={session.asal_cabang} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-y-auto">
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
