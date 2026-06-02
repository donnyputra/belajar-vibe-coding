# Feature Plan: User Login API

## Objective
Tugas kamu adalah mengimplementasikan fitur **Login User** untuk project ini. Pastikan kamu mengikuti struktur folder dan *naming convention* yang telah ditentukan.

## 1. Database Schema
Ubah file skema database (di `src/db/schema.ts`) dengan menambahkan definisi tabel `sessions` dengan spesifikasi berikut:
- `id`: integer, auto increment, primary key
- `token`: varchar(255), not null (kolom ini akan berisi UUID untuk token otentikasi user)
- `user_id`: integer, not null (ini merupakan Foreign Key ke tabel `users`)
- `created_at`: timestamp, default current_timestamp

**Note:** Setelah memperbarui skema, pastikan kamu menggunakan `drizzle-kit` untuk melakukan generate dan sinkronisasi/migrasi (misalnya `bunx drizzle-kit push`) agar tabel baru ini terbuat di database MySQL.

## 2. Struktur Folder & Naming Convention
Lanjutkan penggunaan struktur folder berikut di dalam `src`:
- `src/routes/`: Untuk meletakkan file routing Elysia.js.
  - Gunakan/ubah file `users-route.ts`.
- `src/services/`: Untuk meletakkan logic bisnis aplikasi.
  - Gunakan/ubah file `users-service.ts`.

## 3. Spesifikasi API
Buat API endpoint baru untuk login user:

- **Endpoint:** `POST /api/users/login`

**Contoh Request Body (JSON):**
```json
{
    "email": "eko@gmail.com",
    "password": "rahasia"
}
```

**Contoh Response Body (Success - 200 OK):**
```json
{
    "data": "be004f14-99b8-4c99-a96c-b3b4f995874c"
}
```
*(Catatan: field "data" berisi token UUID)*

**Contoh Response Body (Error - 400 atau 401):**
```json
{
    "error": "Email atau password salah"
}
```

## 4. Step-by-Step Implementation Guide
Untuk mengimplementasikan fitur ini, ikuti urutan langkah berikut:

### Step 1: Update Skema Database
1. Buka `src/db/schema.ts`.
2. Tambahkan variabel konstanta baru untuk mengekspor tabel `sessions` menggunakan `drizzle-orm/mysql-core`. 
3. Konfigurasikan relasi *foreign key* antara kolom `user_id` di tabel `sessions` ke kolom `id` pada tabel `users`.
4. Jalankan migrasi Drizzle untuk merubah struktur tabel di database MySQL lokal.

### Step 2: Implementasi Business Logic (Service Layer)
1. Buka file `src/services/users-service.ts`.
2. Buat fungsi baru dengan nama `loginUser(payload)`.
3. Alur logic fungsi ini:
   - Ambil `email` dan `password` dari payload.
   - Query ke database tabel `users` untuk mencari user berdasarkan `email`.
   - Jika user tidak ditemukan, **lempar error** (misal: `throw new Error("Email atau password salah")`).
   - Jika user ditemukan, gunakan `bcrypt.compare` untuk mencocokkan password yang dikirim dari payload dengan `password` hasil hash yang ada di database.
   - Jika password tidak cocok, **lempar error yang sama** ("Email atau password salah"). Jangan membedakan error email dan password agar aman dari pencurian data.
   - Jika cocok, hasilkan UUID baru untuk *token* session (kamu bisa menggunakan *built-in* fungsi `crypto.randomUUID()` bawaan Bun/Node).
   - Simpan data `token` dan `user_id` tersebut ke dalam tabel `sessions` menggunakan `db.insert()`.
   - **Kembalikan** (return) token UUID tersebut.

### Step 3: Implementasi Route Handler (Routing Layer)
1. Buka file `src/routes/users-route.ts`.
2. Tambahkan *chain* `.post('/users/login', ...)` pada instance Elysia yang ada.
3. Di dalam handler route tersebut, panggil service `loginUser(body)`.
4. Gunakan blok `try-catch`:
   - Jika sukses, *return* JSON `{ "data": token_yang_didapat }`.
   - Jika gagal, tangkap error, set HTTP status (misal 401 Unauthorized atau 400 Bad Request), lalu return JSON `{ "error": "Email atau password salah" }`.
5. Terapkan validasi `t.Object` untuk body yang memastikan `email` bertipe string format email, dan `password` bertipe string.

### Step 4: Testing & Verification
1. Jalankan aplikasi dengan `bun run dev`.
2. Hit endpoint `/api/users/login` menggunakan API Client (seperti Postman, cURL, atau ekstensi REST Client di VSCode).
3. Uji ketika login berhasil (menggunakan email yang ada dan password yang benar). Pastikan respon berisikan token UUID dan data masuk ke tabel `sessions`.
4. Uji ketika login gagal (email salah atau password salah), pastikan muncul pesan `Email atau password salah`.
