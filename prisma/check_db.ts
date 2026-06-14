import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB SKUs...");
  const items = await prisma.auctionItem.findMany({
    select: {
      id: true,
      sku: true,
    },
    orderBy: { id: "asc" },
  });
  console.log("Current Items in DB:");
  items.forEach((item) => {
    const numericOnly = item.sku.replace(/\D/g, "");
    console.log(`ID: ${item.id} | SKU: ${item.sku} | Numeric version: ${numericOnly}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
