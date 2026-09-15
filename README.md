# FrostyUp App Shell

Ini bukan tiruan/clone dari www.frostyup.id — ini adalah **pembungkus (app shell)** yang menampilkan website FrostyUp kamu yang asli di dalam tampilan mirip aplikasi mobile (top bar + bottom nav). Karena kontennya dimuat langsung dari `https://www.frostyup.id`, datanya **selalu real-time**, sama seperti website aslinya.

Cara kerjanya: `app/page.js` memuat halaman asli lewat `<iframe>`, dibungkus tampilan seperti app (bottom nav: Beranda, Transaksi, Bantuan, Akun).

## 1. Jalankan di lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## 2. Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit - FrostyUp app shell"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Ganti `USERNAME/NAMA-REPO` dengan repo GitHub kamu.

## 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New → Project**.
2. Pilih repo GitHub yang baru saja kamu push.
3. Framework otomatis terdeteksi sebagai **Next.js** — tidak perlu ubah setting apa pun.
4. Klik **Deploy**. Setiap kali kamu push ke GitHub, Vercel akan otomatis re-deploy.
5. (Opsional) Tambahkan domain sendiri di tab **Settings → Domains**.

## 4. Penting: soal iframe

Halaman di dalam app ini dimuat lewat `<iframe>`. Kalau suatu saat website utama (`www.frostyup.id`) diberi header `X-Frame-Options` atau `Content-Security-Policy: frame-ancestors` yang membatasi, browser akan **memblokir tampilan iframe-nya** (ini kebijakan keamanan browser, bukan masalah di kode ini). App ini sudah menyiapkan fallback otomatis: kalau halaman gagal dimuat dalam 6 detik, muncul tombol "Buka di browser".

Karena frostyup.id adalah situs Next.js milikmu sendiri, biasanya secara default **tidak** memblokir framing kecuali kamu sengaja set header tersebut — jadi seharusnya langsung jalan tanpa perlu ubah apa pun di sisi frostyup.id.

## 5. Ubah tab / halaman yang ditampilkan

Edit array `TABS` di `app/page.js`:

```js
const TABS = [
  { id: "home", label: "Beranda", path: "/id-id", icon: HomeIcon },
  { id: "invoices", label: "Transaksi", path: "/id-id/invoices", icon: ReceiptIcon },
  { id: "contact", label: "Bantuan", path: "/id-id/contact-us", icon: ChatIcon },
  { id: "account", label: "Akun", path: "/id-id/sign-in", icon: UserIcon },
];
```

Tambah, hapus, atau ganti `path` sesuai halaman yang ada di website kamu.

## 6. Ganti ikon aplikasi

`public/icon-192.png` dan `public/icon-512.png` saat ini masih ikon placeholder (❄ sederhana). Ganti dengan logo FrostyUp asli (ukuran sama) supaya saat di-"Add to Home Screen" dari HP, ikonnya sesuai brand.

## 7. "Add to Home Screen" di Android & iOS

Ini bukan aplikasi yang didaftarkan ke Play Store/App Store — pengguna install-nya langsung dari browser, jadi **tidak butuh akun developer atau proses review sama sekali**. Sudah disiapkan otomatis:

- **Android (Chrome):** setelah deploy, pengunjung akan lihat banner "Pasang FrostyUp di layar utama HP-mu" dengan tombol **Install** — sekali tap, langsung terpasang seperti app biasa (ada ikon sendiri, buka tanpa address bar).
- **iOS (Safari):** Safari tidak punya tombol install otomatis, jadi banner-nya menunjukkan cara manual: tap ikon **Share**, lalu pilih **"Add to Home Screen"**.
- Banner otomatis hilang setelah pengunjung install atau menutupnya (disimpan di `localStorage`, jadi tidak muncul berulang di kunjungan berikutnya di HP yang sama).
- Setelah dipasang, aplikasi terbuka full-screen tanpa address bar (`display: standalone`) dan pakai ikon `public/icon-192.png` / `icon-512.png` — ganti file itu dengan logo FrostyUp asli sebelum deploy final.
