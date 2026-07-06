import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import CatalogView from "./CatalogView";

export const revalidate = 30;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PublicHomePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const branchFilter = resolvedParams.branch as string | undefined;
  const category = resolvedParams.category as string | undefined;
  const searchQuery = resolvedParams.q as string | undefined;

  const where: any = {
    branchName: {
      contains: "Pasuruan",
      mode: "insensitive" as const,
    },
    status: Status.Tersedia,
    isMarketplaceVisible: true,
  };

  if (category && category !== "Semua Kategori") {
    where.category = category;
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.auctionItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const categories = await prisma.auctionItem.groupBy({
    by: ["category"],
    where: {
      branchName: {
        contains: "Pasuruan",
        mode: "insensitive" as const,
      },
      status: Status.Tersedia,
      isMarketplaceVisible: true,
    },
  });

  const branches = await prisma.auctionItem.groupBy({
    by: ["branchName"],
    where: {
      isMarketplaceVisible: true,
    },
  });

  // Serialize items to prevent "Only plain objects can be passed to Client Components" error
  const serializedItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="w-full pb-20">
      <CatalogView 
        items={serializedItems}
        categories={categories}
        branches={branches}
        branchFilter={branchFilter}
        initialCategory={category || "Semua Kategori"}
        initialSearchQuery={searchQuery || ""}
      />
    </div>
  );
}
