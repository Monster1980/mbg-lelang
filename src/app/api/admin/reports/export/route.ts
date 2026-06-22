import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ExcelJS from "exceljs";

function parseWibStartOfDay(dateStr: string): Date {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const date = new Date(Date.UTC(year, month, day, 0, 0, 0));
  date.setUTCHours(date.getUTCHours() - 7);
  return date;
}

function parseWibEndOfDay(dateStr: string): Date {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const date = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  date.setUTCHours(date.getUTCHours() - 7);
  return date;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const branchParam = searchParams.get("branch");

    const isSuperAdmin = session.role === "SUPERADMIN";

    // Enforce locked branch security on query
    let branchNameFilter = undefined;
    let exportBranchName = "";

    if (!isSuperAdmin) {
      branchNameFilter = session.asal_cabang;
      exportBranchName = session.asal_cabang;
    } else {
      if (branchParam && branchParam !== "all") {
        branchNameFilter = branchParam;
        exportBranchName = branchParam;
      } else {
        exportBranchName = "Semua_Cabang";
      }
    }

    let dateFilter = {};
    if (startParam && endParam && startParam !== "null" && endParam !== "null") {
      const start = parseWibStartOfDay(startParam);
      const end = parseWibEndOfDay(endParam);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateFilter = {
          transactionDate: {
            gte: start,
            lte: end,
          },
        };
      }
    }

    const where = {
      ...(branchNameFilter ? { branchName: branchNameFilter } : {}),
      ...dateFilter,
    };

    // Query sales transactions from database
    const transactions = await prisma.salesTransaction.findMany({
      where,
      orderBy: { transactionDate: "desc" },
      include: {
        item: { select: { title: true, category: true } },
      },
    });

    // Create ExcelJS workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Penjualan");

    // Map exact columns
    worksheet.columns = [
      { header: "ID Transaksi", key: "id", width: 15 },
      { header: "Waktu Transaksi", key: "waktu", width: 25 },
      { header: "SKU", key: "sku", width: 15 },
      { header: "Nama Barang", key: "namaBarang", width: 30 },
      { header: "Kategori", key: "kategori", width: 15 },
      { header: "Cabang", key: "cabang", width: 20 },
      { header: "Kasir", key: "kasir", width: 20 },
      { header: "Harga Terjual", key: "hargaTerjual", width: 20 },
    ];

    // Style the Header Row cells: Bright Yellow fill (#FFFF00) and bold text
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "000000" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "CCCCCC" } },
        bottom: { style: "thin", color: { argb: "CCCCCC" } },
        left: { style: "thin", color: { argb: "CCCCCC" } },
        right: { style: "thin", color: { argb: "CCCCCC" } },
      };
    });

    // Populate data rows
    transactions.forEach((tx) => {
      worksheet.addRow({
        id: `TX-${String(tx.id).padStart(5, "0")}`,
        waktu: new Date(tx.transactionDate).toLocaleString("id-ID"),
        sku: tx.sku,
        namaBarang: tx.item?.title || "Item Terhapus",
        kategori: tx.item?.category || "Lainnya",
        cabang: tx.branchName,
        kasir: tx.cashierName,
        hargaTerjual: Number(tx.soldPrice),
      });
    });

    // Format the number format for "Harga Terjual" column (column 8)
    worksheet.getColumn(8).numFmt = '#,##0';

    // Calculate sum of Harga Terjual
    const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.soldPrice), 0);

    // Append a dedicated Summary Row at the bottom
    const summaryRow = worksheet.addRow({
      kasir: "Total",
      hargaTerjual: totalRevenue,
    });

    // Style summary row to be bold
    summaryRow.getCell("kasir").font = { bold: true };
    summaryRow.getCell("hargaTerjual").font = { bold: true };
    summaryRow.getCell("hargaTerjual").numFmt = '#,##0';

    // Compile workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const sanitizedBranch = exportBranchName.replace(/\s+/g, "_");
    const todayStr = new Date().toISOString().split("T")[0];

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Laporan_MBG_${sanitizedBranch}_${todayStr}.xlsx`,
      },
    });

  } catch (error: any) {
    console.error("Failed to generate excel export:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat ekspor excel." },
      { status: 500 }
    );
  }
}
