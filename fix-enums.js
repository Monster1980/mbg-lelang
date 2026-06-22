const fs = require('fs');
const path = require('path');

const filesToFixStatus = [
  'src/app/api/kasir/scan/route.ts',
  'src/app/api/kasir/checkout/route.ts',
  'src/app/api/items/route.ts',
  'src/app/api/admin/analytics/route.ts',
  'src/app/(public)/katalog/[id]/page.tsx',
  'src/app/(public)/CatalogView.tsx'
];

filesToFixStatus.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/import \{.*?ItemStatus.*?\} from '@prisma\/client';/, "import { Status } from '@prisma/client';");
    content = content.replace(/ItemStatus\.TERJUAL/g, 'Status.Terjual');
    content = content.replace(/ItemStatus\.LELANG/g, 'Status.Tersedia');
    fs.writeFileSync(p, content);
  }
});

const filesToFixPawnStatus = [
  'src/app/api/admin/gudang/contracts/route.ts'
];

filesToFixPawnStatus.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/import \{.*?ItemStatus.*?\} from '@prisma\/client';/, "import { PawnStatus } from '@prisma/client';");
    content = content.replace(/ItemStatus/g, 'PawnStatus');
    fs.writeFileSync(p, content);
  }
});

console.log('Done replacing enums.');
