import { prisma } from "./prisma";
import { PawnStatus } from "@prisma/client";

export async function checkAndTransitionExpiredContracts() {
  const now = new Date();
  try {
    await prisma.pawnContract.updateMany({
      where: {
        status: PawnStatus.AKTIF,
        endDate: {
          lt: now,
        },
      },
      data: {
        status: PawnStatus.PROSES_LELANG,
      },
    });
  } catch (error) {
    console.error("Failed to auto-transition expired contracts:", error);
  }
}
