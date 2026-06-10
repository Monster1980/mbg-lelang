import { PrismaClient, Grade, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.salesTransaction.deleteMany();
  await prisma.auctionItem.deleteMany();

  // ─── Seed Auction Items ─────────────────────────────────────────────────────
  const items = await Promise.all([
    prisma.auctionItem.create({
      data: {
        sku: "MBG-ELC-001",
        branchName: "MBG Cabang Jakarta Pusat",
        title: "iPhone 13 Pro Max 256GB - Graphite",
        category: "Elektronik",
        description:
          "iPhone 13 Pro Max dalam kondisi sangat baik. Baterai health 89%. Layar mulus tanpa goresan. Lengkap dengan charger original.",
        defects: "Sedikit lecet di bagian frame kanan bawah",
        grade: Grade.A,
        price: 8500000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/1a1a2e/e0e0e0?text=iPhone+13+Pro+Max",
          "https://placehold.co/800x600/1a1a2e/e0e0e0?text=iPhone+Back",
        ],
        whatsappNumber: "6281234567890",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-ELC-002",
        branchName: "MBG Cabang Bandung",
        title: "Samsung Galaxy S22 Ultra 128GB - Phantom Black",
        category: "Elektronik",
        description:
          "Samsung Galaxy S22 Ultra dengan S-Pen. Layar Dynamic AMOLED 2X masih excellent. Semua fitur berjalan normal.",
        defects: null,
        grade: Grade.A,
        price: 7200000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/16213e/e0e0e0?text=Galaxy+S22+Ultra",
        ],
        whatsappNumber: "6281234567891",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-FAS-001",
        branchName: "MBG Cabang Jakarta Pusat",
        title: "Tas Louis Vuitton Neverfull MM - Monogram",
        category: "Fashion",
        description:
          "Tas LV Neverfull MM authentic. Datecode jelas. Leather patina merata menandakan kualitas kulit asli. Termasuk pouch.",
        defects: "Minor patina pada handle, wajar untuk barang preloved",
        grade: Grade.B,
        price: 15000000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/2d132c/e0e0e0?text=LV+Neverfull+MM",
        ],
        whatsappNumber: "6281234567890",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-ELC-003",
        branchName: "MBG Cabang Surabaya",
        title: 'MacBook Air M1 13" 2020 - Space Gray 256GB',
        category: "Elektronik",
        description:
          "MacBook Air M1 chip. Battery cycle count 152. Keyboard dan trackpad berfungsi sempurna. macOS terbaru terinstall.",
        defects: "Satu titik terang (bright spot) kecil di pojok kiri bawah layar, hampir tidak terlihat saat penggunaan normal",
        grade: Grade.B,
        price: 7800000,
        status: Status.Dipesan,
        images: [
          "https://placehold.co/800x600/0a1628/e0e0e0?text=MacBook+Air+M1",
        ],
        whatsappNumber: "6281234567892",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-JWL-001",
        branchName: "MBG Cabang Jakarta Pusat",
        title: "Cincin Emas 750 (18K) - Berlian 0.5 Carat",
        category: "Perhiasan",
        description:
          "Cincin emas kuning 18 karat dengan berlian solitaire 0.5 carat. Sertifikat keaslian tersedia. Ukuran ring 15.",
        defects: null,
        grade: Grade.A,
        price: 12500000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/3d1c02/e0e0e0?text=Cincin+Berlian",
        ],
        whatsappNumber: "6281234567890",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-ELC-004",
        branchName: "MBG Cabang Bandung",
        title: "PlayStation 5 Digital Edition + 2 Controller",
        category: "Elektronik",
        description:
          "PS5 Digital Edition lengkap dengan 2 DualSense controller. Firmware terbaru. Termasuk kabel HDMI dan power cable original.",
        defects: "Goresan halus di bagian body atas, tidak mempengaruhi performa",
        grade: Grade.B,
        price: 4500000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/1b1b2f/e0e0e0?text=PlayStation+5",
        ],
        whatsappNumber: "6281234567891",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-WTC-001",
        branchName: "MBG Cabang Surabaya",
        title: "Rolex Datejust 36mm - Silver Dial Jubilee",
        category: "Jam Tangan",
        description:
          "Rolex Datejust ref. 126234 dengan dial silver dan bracelet Jubilee. Service terakhir 2024. Bergaransi toko 6 bulan.",
        defects: null,
        grade: Grade.A,
        price: 95000000,
        status: Status.Tersedia,
        images: [
          "https://placehold.co/800x600/1a1a0e/e0e0e0?text=Rolex+Datejust",
        ],
        whatsappNumber: "6281234567892",
      },
    }),
    prisma.auctionItem.create({
      data: {
        sku: "MBG-ELC-005",
        branchName: "MBG Cabang Jakarta Pusat",
        title: "Canon EOS R6 Mark II Body Only",
        category: "Elektronik",
        description:
          "Canon EOS R6 II mirrorless. Shutter count 12.500. Sensor bersih. Semua tombol dan dial berfungsi normal. Termasuk baterai original dan charger.",
        defects: "Rubber grip sedikit mengembang di bagian kanan, masih nyaman digenggam",
        grade: Grade.B,
        price: 28000000,
        status: Status.Terjual,
        images: [
          "https://placehold.co/800x600/0d1117/e0e0e0?text=Canon+EOS+R6+II",
        ],
        whatsappNumber: "6281234567890",
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} auction items`);

  // ─── Seed a Sample Sales Transaction ──────────────────────────────────────────
  const soldItem = items.find((i) => i.status === Status.Terjual);
  if (soldItem) {
    await prisma.salesTransaction.create({
      data: {
        itemId: soldItem.id,
        sku: soldItem.sku,
        soldPrice: soldItem.price,
        branchName: soldItem.branchName,
        cashierName: "Ahmad Fauzi",
        transactionDate: new Date("2026-06-08T14:30:00Z"),
      },
    });
    console.log("✅ Created 1 sample sales transaction");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
