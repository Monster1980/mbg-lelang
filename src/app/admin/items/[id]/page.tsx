import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminItemDetailClient from "./AdminItemDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminItemDetailPage({ params }: Props) {
  const { id } = await params;
  
  const item = await prisma.auctionItem.findUnique({
    where: { id: parseInt(id) }
  });

  if (!item) {
    notFound();
  }

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  }

  return (
    <AdminItemDetailClient item={item} formattedPrice={formatIDR(item.price)} />
  );
}
