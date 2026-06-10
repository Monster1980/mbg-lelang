import { prisma } from "@/lib/prisma";
import CatalogView from "./CatalogView";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PublicHomePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams.category as string | undefined;
  const branchFilter = resolvedParams.branch as string | undefined;

  const where = {
    ...(categoryFilter ? { category: categoryFilter } : {}),
    branchName: {
      contains: "Pasuruan",
      mode: "insensitive" as const,
    },
  };

  const items = await prisma.auctionItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.auctionItem.groupBy({
    by: ["category"],
    where: {
      branchName: {
        contains: "Pasuruan",
        mode: "insensitive" as const,
      },
    },
  });

  const branches = await prisma.auctionItem.groupBy({
    by: ["branchName"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
          Katalog <span className="text-brand-700">MBG</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Temukan barang preloved & lelang terbaik dari seluruh cabang kami.
        </p>
      </div>

      {/* Catalog View (Client Component) */}
      <CatalogView 
        items={items}
        categories={categories}
        branches={branches}
        categoryFilter={categoryFilter}
        branchFilter={branchFilter}
      />
    </div>
  );
}
