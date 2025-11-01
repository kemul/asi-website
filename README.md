# Website EduASI
Website edukasi ASI (multi-halaman) dengan modul video, pre-test/post-test BSES-SF, dan ringkasan hasil.

## Struktur
- `index.html` — Beranda & alur
- `modul.html` — Daftar modul video
- `pretest.html` — Form pre-test BSES-SF
- `posttest.html` — Form post-test BSES-SF
- `hasil.html` — Ringkasan skor & ekspor CSV
- `kontak.html` — Kontak WhatsApp & info
- `style.css`, `app.js` — Berkas bersama

## Hosting gratis
### GitHub Pages
1. Buat repo baru, unggah semua berkas ini.
2. Settings → Pages → Source: `main` → `/root` → Save.
3. Akses situs: `https://<username>.github.io/<repo>/`

### Vercel
1. Import repo → Framework: `Other` → Deploy.
2. Situs aktif di `https://<project>.vercel.app`

> Data hanya tersimpan pada `localStorage` browser pengguna.

## Skor
- Skala: STY=1, TY=2, KY=3, Y=4, SY=5
- Total maksimum: 12 × 5 = 60
- Δ = Post − Pre
