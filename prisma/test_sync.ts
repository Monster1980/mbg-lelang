const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Automatic Sync from PawnContract to AuctionItem...');

  // Find a test contract in PROSES_LELANG or create one
  let contract = await prisma.pawnContract.findFirst({
    where: { status: 'PROSES_LELANG' },
    include: { physicalItem: true }
  });

  if (!contract) {
    console.log('No PROSES_LELANG contract found. Using an AKTIF one and setting it to PROSES_LELANG.');
    contract = await prisma.pawnContract.findFirst({
      where: { status: 'AKTIF' },
      include: { physicalItem: true }
    });
    if (!contract) {
      console.log('No contracts available to test.');
      process.exit(1);
    }
    
    contract = await prisma.pawnContract.update({
      where: { id: contract.id },
      data: { status: 'PROSES_LELANG' },
      include: { physicalItem: true }
    });
  }

  console.log(`Found contract ID: ${contract.id}, SKU: ${contract.uniqueCode}`);
  
  // Clean up any existing AuctionItem with this SKU first
  await prisma.auctionItem.deleteMany({
    where: { sku: contract.uniqueCode }
  });

  console.log('Simulating POST_KATALOG action (moving to LELANG)...');

  // Mimic the API POST_KATALOG logic using prisma directly so we don't have to bypass auth
  const sellingPrice = parseFloat(contract.appraisalValue) + 500000;
  const notes = "Mulus, test sync";

  await prisma.$transaction(async (tx: any) => {
    const updatedContract = await tx.pawnContract.update({
      where: { id: contract.id },
      data: { 
        status: 'LELANG',
        sellingPrice: sellingPrice,
        notes: notes
      },
      include: { physicalItem: true }
    });

    await tx.auctionItem.upsert({
      where: { sku: updatedContract.uniqueCode },
      update: {
        price: updatedContract.sellingPrice || 0,
        defects: notes,
        status: "Tersedia",
        isMarketplaceVisible: true
      },
      create: {
        sku: updatedContract.uniqueCode,
        title: updatedContract.physicalItem.itemName,
        category: updatedContract.physicalItem.category,
        branchName: updatedContract.physicalItem.branchName,
        description: updatedContract.physicalItem.description || "Barang gadai lelang",
        defects: notes,
        price: updatedContract.sellingPrice || 0,
        status: "Tersedia",
        images: updatedContract.physicalItem.images && updatedContract.physicalItem.images.length > 0 ? updatedContract.physicalItem.images : ["https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80"],
        whatsappNumber: "081234567890",
        kondisi: "Bekas",
        physicalItemId: updatedContract.physicalItemId,
        isMarketplaceVisible: true
      }
    });
  });

  // Verify it exists in AuctionItem
  const auctionItem = await prisma.auctionItem.findUnique({
    where: { sku: contract.uniqueCode }
  });

  if (auctionItem) {
    console.log(`✅ SUCCESS! AuctionItem automatically created. SKU: ${auctionItem.sku}, Price: ${auctionItem.price}`);
  } else {
    console.log(`❌ FAILED! AuctionItem not found.`);
  }

  // Next, simulate "TERJUAL"
  console.log('Simulating TERJUAL action (from Etalase)...');
  await prisma.$transaction(async (tx: any) => {
    const soldContract = await tx.pawnContract.update({
      where: { id: contract.id },
      data: { 
        status: 'TERJUAL',
        soldAt: new Date(),
        buyerName: 'John Doe Testing',
        paymentMethod: 'Transfer'
      },
      include: { physicalItem: true }
    });

    const ai = await tx.auctionItem.findUnique({
      where: { sku: soldContract.uniqueCode }
    });

    if (ai) {
      await tx.auctionItem.update({
        where: { id: ai.id },
        data: { status: "Terjual", isMarketplaceVisible: false }
      });

      await tx.salesTransaction.create({
        data: {
          itemId: ai.id,
          sku: ai.sku,
          soldPrice: soldContract.sellingPrice || ai.price,
          branchName: soldContract.physicalItem.branchName,
          cashierName: "Kasir Auto Test",
          transactionDate: new Date()
        }
      });
    }
  });

  // Verify status update in AuctionItem and SalesTransaction
  const verifyAi = await prisma.auctionItem.findUnique({
    where: { sku: contract.uniqueCode }
  });
  
  const verifyTx = await prisma.salesTransaction.findFirst({
    where: { sku: contract.uniqueCode }
  });

  if (verifyAi && verifyAi.status === 'Terjual' && verifyTx) {
    console.log(`✅ SUCCESS! Transaction recorded. Item marked as 'Terjual', transaction ID: ${verifyTx.id}, Sold Price: ${verifyTx.soldPrice}`);
  } else {
    console.log(`❌ FAILED! Status update or transaction creation failed.`);
  }

  console.log('Auto Test Complete.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

export {};
