import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const branchCounts = await prisma.salesTransaction.groupBy({
    by: ['branchName'],
    _count: { branchName: true }
  });
  console.log("Transactions per branch:");
  console.log(branchCounts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
