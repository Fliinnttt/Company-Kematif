const header = document.querySelector("header");
      let tinggiHeader = header.offsetHeight;

      window.addEventListener("resize", () => {
        tinggiHeader = header.offsetHeight;
      });

      window.addEventListener("scroll", () => {
        const posisiScroll = window.scrollY;

        if (posisiScroll <= tinggiHeader) {
          header.style.transition = "none";
          header.style.transform = `translateY(-${posisiScroll}px)`;
          header.classList.remove("muncul");
        } else {
          header.style.transition =
            "transform 0.35s ease, box-shadow 0.35s ease";
          header.style.transform = "translateY(0)";
          header.classList.add("muncul");
        }
      });

      /* ===== Hamburger menu ===== */
      const menuToggle = document.getElementById("menuToggle");
      const navMenu = document.getElementById("navMenu");

      function setMenu(buka) {
        navMenu.classList.toggle("active", buka);
        menuToggle.textContent = buka ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", buka);
        tinggiHeader = header.offsetHeight;
      }

      menuToggle.addEventListener("click", () => {
        setMenu(!navMenu.classList.contains("active"));
      });

      navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
      });

      document.addEventListener("click", (e) => {
        if (!header.contains(e.target)) setMenu(false);
      });



/* ============================================================
   Halaman Keuangan Anggota — js/keuangan-anggota.js
   Data transaksi kas + ringkasan, filter, dan tabel riwayat.
   ============================================================ */
(function () {
    "use strict";

    /* ---------- DATA ----------
       Data di bawah ini CONTOH. Ganti dengan transaksi kas yang sebenarnya.
       - tanggal : format YYYY-MM-DD
       - jenis   : "Pemasukan" atau "Pengeluaran"
       - kategori: "Iuran", "Operasional", atau "Kegiatan"
    */
    var PER_TANGGAL = "2026-10-29"; // tanggal saldo ditampilkan

    var transaksi = [
        { tanggal: "2026-10-28", keterangan: "Iuran kas bulanan angkatan 2025",     kategori: "Iuran",       jenis: "Pemasukan",   nominal: 1200000 },
        { tanggal: "2026-10-25", keterangan: "Konsumsi rapat koordinasi pengurus",  kategori: "Operasional", jenis: "Pengeluaran", nominal: 350000 },
        { tanggal: "2026-10-20", keterangan: "Pendaftaran Turnamen KEMATIF",        kategori: "Kegiatan",    jenis: "Pemasukan",   nominal: 2500000 },
        { tanggal: "2026-10-18", keterangan: "Cetak banner dan dokumentasi acara",  kategori: "Kegiatan",    jenis: "Pengeluaran", nominal: 800000 },
        { tanggal: "2026-10-10", keterangan: "Iuran kas bulanan angkatan 2024",     kategori: "Iuran",       jenis: "Pemasukan",   nominal: 1000000 },
        { tanggal: "2026-09-28", keterangan: "Iuran kas bulanan angkatan 2023",     kategori: "Iuran",       jenis: "Pemasukan",   nominal: 1500000 },
        { tanggal: "2026-09-20", keterangan: "Konsumsi pelatihan kepemimpinan",     kategori: "Kegiatan",    jenis: "Pengeluaran", nominal: 750000 },
        { tanggal: "2026-09-15", keterangan: "Dana sponsor kegiatan himpunan",      kategori: "Kegiatan",    jenis: "Pemasukan",   nominal: 2200000 },
        { tanggal: "2026-09-12", keterangan: "Perlengkapan sekretariat",            kategori: "Operasional", jenis: "Pengeluaran", nominal: 600000 },
        { tanggal: "2026-09-05", keterangan: "Biaya domain dan hosting website",    kategori: "Operasional", jenis: "Pengeluaran", nominal: 650000 }
    ];

    /* Target dana kegiatan (CONTOH) — dipakai bar target di bagian grafik.
       Ganti nama dan nominal sesuai target dana yang sebenarnya. */
    var TARGET_DANA = { nama: "Dana Turnamen KEMATIF", nominal: 6000000, kategori: "Kegiatan" };

    // Dibagikan ke js/grafik.js
    window.DATA_KEUANGAN = { transaksi: transaksi, perTanggal: PER_TANGGAL, target: TARGET_DANA };

    /* ---------- FUNGSI BANTU ---------- */
    var BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    function rupiah(n) {
        return "Rp " + n.toLocaleString("id-ID");
    }

    function tanggalPendek(iso) {
        var p = iso.split("-");
        return Number(p[2]) + " " + BULAN_PENDEK[Number(p[1]) - 1] + " " + p[0];
    }

    function tanggalPanjang(iso) {
        var p = iso.split("-");
        return Number(p[2]) + " " + BULAN_PANJANG[Number(p[1]) - 1] + " " + p[0];
    }

    function buatEl(tag, kelas, teks) {
        var el = document.createElement(tag);
        if (kelas) el.className = kelas;
        if (teks !== undefined) el.textContent = teks;
        return el;
    }

    /* ---------- ELEMEN HALAMAN ---------- */
    var tbody = document.getElementById("isi-tabel");
    var jumlah = document.getElementById("jumlah");
    var form = document.getElementById("form-filter");
    var inputPeriode = document.getElementById("periode");
    var inputKategori = document.getElementById("kategori");

    // Terbaru di atas
    transaksi.sort(function (a, b) { return a.tanggal < b.tanggal ? 1 : -1; });

    /* ---------- RINGKASAN (dihitung dari seluruh transaksi) ---------- */
    function tampilkanRingkasan() {
        var masuk = 0, keluar = 0;

        transaksi.forEach(function (t) {
            if (t.jenis === "Pemasukan") masuk += t.nominal;
            else keluar += t.nominal;
        });

        document.getElementById("saldo").textContent = rupiah(masuk - keluar);
        document.getElementById("total-pemasukan").textContent = rupiah(masuk);
        document.getElementById("total-pengeluaran").textContent = rupiah(keluar);
        document.getElementById("per-tanggal").textContent = "Per " + tanggalPanjang(PER_TANGGAL);
    }

    /* ---------- TABEL RIWAYAT ---------- */
    function tampilkanTabel(daftar) {
        tbody.textContent = "";

        if (daftar.length === 0) {
            var tr = buatEl("tr");
            var td = buatEl("td", "kosong");
            td.colSpan = 5;
            td.appendChild(buatEl("strong", "", "Transaksi tidak ditemukan"));
            td.appendChild(document.createTextNode("Coba ubah periode atau kategori yang dipilih."));
            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        daftar.forEach(function (t) {
            var masuk = t.jenis === "Pemasukan";
            var tr = buatEl("tr");

            tr.appendChild(buatEl("td", "tanggal", tanggalPendek(t.tanggal)));
            tr.appendChild(buatEl("td", "", t.keterangan));
            tr.appendChild(buatEl("td", "kategori", t.kategori));

            var tdJenis = buatEl("td");
            tdJenis.appendChild(buatEl("span", "pill " + (masuk ? "jenis-masuk" : "jenis-keluar"), t.jenis));
            tr.appendChild(tdJenis);

            tr.appendChild(buatEl("td", "nominal " + (masuk ? "masuk" : "keluar"),
                (masuk ? "+ " : "- ") + rupiah(t.nominal)));

            tbody.appendChild(tr);
        });

        jumlah.textContent = daftar.length + " Transaksi";
    }

    /* ---------- FILTER ---------- */
    function terapkan() {
        var periode = inputPeriode.value;                 // "YYYY-MM" atau kosong
        var kategori = inputKategori.value.toLowerCase(); // "iuran" | "operasional" | "kegiatan" | ""

        var hasil = transaksi.filter(function (t) {
            return (!periode || t.tanggal.indexOf(periode) === 0) &&
                   (!kategori || t.kategori.toLowerCase() === kategori);
        });

        tampilkanTabel(hasil);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        terapkan();
        document.getElementById("riwayat").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    inputPeriode.addEventListener("change", terapkan);
    inputKategori.addEventListener("change", terapkan);

    // tombol Reset: kosongkan pilihan lalu tampilkan semua transaksi
    form.addEventListener("reset", function () {
        setTimeout(terapkan, 0);
    });

    /* ---------- MULAI ---------- */
    tampilkanRingkasan();
    tampilkanTabel(transaksi);
})();
