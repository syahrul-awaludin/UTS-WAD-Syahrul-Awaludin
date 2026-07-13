require('dotenv').config();
const prisma = require('../src/config/prisma');
const argon2 = require('argon2');

async function main() {
  const hash = async (pwd) => argon2.hash(pwd, { memoryCost: 65536, timeCost: 3, parallelism: 4 });

  const adminPass = await hash('admin1234');
  const userPass = await hash('user1234');

  // Bersihkan data lama (opsional, hati-hati jika production)
  // await prisma.task.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.user.deleteMany();

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: { role: 'ADMIN', password: adminPass },
    create: { name: 'Admin WAD', email: 'admin@mail.com', password: adminPass, role: 'ADMIN' },
  });

  const budi = await prisma.user.upsert({
    where: { email: 'budi@mail.com' },
    update: { password: userPass },
    create: { name: 'Budi Santoso', email: 'budi@mail.com', password: userPass, role: 'USER' },
  });

  const siti = await prisma.user.upsert({
    where: { email: 'siti@mail.com' },
    update: { password: userPass },
    create: { name: 'Siti Aminah', email: 'siti@mail.com', password: userPass, role: 'USER' },
  });

  const andi = await prisma.user.upsert({
    where: { email: 'andi@mail.com' },
    update: { password: userPass },
    create: { name: 'Andi Wijaya', email: 'andi@mail.com', password: userPass, role: 'USER' },
  });

  console.log('✅ Users seeded');

  // 2. Create Projects & Assign Members
  const project1 = await prisma.project.create({
    data: {
      name: 'Website E-Commerce UAS',
      description: 'Proyek akhir pengembangan website E-Commerce dengan React dan Node.js',
      status: 'ACTIVE',
      ownerId: budi.id,
      members: {
        connect: [{ id: siti.id }, { id: andi.id }]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Aplikasi Mobile Point of Sales',
      description: 'Aplikasi kasir untuk warung kopi',
      status: 'ACTIVE',
      ownerId: siti.id,
      members: {
        connect: [{ id: budi.id }]
      }
    }
  });

  console.log('✅ Projects seeded');

  // 3. Create Tasks
  await prisma.task.createMany({
    data: [
      // Project 1 Tasks
      { title: 'Desain UI/UX Homepage', description: 'Buat desain di Figma', status: 'DONE', priority: 'HIGH', userId: siti.id, projectId: project1.id },
      { title: 'Setup Database MySQL', description: 'Desain skema dan deploy ke server', status: 'IN_PROGRESS', priority: 'HIGH', userId: andi.id, projectId: project1.id },
      { title: 'Integrasi Payment Gateway', description: 'Gunakan Midtrans untuk pembayaran', status: 'TODO', priority: 'MEDIUM', userId: budi.id, projectId: project1.id },
      { title: 'Testing Checkout Flow', description: 'Pastikan tidak ada bug saat checkout', status: 'TODO', priority: 'LOW', userId: siti.id, projectId: project1.id },

      // Project 2 Tasks
      { title: 'Desain Struktur Database', description: 'Buat ERD dan normalisasi', status: 'IN_PROGRESS', priority: 'HIGH', userId: budi.id, projectId: project2.id },
      { title: 'Membuat Endpoint API', description: 'API untuk produk dan transaksi', status: 'TODO', priority: 'HIGH', userId: siti.id, projectId: project2.id },
      { title: 'Implementasi Auth Screen', description: 'Login & Register di Flutter', status: 'TODO', priority: 'MEDIUM', userId: budi.id, projectId: project2.id },
      
      // Personal Tasks (No Project)
      { title: 'Beli Kopi', description: 'Untuk begadang ngerjain UAS', status: 'TODO', priority: 'HIGH', userId: budi.id },
      { title: 'Revisi Proposal', description: 'Perbaiki bab 3', status: 'IN_PROGRESS', priority: 'MEDIUM', userId: siti.id },
    ]
  });

  console.log('✅ Tasks seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
