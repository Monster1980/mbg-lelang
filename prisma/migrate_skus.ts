import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getNumericSku(sku: string, category: string): string {
  if (/^\d+$/.test(sku)) return sku;

  const upperSku = sku.toUpperCase();
  let prefix = "";
  if (upperSku.includes("ELC") || category.toLowerCase().includes("elektronik")) prefix = "1";
  else if (upperSku.includes("FAS") || category.toLowerCase().includes("fashion")) prefix = "2";
  else if (upperSku.includes("JWL") || category.toLowerCase().includes("perhiasan")) prefix = "3";
  else if (upperSku.includes("WTC") || category.toLowerCase().includes("jam")) prefix = "4";
  else if (upperSku.includes("OTO") || category.toLowerCase().includes("otomotif")) prefix = "5";
  else if (upperSku.includes("FRN") || category.toLowerCase().includes("furniture")) prefix = "6";
  else if (upperSku.includes("MSC") || category.toLowerCase().includes("musik")) prefix = "7";
  else if (upperSku.includes("KLK") || category.toLowerCase().includes("koleksi")) prefix = "8";
  else prefix = "9";

  const digits = sku.replace(/\D/g, "");
  return prefix + (digits || "0");
}

async function main() {
  console.log("Starting SKU migration...");

  const items = await prisma.auctionItem.findMany({
    orderBy: { id: "asc" },
  });

  const usedSkus = new Set<string>();

  for (const item of items) {
    let targetSku = getNumericSku(item.sku, item.category);

    // If there is still a collision (should not happen with our mapping but let's be robust)
    let counter = 1;
    let finalSku = targetSku;
    while (usedSkus.has(finalSku)) {
      finalSku = `${targetSku}${counter}`;
      counter++;
    }

    usedSkus.add(finalSku);

    if (item.sku !== finalSku) {
      console.log(`Migrating item ID ${item.id}: "${item.sku}" -> "${finalSku}"`);

      // Update the AuctionItem
      await prisma.auctionItem.update({
        where: { id: item.id },
        data: { sku: finalSku },
      });

      // Update associated SalesTransactions
      const updateTxResult = await prisma.salesTransaction.updateMany({
        where: { itemId: item.id },
        data: { sku: finalSku },
      });

      if (updateTxResult.count > 0) {
        console.log(`  Updated ${updateTxResult.count} sales transactions for item ID ${item.id}`);
      }
    } else {
      console.log(`Item ID ${item.id}: "${item.sku}" is already numeric and unique.`);
    }
  }

  console.log("SKU migration completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
