import { PrismaClient, Kondisi, Status } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ["Laptop", "Smartphone", "Tablet", "Kamera", "Jam Tangan", "Elektronik Lainnya"];
const branches = ["Pusat", "Cabang A", "Cabang B", "Cabang C"];
const brands = {
  "Laptop": ["Asus", "Acer", "Lenovo", "HP", "Dell", "Apple", "MSI"],
  "Smartphone": ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Realme", "Google"],
  "Tablet": ["Samsung", "Apple", "Lenovo", "Huawei", "Xiaomi"],
  "Kamera": ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic"],
  "Jam Tangan": ["Rolex", "Seiko", "Casio", "Garmin", "Fossil", "Apple", "Samsung"],
  "Elektronik Lainnya": ["Sony", "LG", "Samsung", "Philips"]
};

const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log("Memulai proses seeding 1000 barang katalog...");

  const itemsData = [];
  
  for (let i = 1; i <= 1000; i++) {
    const category = randomElement(categories);
    const brand = randomElement(brands[category as keyof typeof brands]);
    const title = `${category} ${brand} Seri-${randomNumber(100, 9999)}`;
    const price = randomNumber(5, 150) * 100000; // Harga kelipatan 100.000 (500k - 15jt)
    const isBekas = Math.random() > 0.3; // 70% chance bekas
    const kondisi = isBekas ? Kondisi.Bekas : Kondisi.Baru;
    
    // Status probability: 60% Tersedia, 15% Dipesan, 25% Terjual
    const statusRand = Math.random();
    let status: Status = Status.Tersedia;
    if (statusRand > 0.85) status = Status.Dipesan;
    else if (statusRand > 0.60) status = Status.Terjual;

    const sku = `CAT-${Date.now()}-${randomNumber(1000, 9999)}-${i}`;

    itemsData.push({
      sku,
      branchName: randomElement(branches),
      title,
      category,
      description: `Ini adalah deskripsi untuk ${title}. Barang dengan kondisi ${kondisi}. Sangat direkomendasikan.`,
      defects: isBekas ? (Math.random() > 0.5 ? "Lecet pemakaian wajar pada body" : null) : null,
      kondisi,
      price,
      status,
      isMarketplaceVisible: status === Status.Tersedia || status === Status.Dipesan,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"
      ],
      whatsappNumber: `0812${randomNumber(10000000, 99999999)}`,
    });
  }

  // Gunakan createMany untuk performa tinggi pada insert ribuan baris
  const result = await prisma.auctionItem.createMany({
    data: itemsData,
    skipDuplicates: true,
  });

  console.log(`Seeding selesai! Berhasil menambahkan ${result.count} barang katalog ke database.`);
}

main()
  .catch((e) => {
    console.error("Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
