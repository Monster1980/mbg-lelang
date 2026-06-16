import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mbg.com';
  const password = await bcrypt.hash('admin123', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email,
        password,
        nama_lengkap: 'Super Administrator',
        asal_cabang: 'MBG Pusat',
        role: 'SUPERADMIN',
      },
    });
    console.log('Seeded superadmin: admin@mbg.com / admin123');
  } else {
    console.log('Superadmin already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
