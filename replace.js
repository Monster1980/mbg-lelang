const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'prisma/seed1000.ts',
  'src/app/(public)/CatalogView.tsx',
  'src/app/(public)/katalog/[id]/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/gudang/contracts/route.ts',
  'src/app/api/items/route.ts',
  'src/app/api/kasir/checkout/route.ts',
  'src/app/api/kasir/scan/route.ts',
];

for (const file of filesToUpdate) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix PawnItemStatus
  content = content.replace(/PawnItemStatus/g, 'ItemStatus');

  // Remove existing Status imports to avoid conflicts
  content = content.replace(/import\s+\{[^}]*Status[^}]*\}\s+from\s+['"]@prisma\/client['"];?/g, '');
  content = content.replace(/import\s+\{[^}]*ItemStatus[^}]*\}\s+from\s+['"]@prisma\/client['"];?/g, '');
  
  // Add proper import
  content = "import { ItemStatus } from '@prisma/client';\n" + content;

  // Specific fixes
  if (file === 'prisma/seed1000.ts') {
    content = content.replace(/let status: Status =/g, 'let status: ItemStatus =');
    content = "import { PrismaClient, Kondisi } from '@prisma/client';\n" + content;
  }
  
  if (file === 'src/app/(public)/CatalogView.tsx') {
    content = content.replace(/Status\.Terjual/g, 'ItemStatus.TERJUAL');
    content = content.replace(/Status\.Dipesan/g, 'ItemStatus.TERJUAL');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed imports in ' + file);
}
