const fs = require('fs');
const path = require('path');

const seeds = ['prisma/seed.ts', 'prisma/seed1000.ts'];
seeds.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/ItemStatus\.LELANG/g, 'Status.Tersedia');
    content = content.replace(/ItemStatus\.TERJUAL/g, 'Status.Terjual');
    content = content.replace(/ItemStatus/g, 'Status');
    fs.writeFileSync(p, content);
  }
});

const allScripts = ['prisma/clear_data.ts', 'prisma/test_sync.ts', 'prisma/seed_gudang.ts', 'prisma/seed.ts', 'prisma/seed1000.ts'];
allScripts.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('export {}')) {
      content += '\nexport {};\n';
      fs.writeFileSync(p, content);
    }
  }
});

console.log('IDE errors fixed.');
