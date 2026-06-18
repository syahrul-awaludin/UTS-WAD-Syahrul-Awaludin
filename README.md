# WAD Capstone API

REST API untuk manajemen task dan project, dibangun dengan **Node.js + Express + Prisma ORM + MySQL**.

> **UTS Web Advance Development 2** — Syahrul Awaludin | S1 Sistem Teknologi Informasi | Universitas Cakrawala

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Fitur](#-fitur)
- [ERD Database](#-erd-database)
- [Setup & Instalasi](#-setup--instalasi)
- [Environment Variables](#-environment-variables)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Daftar Endpoint API](#-daftar-endpoint-api)
- [Struktur Folder](#-struktur-folder)

---

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|-----------|
| Node.js | Runtime JavaScript |
| Express.js v5 | Web framework |
| Prisma ORM v7 | Database ORM |
| MySQL / MariaDB | Database |
| JWT (jsonwebtoken) | Autentikasi |
| Argon2id | Hashing password |
| Joi | Validasi input |
| Swagger UI | Dokumentasi API interaktif |
| Nodemon | Hot-reload development |

---

## ✨ Fitur

- ✅ Full CRUD **Tasks** dengan pagination, filtering, dan sorting
- ✅ Full CRUD **Projects** (model tambahan) dengan status manajemen
- ✅ Task dapat dikelompokkan ke dalam Project (relasi opsional)
- ✅ Autentikasi JWT dengan access token (15 menit) + refresh token (7 hari)
- ✅ Token rotation & reuse detection pada refresh token
- ✅ Validasi input Joi dengan pesan error Bahasa Indonesia
- ✅ Swagger UI interaktif di `/api/docs`
- ✅ Repository layer (controller tidak import Prisma langsung)
- ✅ Index pada kolom yang sering difilter

---

## 🗄 ERD Database

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│    users    │         │    tasks     │         │    projects     │
├─────────────┤         ├──────────────┤         ├─────────────────┤
│ id (PK)     │──┐  ┌──│ id (PK)      │    ┌───│ id (PK)         │
│ name        │  │  │  │ title        │    │   │ name            │
│ email       │  │  │  │ description  │    │   │ description     │
│ password    │  │  │  │ status       │    │   │ status          │
│ createdAt   │  │  │  │ priority     │    │   │ ownerId (FK)────┘
│ updatedAt   │  │  │  │ dueDate      │    │   │ createdAt       │
└─────────────┘  │  │  │ createdAt    │    │   │ updatedAt       │
                 │  │  │ updatedAt    │    │   └─────────────────┘
┌──────────────┐ │  │  │ userId (FK)──┘    │
│refresh_tokens│ │  │  │ projectId (FK)────┘
├──────────────┤ │  │  └──────────────┘
│ id (PK)      │ │  │
│ token        │ │  └──── userId
│ userId (FK)──┘ │
│ expiresAt    │ └──────── userId / ownerId
│ isRevoked    │
│ createdAt    │
└──────────────┘
```

### Enum

| Model | Field | Nilai |
|-------|-------|-------|
| Task | `status` | `TODO`, `IN_PROGRESS`, `DONE` |
| Task | `priority` | `LOW`, `MEDIUM`, `HIGH` |
| Project | `status` | `ACTIVE`, `COMPLETED`, `ARCHIVED` |

---

## 🚀 Setup & Instalasi

### Prasyarat

- Node.js >= 18
- MySQL atau MariaDB berjalan (bisa via XAMPP)
- npm

### Langkah Instalasi

**1. Clone repository**
```bash
git clone https://github.com/syahrul-awaludin/UTS-WAD-Syahrul-Awaludin.git
cd UTS-WAD-Syahrul-Awaludin
```

**2. Install dependencies**
```bash
npm install
```

**3. Salin file environment**
```bash
cp .env.example .env
```

**4. Isi konfigurasi `.env`** (lihat bagian [Environment Variables](#-environment-variables))

**5. Jalankan migration database**
```bash
npx prisma migrate dev
```

**6. Generate Prisma Client**
```bash
npx prisma generate
```

**7. Seed data awal**
```bash
npm run db:seed
```

> Perintah ini akan **menghapus semua data lama**, mereset auto-increment, lalu mengisi ulang database dengan data testing siap pakai (2 user, 5 project, 9 task).

---

## ⚙️ Environment Variables

Salin `.env.example` ke `.env` dan isi nilainya:

```env
PORT=3000
NODE_ENV=development
APP_NAME=WAD Capstone API
APP_VERSION=1.0.0

# JWT Secrets — gunakan string acak yang panjang
JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=mysql://root:@localhost:3306/WAD_UTS
```

---

## ▶️ Menjalankan Aplikasi

```bash
# Mode development (dengan hot-reload)
npm run dev

# Mode production
npm start

# Reset & seed ulang database
npm run db:seed
```

Setelah server berjalan:
- **API Base URL:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/health`

### Data Seed (Siap Pakai)

Setelah menjalankan `npm run db:seed`, database akan berisi:

**👥 Users**

| ID | Nama | Email | Password |
|----|------|-------|----------|
| 1 | Siti Rahayu | `siti@example.com` | `password123` |
| 2 | Budi Santoso | `budi@example.com` | `password123` |

**📁 Projects**

| ID | Nama | Status | Owner |
|----|------|--------|-------|
| 1 | Proyek Akhir WAD | `ACTIVE` | Budi |
| 2 | Aplikasi Mobile Kasir | `ACTIVE` | Siti |
| 3 | Riset Machine Learning | `COMPLETED` | Budi |
| 4 | Dashboard Internal HRD | `COMPLETED` | Siti |
| 5 | Website Portofolio Lama | `ARCHIVED` | Budi |

**✅ Tasks**

| # | Judul | Status | Priority | User | Project |
|---|-------|--------|----------|------|---------|
| 1 | Setup Express server & folder structure | `DONE` | HIGH | Budi | Proyek Akhir WAD |
| 2 | Setup Prisma ORM & koneksi database | `DONE` | HIGH | Budi | Proyek Akhir WAD |
| 3 | Implementasi JWT Authentication | `IN_PROGRESS` | HIGH | Budi | Proyek Akhir WAD |
| 4 | Dokumentasi Swagger API | `TODO` | MEDIUM | Budi | Proyek Akhir WAD |
| 5 | Review materi Prisma Relations | `TODO` | LOW | Budi | *(personal)* |
| 6 | Desain UI wireframe aplikasi kasir | `DONE` | HIGH | Siti | Aplikasi Mobile Kasir |
| 7 | Setup React Native & navigasi | `IN_PROGRESS` | HIGH | Siti | Aplikasi Mobile Kasir |
| 8 | Integrasi REST API ke mobile app | `TODO` | MEDIUM | Siti | Aplikasi Mobile Kasir |
| 9 | Meeting presentasi progress sprint | `TODO` | MEDIUM | Siti | *(personal)* |

---

## 📡 Daftar Endpoint API

### 🔓 Public Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/health` | Health check server |
| `GET` | `/info` | Info aplikasi |

---

### 🔐 Auth (`/api/v1/auth`)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/v1/auth/register` | Registrasi user baru | — |
| `POST` | `/api/v1/auth/login` | Login, dapatkan access + refresh token | — |
| `POST` | `/api/v1/auth/refresh` | Refresh access token (token rotation) | — |
| `POST` | `/api/v1/auth/logout` | Logout, revoke refresh token | — |
| `GET` | `/api/v1/auth/me` | Info user yang sedang login | ✅ Bearer |

**Contoh Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@example.com","password":"password123"}'
```

---

### ✅ Tasks (`/api/v1/tasks`) — Butuh Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/v1/tasks` | Daftar task milik user (pagination, filter, sort) |
| `POST` | `/api/v1/tasks` | Buat task baru |
| `GET` | `/api/v1/tasks/:id` | Detail task |
| `PUT` | `/api/v1/tasks/:id` | Replace task (semua field wajib) |
| `PATCH` | `/api/v1/tasks/:id` | Update parsial task |
| `DELETE` | `/api/v1/tasks/:id` | Hapus task |

**Query Parameters `GET /tasks`:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `status` | `TODO` \| `IN_PROGRESS` \| `DONE` | Filter by status |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | Filter by prioritas |
| `projectId` | integer | Filter by project |
| `sort` | `createdAt` \| `updatedAt` \| `title` \| `priority` | Kolom sort (default: `createdAt`) |
| `order` | `asc` \| `desc` | Urutan sort (default: `desc`) |
| `limit` | integer (1–100) | Jumlah data per halaman (default: `10`) |
| `offset` | integer | Posisi awal (default: `0`) |

**Body `POST /tasks`:**
```json
{
  "title": "Nama task",
  "description": "Deskripsi opsional",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-12-31T00:00:00.000Z",
  "projectId": 1
}
```

---

### 📁 Projects (`/api/v1/projects`) — Butuh Auth

> Model tambahan Syahrul Awaludin — Task dapat dikelompokkan ke dalam Project.

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/v1/projects` | Daftar project milik user (pagination, filter) |
| `POST` | `/api/v1/projects` | Buat project baru |
| `GET` | `/api/v1/projects/:id` | Detail project beserta daftar tasks-nya |
| `PUT` | `/api/v1/projects/:id` | Replace project (semua field wajib) |
| `PATCH` | `/api/v1/projects/:id` | Update parsial project |
| `DELETE` | `/api/v1/projects/:id` | Hapus project |

**Query Parameters `GET /projects`:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `status` | `ACTIVE` \| `COMPLETED` \| `ARCHIVED` | Filter by status |
| `sort` | `createdAt` \| `updatedAt` \| `name` \| `status` | Kolom sort |
| `order` | `asc` \| `desc` | Urutan sort |
| `limit` | integer | Jumlah data per halaman |
| `offset` | integer | Posisi awal |

**Body `POST /projects`:**
```json
{
  "name": "Nama Project",
  "description": "Deskripsi opsional",
  "status": "ACTIVE"
}
```

---

### Format Response

**Success:**
```json
{
  "data": { ... }
}
```

**List dengan Pagination:**
```json
{
  "data": [...],
  "pagination": {
    "total": 10,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrev": false,
    "nextOffset": null,
    "prevOffset": null
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [
      { "field": "title", "message": "title wajib diisi." }
    ]
  }
}
```

---

## 📁 Struktur Folder

```
excited-kepler/
├── prisma/
│   ├── schema.prisma          # Definisi model database
│   ├── seed.js                # Data awal database
│   └── migrations/            # Riwayat migration
├── src/
│   ├── config/
│   │   ├── index.js           # Konfigurasi aplikasi (env)
│   │   └── prisma.js          # Prisma client singleton
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── tasks.controller.js
│   │   ├── projects.controller.js
│   │   └── healthController.js
│   ├── repositories/
│   │   ├── task.repository.js
│   │   ├── project.repository.js
│   │   ├── user.repository.js
│   │   └── refreshToken.repository.js
│   ├── middleware/
│   │   ├── authenticate.js    # Verifikasi JWT
│   │   └── validate.js        # Validasi Joi
│   ├── validators/
│   │   ├── task.validator.js
│   │   ├── project.validator.js
│   │   └── auth.validator.js
│   ├── routes/
│   │   ├── index.js           # Health & info
│   │   ├── auth.routes.js
│   │   ├── tasks.routes.js
│   │   └── projects.routes.js
│   ├── docs/
│   │   └── swagger.js         # Konfigurasi Swagger UI
│   └── index.js               # Entry point Express
├── .env                       # Environment variables (tidak di-commit)
├── .env.example               # Template environment variables
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan UTS — Web Advance Development 2.

**Syahrul Awaludin** | S1 Sistem Teknologi Informasi | Universitas Cakrawala | 2026
