import { prisma } from "@/lib/prisma";
import ReportClient from "./ReportClient";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const branchFilter = resolvedParams.branch;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;

  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter = {
      transactionDate: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) } : {}),
      }
    };
  }

  const where = {
    ...(branchFilter ? { branchName: branchFilter } : {}),
    ...dateFilter
  };

  const transactions = await prisma.salesTransaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    include: {
      item: { select: { title: true, category: true } }
    }
  });

  const branches = await prisma.salesTransaction.groupBy({
    by: ["branchName"],
  });

  const branchList = branches.map(b => b.branchName);

  // Serialize objects to avoid Client Component errors with Decimal and Date
  const serializedTransactions = JSON.parse(JSON.stringify(transactions));

  return (
    <ReportClient 
      initialTransactions={serializedTransactions} 
      branchList={branchList} 
      currentBranch={branchFilter || ""}
      currentStart={startDate || ""}
      currentEnd={endDate || ""}
    />
  );
}
