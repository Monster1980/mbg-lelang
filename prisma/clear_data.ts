const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all warehouse and catalog data...');

  // Delete in correct order to respect foreign key constraints
  await prisma.salesTransaction.deleteMany();
  await prisma.auctionItem.deleteMany();
  await prisma.pawnContract.deleteMany();
  await prisma.physicalItem.deleteMany();

  console.log('All item and warehouse data has been completely cleared!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
