require('dotenv').config();
const prisma = require('../src/config/prisma');
const argon2 = require('argon2');

async function main() {
  console.log('Mulai seeding database...');

  // Hapus data dengan urutan FK yang benar
  await prisma.task.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Reset auto-increment counter agar ID mulai dari 1
  await prisma.$executeRawUnsafe('ALTER TABLE `tasks` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `refresh_tokens` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `projects` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `users` AUTO_INCREMENT = 1');

  // ─── Hash password (sama untuk semua akun testing) ───────────
  const hashedPassword = await argon2.hash('password123', {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // ─── Seed: Users ─────────────────────────────────────────────
  const [budi, siti] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Siti Rahayu',
        email: 'siti@example.com',
        password: hashedPassword,
      },
    }),
  ]);
  console.log(` ✓ 2 user dibuat  →  budi.id=${budi.id}, siti.id=${siti.id}`);

  // ─── Seed: Projects (model tambahan) ─────────────────────────
  const [proyek1, proyek2, proyek3, proyek4, proyek5] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Proyek Akhir WAD',
        description: 'Capstone project mata kuliah Web Advance Development — membangun REST API dengan Express + Prisma.',
        status: 'ACTIVE',
        ownerId: budi.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Aplikasi Mobile Kasir',
        description: 'Aplikasi kasir sederhana berbasis React Native untuk UMKM lokal.',
        status: 'ACTIVE',
        ownerId: siti.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Riset Machine Learning',
        description: 'Penelitian klasifikasi teks berita menggunakan model Naive Bayes dan SVM.',
        status: 'COMPLETED',
        ownerId: budi.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Dashboard Internal HRD',
        description: 'Pengembangan dashboard manajemen karyawan untuk kebutuhan internal perusahaan.',
        status: 'COMPLETED',
        ownerId: siti.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Website Portofolio Lama',
        description: 'Portofolio versi lama yang sudah tidak aktif — diarsipkan untuk referensi.',
        status: 'ARCHIVED',
        ownerId: budi.id,
      },
    }),
  ]);
  console.log(` ✓ 5 project dibuat  →  [ACTIVE] proyek1.id=${proyek1.id} (Budi), proyek2.id=${proyek2.id} (Siti) | [COMPLETED] proyek3, proyek4 | [ARCHIVED] proyek5`);

  // ─── Seed: Tasks ─────────────────────────────────────────────
  await Promise.all([
    // Tugas Budi — terkait Proyek Akhir WAD
    prisma.task.create({
      data: {
        title: 'Setup Express server & folder structure',
        description: 'Inisialisasi project Express, konfigurasi middleware, dan struktur folder MVC.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-06-01'),
        userId: budi.id,
        projectId: proyek1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup Prisma ORM & koneksi database',
        description: 'Install Prisma, buat schema awal, dan jalankan migrasi pertama ke MySQL.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-06-05'),
        userId: budi.id,
        projectId: proyek1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implementasi JWT Authentication',
        description: 'Buat endpoint login, register, refresh token, logout, dan middleware autentikasi.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-06-20'),
        userId: budi.id,
        projectId: proyek1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Dokumentasi Swagger API',
        description: 'Tambahkan anotasi swagger-jsdoc ke semua endpoint dan pastikan UI berjalan di /api-docs.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-06-25'),
        userId: budi.id,
        projectId: proyek1.id,
      },
    }),
    // Tugas Budi — tanpa project (personal task)
    prisma.task.create({
      data: {
        title: 'Review materi Prisma Relations',
        description: 'Pelajari one-to-many dan many-to-many relation pada Prisma ORM.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date('2026-06-30'),
        userId: budi.id,
        projectId: null,
      },
    }),
    // Tugas Siti — terkait Aplikasi Mobile Kasir
    prisma.task.create({
      data: {
        title: 'Desain UI wireframe aplikasi kasir',
        description: 'Buat wireframe halaman utama, transaksi, dan laporan menggunakan Figma.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-06-08'),
        userId: siti.id,
        projectId: proyek2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup React Native & navigasi',
        description: 'Inisialisasi project React Native, install React Navigation, dan konfigurasi tab/stack navigator.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-06-22'),
        userId: siti.id,
        projectId: proyek2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Integrasi REST API ke mobile app',
        description: 'Hubungkan aplikasi mobile ke backend REST API menggunakan Axios dan kelola state dengan Zustand.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-06-28'),
        userId: siti.id,
        projectId: proyek2.id,
      },
    }),
    // Tugas Siti — tanpa project (personal task)
    prisma.task.create({
      data: {
        title: 'Meeting presentasi progress sprint',
        description: 'Siapkan slide demo fitur yang sudah selesai untuk presentasi kepada tim dan mentor.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-06-19'),
        userId: siti.id,
        projectId: null,
      },
    }),
  ]);
  console.log(' ✓ 9 task dibuat (4 Budi + 5 Siti, dengan description & dueDate)');

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║           AKUN TESTING TERSEDIA              ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Budi  → id=${String(budi.id).padEnd(2)} | budi@example.com      ║`);
  console.log(`║  Siti  → id=${String(siti.id).padEnd(2)} | siti@example.com      ║`);
  console.log('║  Password (semua): password123               ║');
  console.log('║  Gunakan POST /api/v1/auth/login             ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
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
