/* ============================================================
   Data kegiatan KEMATIF — js/data-kegiatan.js
   Dipakai bersama oleh: kegiatan-anggota.html (daftar + kalender),
   beranda-anggota.html (hitung mundur), dan struktur.html (timeline).
   Data di bawah ini CONTOH — ganti dengan kegiatan yang sebenarnya.

   - tanggal : YYYY-MM-DD        - jam : "HH.MM WIB"
   - divisi  : id divisi penanggung jawab (kahim, sekre, bendahara, kwu,
               kominfo, psdm, humas) — dipakai timeline di struktur.html
   ============================================================ */
window.KEGIATAN_KEMATIF = [
  {
    id: 1,
    judul: "Turnamen Kematif",
    tema: "t1",
    status: "soon",
    divisi: "kwu",
    tanggal: "2026-12-06",
    jam: "08.00 WIB",
    tempat: "Lapangan Jurusan TI",
    foto: 'assets/kegiatan anggota/turnamen-kematif.jpeg',
    ket: "Kompetisi dan kegiatan bersama anggota. Terbuka untuk seluruh angkatan.",
  },
  {
    id: 2,
    judul: "Rapat Koordinasi Pengurus",
    tema: "t2",
    status: "now",
    divisi: "sekre",
    tanggal: "2026-11-23",
    jam: "15.00 WIB",
    tempat: "Ruang Himpunan",
    foto: 'assets/kegiatan anggota/rapat-koordinasi-pengurus.jpeg',
    ket: "Evaluasi program kerja bulanan dan pembagian tugas antar divisi.",
  },
  {
    id: 3,
    judul: "Pelatihan Kepemimpinan",
    tema: "t3",
    status: "soon",
    divisi: "psdm",
    tanggal: "2026-12-13",
    jam: "09.00 WIB",
    tempat: "Aula Gedung TI",
    foto: 'assets/kegiatan anggota/pelatihan-kepemimpinan.webp',
    ket: "Pengembangan keterampilan kepemimpinan dan manajemen organisasi.",
  },
  {
    id: 4,
    judul: "Penyerahan Penghargaan",
    tema: "t4",
    status: "done",
    divisi: "kahim",
    tanggal: "2026-10-30",
    jam: "13.00 WIB",
    tempat: "Aula Gedung TI",
    foto: 'assets/kegiatan anggota/penyerahan-penghargaan.png',
    ket: "Momen apresiasi dan pengakuan prestasi anggota.",
  },
  {
    id: 5,
    judul: "Kegiatan Kebersamaan",
    tema: "t5",
    status: "done",
    divisi: "humas",
    tanggal: "2026-10-18",
    jam: "07.30 WIB",
    tempat: "Kebun Raya Jember",
    foto: 'assets/kegiatan anggota/kegiatan-kebersamaan.png',
    ket: "Aktivitas yang memperkuat ikatan antar anggota.",
  },
  {
    id: 6,
    judul: "Workshop Desain Aplikasi",
    tema: "t6",
    status: "done",
    divisi: "kominfo",
    tanggal: "2026-10-04",
    jam: "10.00 WIB",
    tempat: "Laboratorium Komputer",
    foto: 'assets/kegiatan anggota/wda-anggota.jpeg',
    ket: "Belajar merancang antarmuka aplikasi bersama dari dasar.",
  },
];
