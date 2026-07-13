# WAD Capstone API - Backend

Repositori ini berisi *source code* untuk Backend aplikasi WAD Task Manager, yang dikembangkan untuk memenuhi tugas akhir (UAS) mata kuliah Web Application Development.

## 🚀 Teknologi yang Digunakan
- **Node.js & Express.js**: Framework backend untuk membangun RESTful API.
- **Prisma ORM**: Object-Relational Mapping (ORM) modern untuk berinteraksi dengan database MySQL.
- **Socket.IO**: Menyediakan fitur *Real-Time Communication* (WebSocket) untuk fitur kolaborasi antar pengguna secara langsung.
- **Argon2**: Algoritma enkripsi *password* yang lebih aman dibandingkan bcrypt.
- **JSON Web Token (JWT)**: Untuk Autentikasi dan Otorisasi (*Access Token* & *Refresh Token*).

## 🏗️ Arsitektur Proyek (Clean Architecture)
Backend ini menerapkan prinsip **Separation of Concerns** melalui *Layered Architecture*:
- **`routes/`**: Menangani penentuan *endpoint* HTTP dan mengarahkannya ke *Controller*.
- **`controllers/`**: Menangani ekstraksi *request*, merakit *response*, dan menyiarkan event WebSocket (`socket.io`).
- **`services/`**: Menangani *Business Logic* (digunakan khusus untuk proses Autentikasi seperti validasi *password* dan manajemen JWT).
- **`repositories/`**: Lapisan abstraksi Database. Semua query Prisma diisolasi di dalam *repository* ini.
- **`middlewares/`**: Berisi filter *request* (seperti `auth.middleware.js` untuk otorisasi Token JWT dan pengecekan role `ADMIN`).

## 📦 Panduan Instalasi
1. Pastikan Anda telah menginstal Node.js dan memiliki server database MySQL.
2. Lakukan *Clone* repositori ini, kemudian jalankan instalasi paket:
   ```bash
   npm install
   ```
3. Salin file `.env.example` ke `.env` dan konfigurasikan variabel lingkungan (khususnya `DATABASE_URL`):
   ```env
   PORT=5001
   DATABASE_URL="mysql://username:password@localhost:3306/wad_capstone"
   JWT_ACCESS_SECRET="rahasia_access"
   JWT_REFRESH_SECRET="rahasia_refresh"
   ```
4. Jalankan sinkronisasi skema database melalui Prisma:
   ```bash
   npx prisma db push
   ```
5. Isi database dengan *seed data* (opsional, tapi sangat disarankan untuk pengujian):
   ```bash
   npx prisma db seed
   ```
6. Jalankan server (Mode Development):
   ```bash
   npm run dev
   ```

## 🤝 Fitur Kolaborasi Tim (WebSockets)
Aplikasi memancarkan (emit) *events* kepada *room* yang berbeda secara *real-time*:
- **`user:<userId>`**: Memancarkan event khusus ke klien yang dimiliki oleh pengguna tertentu.
- **`global_admin`**: *Room* khusus *Admin* agar mereka dapat mengaudit semua perubahan *Task* dan *Project*.
- **`project:<projectId>`**: *Room* khusus anggota *Project*. Jika seseorang menambah/menghapus/mengubah *Task*, perubahannya akan disiarkan ke *room* ini, sehingga semua anggota *project* mendapatkan pembaruan otomatis tanpa perlu *refresh*.

---
Dikembangkan untuk UAS Web Application Development.
