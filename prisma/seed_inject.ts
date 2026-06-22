import { PrismaClient, Kondisi, Role, Status, PawnStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  await prisma.salesTransaction.deleteMany();
  await prisma.auctionItem.deleteMany();
  await prisma.pawnContract.deleteMany();
  await prisma.physicalItem.deleteMany();
  
  // Ensure the default superadmin user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "superadmin@mbg.com" }
  });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: "superadmin@mbg.com",
        password: "admin123",
        nama_lengkap: "Super Admin",
        asal_cabang: "Pusat",
        role: Role.SUPERADMIN,
      }
    });
    console.log("Superadmin user created.");
  }

  // Create another admin user just in case
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@mbg.com" }
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@mbg.com",
        password: "admin123",
        nama_lengkap: "Admin Cabang",
        asal_cabang: "MBG Cabang Pasuruan",
        role: Role.ADMIN,
      }
    });
    console.log("Admin user created.");
  }

  console.log("Generating 50 random physical items, pawn contracts, auction items, and transactions...");

  const categories = ["Elektronik", "Fashion", "Perhiasan", "Jam Tangan", "Otomotif", "Furniture", "Alat Musik", "Koleksi"];
  const branches = ["MBG Cabang Pasuruan", "MBG Cabang Malang", "MBG Cabang Surabaya", "Cabang Pusat"];
  const cashiers = ["Ahmad Fauzi", "Rina Wijaya", "Budi Santoso", "Siti Aminah", "Lutfi Hakim"];
  const buyers = ["Joko Susilo", "Hendra Wijaya", "Santi Rahayu", "Megawati", "Bambang Yudhoyono", "Anies Baswedan", "Prabowo Subianto"];
  const paymentMethods = ["Cash", "Transfer", "Debit Card", "QRIS"];

  const itemTemplates: { [key: string]: string[] } = {
    Elektronik: ["iPhone 14 Pro", "Samsung S23 Ultra", "MacBook Pro M2", "Sony Headphones WH-1000XM4", "Xiaomi Redmi Note 12", "Asus ROG Ally"],
    Fashion: ["Tas Gucci Marmont", "Jaket Kulit Levi's", "Sepatu Adidas Yeezy", "Kacamata Ray-Ban Wayfarer", "Dompet Hermes", "Jam Rolex Submariner pre-owned"],
    Perhiasan: ["Kalung Emas 24K 10g", "Gelang Berlian Cantik", "Anting Emas Putih 18K", "Cincin Kawin Platinum", "Liontin Perak 925"],
    "Jam Tangan": ["Seiko Alpinist", "Omega Speedmaster", "Tissot Le Locle", "Casio G-Shock Mudmaster", "Fossil Chronograph"],
    Otomotif: ["Helm Arai RX-7V", "Knalpot Akrapovic Ninja 250", "Jaket Riding Alpinestars", "Ban Pirelli Diablo Rosso III"],
    Furniture: ["Meja Kerja Jati Minimalis", "Kursi Gaming Secretlab", "Lampu Hias Nordik", "Rak Buku Kayu Oak"],
    "Alat Musik": ["Keyboard Yamaha PSR-F52", "Biola Kastil 4/4", "Gitar Akustik Taylor GS Mini", "Ukulele Lanikai"],
    Koleksi: ["Kamera Analog Canon AE-1", "Piringan Hitam The Beatles", "Uang Kuno Rp 10.000 Seri Wayang", "Action Figure Hot Toys Iron Man"]
  };

  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const randomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  for (let i = 1; i <= 50; i++) {
    const sku = String(10000 + i);
    const category = randomChoice(categories);
    const titleTemplate = randomChoice(itemTemplates[category] || ["Barang Gadai Kategori " + category]);
    const title = `${titleTemplate} #${i}`;
    const branchName = randomChoice(branches);
    
    const appraisalValue = Math.floor(500000 + Math.random() * 49500000);
    const price = Math.floor(appraisalValue * (1.2 + Math.random() * 0.3));

    const createdDate = randomDate(sixMonthsAgo, now);
    const startDate = new Date(createdDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);
    
    const pawnStatus = randomChoice([
      PawnStatus.AKTIF,
      PawnStatus.PERPANJANG,
      PawnStatus.LUNAS,
      PawnStatus.TEBUS,
      PawnStatus.PROSES_LELANG,
      PawnStatus.LELANG,
      PawnStatus.TERJUAL
    ]);

    const physicalItem = await prisma.physicalItem.create({
      data: {
        itemName: title,
        category,
        serialNumber: `SN-${100000 + Math.floor(Math.random() * 899999)}`,
        branchName,
        currentRack: `R-${randomChoice(["A","B","C","D"])}-${Math.floor(1 + Math.random() * 20)}`,
        description: `Deskripsi barang ${title}. Kondisi terawat dengan baik.`,
        createdAt: createdDate,
        updatedAt: createdDate,
      }
    });

    let soldAt: Date | null = null;
    let sellingPrice: number | null = null;
    let buyerName: string | null = null;
    let paymentMethod: string | null = null;
    let extensionCount = 0;
    let extensionFee: number | null = null;

    if (pawnStatus === PawnStatus.PERPANJANG) {
      extensionCount = Math.floor(1 + Math.random() * 3);
      extensionFee = Math.floor(appraisalValue * 0.05 * extensionCount);
    }

    if (pawnStatus === PawnStatus.TERJUAL) {
      soldAt = randomDate(startDate, now);
      sellingPrice = price;
      buyerName = randomChoice(buyers);
      paymentMethod = randomChoice(paymentMethods);
    }

    const contract = await prisma.pawnContract.create({
      data: {
        uniqueCode: `PC-${sku}`,
        status: pawnStatus,
        customerName: randomChoice(buyers),
        customerPhone: `0812${10000000 + Math.floor(Math.random() * 89999999)}`,
        appraisalValue,
        physicalItemId: physicalItem.id,
        startDate,
        endDate,
        createdAt: createdDate,
        extensionCount,
        extensionFee,
        sellingPrice,
        buyerName,
        paymentMethod,
        soldAt,
      }
    });

    let catalogStatus: Status = Status.Tersedia;
    if (pawnStatus === PawnStatus.TERJUAL) {
      catalogStatus = Status.Terjual;
    }

    const auctionItem = await prisma.auctionItem.create({
      data: {
        sku,
        branchName,
        title,
        category,
        description: `Barang jaminan dari kontrak ${contract.uniqueCode}. Kategori ${category}. Sangat terawat.`,
        defects: Math.random() > 0.5 ? "Lecet halus bekas pemakaian wajar" : null,
        price,
        status: catalogStatus,
        images: [`https://placehold.co/800x600/1e293b/e2e8f0?text=${encodeURIComponent(title)}`],
        whatsappNumber: "6281213211413",
        kondisi: randomChoice([Kondisi.Baru, Kondisi.Bekas]),
        physicalItemId: physicalItem.id,
        createdAt: createdDate,
      }
    });

    if (catalogStatus === Status.Terjual) {
      const transactionDate = soldAt || randomDate(createdDate, now);
      await prisma.salesTransaction.create({
        data: {
          itemId: auctionItem.id,
          sku,
          soldPrice: price,
          branchName,
          cashierName: randomChoice(cashiers),
          transactionDate,
        }
      });
    }
  }

  console.log("✅ Seed inject completed successfully: Injected 50 items and transactions!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
