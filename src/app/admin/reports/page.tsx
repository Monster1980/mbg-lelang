export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ReportClient from "./ReportClient";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const resolvedParams = await searchParams;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;
  const branchFilter = resolvedParams.branch;

  const isSuperAdmin = session.role === "SUPERADMIN";

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    };
  }

  // Enforce branch security lock: Superadmin can query any/all branches, regular admins are locked
  let branchNameFilter = undefined;
  if (!isSuperAdmin) {
    branchNameFilter = session.asal_cabang;
  } else if (branchFilter && branchFilter !== "all") {
    branchNameFilter = branchFilter;
  }

  const where = {
    ...(branchNameFilter ? { branchName: branchNameFilter } : {}),
    ...dateFilter
  };

  // Parallelize database queries to significantly reduce latency
  const [transactions, branchGroup] = await Promise.all([
    prisma.salesTransaction.findMany({
      where,
      orderBy: { transactionDate: "desc" },
      include: {
        item: { select: { title: true, category: true } }
      }
    }),
    isSuperAdmin ? prisma.salesTransaction.groupBy({
      by: ["branchName"],
    }) : Promise.resolve(null)
  ]);

  // Get list of branches
  let branchList: string[] = [];
  if (isSuperAdmin && branchGroup) {
    branchList = branchGroup.map(b => b.branchName);
  } else {
    branchList = [session.asal_cabang];
  }

  const currentBranch = isSuperAdmin ? (branchFilter || "all") : session.asal_cabang;

  // Serialize objects to avoid Client Component errors with Decimal and Date
  const serializedTransactions = JSON.parse(JSON.stringify(transactions));

  return (
    <ReportClient 
      initialTransactions={serializedTransactions} 
      branchList={branchList} 
      currentBranch={currentBranch}
      currentStart={startDate || ""}
      currentEnd={endDate || ""}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
