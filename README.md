# Company Profile KEMATIF

Website company profile **Himpunan Prodi Keluarga Mahasiswa Teknik Informatika (KEMATIF)**, Politeknik Negeri Jember.

## Cara membuka
Buka `index.html` di browser. Tidak perlu instalasi apa pun.

## Struktur folder
```
├─ index.html              Beranda (semua pengguna)
├─ login.html              Login anggota
├─ struktur.html           Struktur anggota
├─ beranda-anggota.html    Beranda anggota (setelah login)
├─ kas-anggota.html        Kas anggota
├─ keuangan-anggota.html   Keuangan organisasi
├─ css/
│  ├─ kalender.css, grafik.css, proker.css   Gaya fitur baru
│  ├─ beranda.css          Gaya index.html
│  ├─ beranda-anggota.css  Gaya beranda-anggota.html
│  ├─ kas-anggota.css      Gaya kas-anggota.html
│  ├─ keuangan-anggota.css Gaya keuangan-anggota.html
│  └─ login.css            Gaya login.html
├─ js/
│  ├─ data-kegiatan.js     Data kegiatan bersama (kalender, hitung mundur, timeline)
│  ├─ kalender.js          Kalender bulanan, hitung mundur, unduh .ics
│  ├─ grafik.js            Grafik keuangan dan kas (SVG)
│  ├─ proker.js            Timeline program kerja + kartu divisi flip
│  ├─ kas-anggota.js       Data + pencarian kas anggota (data contoh)
│  └─ keuangan-anggota.js  Data + filter transaksi keuangan (data contoh)
└─ assets/
   ├─ logo-kematif.png
   ├─ beranda/             Gambar utama beranda
   ├─ acara/               Gambar bagian Acara
   ├─ divisi/              Foto divisi (kahim, sekretaris, bendahara, kwu, kominfo, psdm, humas, kabinet)
   └─ anggota/             Gambar Beranda Anggota (keuangan.jpg, kegiatan.jpg — belum ada)
```

## Alur halaman
Beranda → Login → Beranda Anggota → Kas Anggota / Keuangan Anggota.
Halaman Struktur dapat dibuka dari Beranda tanpa login.
