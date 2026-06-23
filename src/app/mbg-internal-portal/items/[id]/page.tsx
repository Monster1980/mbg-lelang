import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminItemDetailClient from "./AdminItemDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminItemDetailPage({ params }: Props) {
  const { id } = await params;
  
  const item = await prisma.auctionItem.findUnique({
    where: { id: parseInt(id) },
    include: {
      physicalItem: {
        include: {
          contracts: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!item) {
    notFound();
  }

  const formatIDR = (val: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  }

  // Serialize Prisma object to plain JS object to avoid Client Component errors
  // Converts Decimal to string, Date to ISO string
  const serializedItem = JSON.parse(JSON.stringify(item));

  return (
    <AdminItemDetailClient item={serializedItem} formattedPrice={formatIDR(item.price)} />
  );
}
