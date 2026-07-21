# Hard Motion

Hard Motion adalah aplikasi inventory berbasis **React + Vite + TypeScript** untuk mengelola produk, stok masuk/keluar, riwayat transaksi, dashboard, laporan, pengaturan, dark mode, dan instalasi PWA.

## Teknologi

- React, Vite, TypeScript
- Tailwind CSS
- vite-plugin-pwa
- React Router
- Dexie / IndexedDB
- React Hook Form + Zod
- Recharts

## Fitur

- Dashboard: total produk, total stok, barang hampir habis, grafik stok, aktivitas terbaru.
- Produk: CRUD, upload foto, barcode, SKU, kategori, merek, ukuran, warna, harga modal, harga jual, stok minimum.
- Barang Masuk dan Barang Keluar.
- Riwayat transaksi.
- Laporan: export Excel-compatible CSV dan export PDF via print browser.
- Pengaturan dan dark mode.
- Responsive untuk HP dan laptop.
- Installable sebagai PWA.

## Struktur

```text
src/
  components/
  pages/
  hooks/
  services/
  db/
  types/
  utils/
  layouts/
  assets/
```

## Menjalankan Aplikasi

```bash
npm install
npm run build
npm run dev
```

Build production akan tersedia di folder `dist/`.
