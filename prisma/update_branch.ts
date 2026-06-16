import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Updating seeded items to use 'MBG Cabang Pasuruan' branch...");
  
  const result = await prisma.auctionItem.updateMany({
    where: {
      branchName: {
        in: ["Pusat", "Cabang A", "Cabang B", "Cabang C"]
      }
    },
    data: {
      branchName: "MBG Cabang Pasuruan"
    }
  });

  console.log(`Berhasil mengupdate ${result.count} barang menjadi cabang Pasuruan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
