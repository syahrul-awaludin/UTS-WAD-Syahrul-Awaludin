require('dotenv').config();
const prisma = require('../src/config/prisma');
const argon2 = require('argon2');

async function main() {
  console.log('Mulai seeding database...');

  // Hapus data dengan urutan FK yang benar, lalu reset auto-increment ke 1
  await prisma.task.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Reset auto-increment counter agar ID mulai dari 1
  await prisma.$executeRawUnsafe('ALTER TABLE `tasks` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `refresh_tokens` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `projects` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `users` AUTO_INCREMENT = 1');

  const hashedPassword = await argon2.hash('password123', {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const [budi, siti] = await Promise.all([
    prisma.user.create({ data: { name: 'Budi Santoso', email: 'budi@example.com', password: hashedPassword } }),
    prisma.user.create({ data: { name: 'Siti Rahayu', email: 'siti@example.com', password: hashedPassword } }),
  ]);
  console.log(` ✓ 2 user dibuat  →  budi.id=${budi.id}, siti.id=${siti.id}`);

  const [project1, project2] = await Promise.all([
    prisma.project.create({ data: { name: 'Proyek Akhir', description: 'Web Advance Dev', ownerId: budi.id, status: 'ACTIVE' } }),
    prisma.project.create({ data: { name: 'Proyek Sampingan', description: 'Aplikasi Mobile', ownerId: siti.id, status: 'ACTIVE' } }),
    prisma.project.create({ data: { name: 'Proyek Riset', description: 'Penelitian Data', ownerId: budi.id, status: 'ACTIVE' } }),
    prisma.project.create({ data: { name: 'Proyek Internal', description: 'Pengembangan Tools', ownerId: siti.id, status: 'COMPLETED' } }),
    prisma.project.create({ data: { name: 'Proyek Arsip', description: 'Dokumentasi Lama', ownerId: budi.id, status: 'ARCHIVED' } }),
  ]);
  console.log(` ✓ 5 project dibuat  →  project1.id=${project1.id} (Budi), project2.id=${project2.id} (Siti)`);

  await Promise.all([
    prisma.task.create({ data: { title: 'Setup Express server', status: 'DONE', priority: 'HIGH', userId: budi.id, projectId: project1.id } }),
    prisma.task.create({ data: { title: 'Setup Database', status: 'IN_PROGRESS', priority: 'HIGH', userId: budi.id, projectId: project1.id } }),
    prisma.task.create({ data: { title: 'Belajar Prisma ORM', status: 'TODO', priority: 'MEDIUM', userId: budi.id } }),
    prisma.task.create({ data: { title: 'Review laporan', status: 'TODO', priority: 'LOW', userId: siti.id, projectId: project2.id } }),
    prisma.task.create({ data: { title: 'Meeting dengan tim', status: 'TODO', priority: 'MEDIUM', userId: siti.id, projectId: project2.id } }),
    prisma.task.create({ data: { title: 'Implementasi Auth', status: 'TODO', priority: 'HIGH', userId: siti.id } }),
  ]);
  console.log(' ✓ 6 task dibuat');

  console.log('');
  console.log('=== AKUN TESTING ===');
  console.log(`Budi  → id=${budi.id} | budi@example.com | password123`);
  console.log(`Siti  → id=${siti.id} | siti@example.com  | password123`);
  console.log(`Gunakan POST /api/v1/auth/login untuk mendapatkan token baru`);
  console.log('====================');
  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
