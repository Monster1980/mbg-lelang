import { PrismaClient, PawnStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.pawnContract.deleteMany();
  await prisma.physicalItem.deleteMany();
  
  console.log('Seeding 10 dummy Gudang data...');

  const now = new Date();
  
  // Helper to generate past/future dates
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const dummyData = [
    // 1. STOK AKTIF (2 items) - Tab 2
    { itemName: 'Laptop Asus ROG Zephyrus', cat: 'ELEKTRONIK', sku: 'ASUS-ROG-01', val: 12000000, status: PawnStatus.AKTIF, end: addDays(15), cust: 'Budi Santoso' },
    { itemName: 'Kamera Sony A7III', cat: 'ELEKTRONIK', sku: 'SNY-A7-01', val: 15000000, status: PawnStatus.AKTIF, end: addDays(20), cust: 'Andi Pratama' },

    // 2. PERPANJANG (2 items) - Tab 3
    { itemName: 'Emas Antam 10g', cat: 'GERABAHAN', sku: 'ANTAM-10G-1', val: 8000000, status: PawnStatus.PERPANJANG, end: addDays(90), cust: 'Siti Aminah', extensionCount: 1, extensionFee: 150000 },
    { itemName: 'Sepeda Brompton', cat: 'GERABAHAN', sku: 'BROMP-01', val: 20000000, status: PawnStatus.PERPANJANG, end: addDays(40), cust: 'Dedi Setiawan', extensionCount: 2, extensionFee: 500000 },

    // 3. KARANTINA / PROSES_LELANG (2 items) - Tab 4
    { itemName: 'iPhone 13 Pro', cat: 'ELEKTRONIK', sku: 'IP-13-PRO', val: 10000000, status: PawnStatus.PROSES_LELANG, end: addDays(-5), cust: 'Rina Wijaya' },
    { itemName: 'TV Samsung 50 Inch', cat: 'ELEKTRONIK', sku: 'TV-SMG-50', val: 3000000, status: PawnStatus.PROSES_LELANG, end: addDays(-2), cust: 'Joko Widodo' },

    // 4. SIAP LELANG / LELANG (2 items) - Tab 5
    { itemName: 'Nintendo Switch OLED', cat: 'ELEKTRONIK', sku: 'NSW-OLED-1', val: 2500000, status: PawnStatus.LELANG, end: addDays(-10), cust: 'Kevin Sanjaya' },
    { itemName: 'Emas UBS 5g', cat: 'GERABAHAN', sku: 'UBS-5G-1', val: 4000000, status: PawnStatus.LELANG, end: addDays(-15), cust: 'Desi Anwar' },

    // 5. TEBUS (1 item) - Tab 6
    { itemName: 'iPad Air 5', cat: 'ELEKTRONIK', sku: 'IPAD-A5', val: 7000000, status: PawnStatus.TEBUS, end: addDays(-20), cust: 'Arif Muhammad' },

    // 6. TERJUAL (2 items) - Tab 6
    { itemName: 'MacBook Air M1', cat: 'ELEKTRONIK', sku: 'MBA-M1-1', val: 9000000, status: PawnStatus.TERJUAL, end: addDays(-30), cust: 'Nadiem Makarim', sp: 11000000, sold: addDays(-5), buyer: 'Lisa Blackpink', payment: 'Transfer' },
    { itemName: 'PS5 Digital Edition', cat: 'ELEKTRONIK', sku: 'PS5-DG-1', val: 6000000, status: PawnStatus.TERJUAL, end: addDays(-40), cust: 'Erick Thohir', sp: 7200000, sold: addDays(-2), buyer: 'Ahmad Dhani', payment: 'Cash' },
  ];

  for (let i = 0; i < dummyData.length; i++) {
    const d = dummyData[i];
    
    // Create physical item
    const physicalItem = await prisma.physicalItem.create({
      data: {
        itemName: d.itemName,
        category: d.cat,
        serialNumber: `SN-${Math.floor(Math.random() * 10000)}`,
        branchName: 'Cabang Pusat',
        currentRack: `A-${i+1}`,
      }
    });

    // Create pawn contract linked to physical item
    await prisma.pawnContract.create({
      data: {
        uniqueCode: d.sku,
        customerName: d.cust,
        appraisalValue: d.val,
        physicalItemId: physicalItem.id,
        status: d.status,
        startDate: addDays(-30),
        endDate: d.end,
        extensionCount: d.extensionCount || 0,
        extensionFee: d.extensionFee || null,
        sellingPrice: d.sp || null,
        soldAt: d.sold || null,
        buyerName: d.buyer || null,
        paymentMethod: d.payment || null
      }
    });
  }

  console.log('Seeding completed! 10 dummy entries injected.');
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
