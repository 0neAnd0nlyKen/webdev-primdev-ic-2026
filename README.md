# Primdev Library API - Intermediate Backend 2026

Backend API untuk sistem manajemen perpustakaan dengan Express.js dan Prisma ORM.

## 🚀 Fitur Utama

- **Autentikasi** - JWT-based authentication
- **Manajemen Pengguna** - User registration, profiles, dan roles
- **Manajemen Buku** - CRUD operations untuk katalog buku
- **Kategori Buku** - Organisasi buku berdasarkan kategori
- **Peminjaman** - Tracking peminjaman dan pengembalian buku
- **Cloud Storage** - Integrasi Cloudinary untuk upload gambar

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm

## 🛠️ Setup Lokal

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
# Copy dari example
cp .env.example .env

# Edit .env dengan credentials kamu
```

**Required Environment Variables:**

```env
ENV=development
PORT=3000
JWT_SECRET=your_secret_key
BCRYPT_SALT_ROUNDS=10
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_db_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
LOG_LEVEL=debug
```

### 3. Database Migration

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npm run build
```

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
├── routes/          # Route definitions
├── controllers/     # Business logic
├── middlewares/     # Custom middlewares
├── validations/     # Input validations
├── configs/         # Configuration files
├── prisma/          # Database schema & migrations
├── generated/       # Generated Prisma client
└── index.js         # Entry point
```

## 🔌 API Routes

### Authentication

- `POST /auth/register` - Register pengguna baru
- `POST /auth/login` - Login

### Books

- `GET /books` - List semua buku
- `GET /books/:id` - Get detail buku
- `POST /books` - Tambah buku baru _(Auth required, Admin only)_
- `PUT /books/:id` - Update buku _(Auth required, Admin only)_
- `DELETE /books/:id` - Hapus buku _(Auth required, Admin only)_

### Categories

- `GET /categories` - List semua kategori
- `GET /categories/:id` - Get detail kategori
- `GET /categories/:id/books` - Get buku berdasarkan kategori
- `POST /categories` - Tambah kategori baru _(Auth required, Admin only)_
- `PUT /categories/:id` - Update kategori _(Auth required, Admin only)_
- `DELETE /categories/:id` - Hapus kategori _(Auth required, Admin only)_

### Users

- `GET /users` - List semua pengguna _(Auth required)_
- `GET /users/:id` - Get detail pengguna _(Auth required)_
- `GET /users/:id/profile` - Get profil pengguna _(Auth required)_
- `POST /users` - Tambah pengguna baru _(Auth required)_
- `PUT /users/:id` - Update pengguna _(Auth required)_
- `DELETE /users/:id` - Hapus pengguna _(Auth required)_

### Profiles

- `GET /profiles` - List semua profil _(Auth required)_
- `GET /profiles/:id` - Get detail profil _(Auth required)_
- `POST /profiles` - Buat profil baru _(Auth required)_
- `PUT /profiles/:id` - Update profil _(Auth required)_
- `DELETE /profiles/:id` - Hapus profil _(Auth required)_

### Borrowings

- `GET /borrowings` - List semua peminjaman _(Auth required)_
- `GET /borrowings/:id` - Get detail peminjaman _(Auth required)_
- `POST /borrowings` - Buat peminjaman baru _(Auth required)_
- `PUT /borrowings/:id/return` - Kembalikan buku _(Auth required)_
- `DELETE /borrowings/:id` - Hapus peminjaman _(Auth required)_

## 🚢 Deployment ke Vercel

### 1. Setup Environment di Vercel Dashboard

Tambahkan semua environment variables (kecuali `PORT` dan `ENV=development`)

### 2. Deploy

```bash
npm run build
vercel
```

Atau connect GitHub repository langsung ke Vercel untuk auto-deploy.

## 📚 Dependencies Utama

- **express** - Web framework
- **@prisma/client** - ORM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cloudinary** - Image storage
- **express-validator** - Input validation
- **pino** - Logger

## 👤 Author

Kendrick Raphael Ticoalu