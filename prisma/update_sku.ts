import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai pembaruan SKU...");
  
  // Ambil semua barang yang memiliki SKU berawalan "CAT-" (barang hasil suntikan)
  const items = await prisma.auctionItem.findMany({
    where: {
      sku: {
        startsWith: 'CAT-'
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  console.log(`Menemukan ${items.length} barang untuk diperbarui SKU-nya.`);

  let currentSku = 20000;
  let successCount = 0;
  
  // Update satu per satu
  for (const item of items) {
    try {
      await prisma.auctionItem.update({
        where: { id: item.id },
        data: { sku: currentSku.toString() }
      });
      successCount++;
    } catch (e) {
      console.error(`Gagal mengupdate item ID ${item.id} dengan SKU ${currentSku}:`, e);
    }
    currentSku++;
  }

  console.log(`Pembaruan selesai! Berhasil mengubah SKU ${successCount} barang. SKU terakhir adalah ${currentSku - 1}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
