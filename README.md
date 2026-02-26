# Fincast 💰

Personal Finance & Forecasting App — Next.js + MySQL

## Stack
- **Frontend**: Next.js 14 (App Router), Recharts
- **Backend**: Next.js API Routes
- **Database**: MySQL 8+
- **Auth**: JWT via httpOnly cookie + bcrypt

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup MySQL
Jalankan file `schema.sql` di MySQL:
```bash
mysql -u root -p < schema.sql
```

### 3. Environment variables
Copy `.env.local` dan isi sesuai konfigurasi:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fincast
JWT_SECRET=your-random-secret-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Jalankan dev server
```bash
npm run dev
```

Buka http://localhost:3000 — akan redirect ke `/login`.

---

## Fitur
- ✅ Register / Login / Logout
- ✅ Forgot Password (generate reset token, integrasikan email sender sendiri)
- ✅ Data per user (MySQL, relasi user_id)
- ✅ Dashboard: stat cards, bar chart harian, bar chart vs budget, pie chart komposisi
- ✅ Pencatatan transaksi (income/expense) dengan format tanggal dd/Bln/Tahun
- ✅ Budget tracking per kategori
- ✅ Forecast bulan berjalan + input manual per kategori
- ✅ Light/Dark mode

---

## Forgot Password — Email Setup
Di `app/api/auth/forgot-password/route.js`, tambahkan email sender pilihanmu:

**Dengan Nodemailer (SMTP):**
```bash
npm install nodemailer
```
```js
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({ host: '...', auth: { user, pass } });
await transporter.sendMail({
  to: email,
  subject: 'Reset Password Fincast',
  html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">Reset Password</a>`
});
```

**Dengan Resend:**
```bash
npm install resend
```
```js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({ from: '...', to: email, subject: '...', html: '...' });
```
