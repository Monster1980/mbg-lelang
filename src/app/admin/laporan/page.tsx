import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LaporanClient from "./LaporanClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLaporanPage() {
  const session = await getSession();
  if (!session) {
    redirect("/mbg-internal-portal/login");
  }

  const items = await prisma.auctionItem.findMany({
    orderBy: { id: "asc" },
  });

  const serializedItems = items.map((item) => ({
    id: item.id,
    sku: item.sku,
    title: item.title,
    branchName: item.branchName,
    price: Number(item.price),
    status: item.status,
    nomorInduk: item.nomorInduk,
    parentId: item.parentId,
    variantImageUrl: item.variantImageUrl,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <LaporanClient items={serializedItems} cashierName={session.nama_lengkap} />
    </div>
  );
}
