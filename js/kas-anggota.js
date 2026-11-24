/* ============================================================
   Halaman Kas Anggota — js/kas-anggota.js
   Data kas anggota + tabel, ringkasan, dan pencarian.
   ============================================================ */
(function () {
    "use strict";

    /* ---------- DATA ----------
       Data di bawah ini CONTOH. Ganti dengan data anggota yang sebenarnya.
       - bulanTunggak : jumlah bulan iuran yang belum dibayar (0 = lunas)
       - keterangan   : catatan/angkatan, ikut dicari lewat kolom "Keterangan"
    */
    var IURAN_PER_BULAN = 10000; // Rp per bulan

    var anggota = [
        { nama: "Ahmad Fauzi Ramadhan", nim: "E41231004", bulanTunggak: 0, keterangan: "Angkatan 2023" },
        { nama: "Siti Nurhaliza",       nim: "E41231017", bulanTunggak: 0, keterangan: "Angkatan 2023" },
        { nama: "Rizky Pratama",        nim: "E41231026", bulanTunggak: 4, keterangan: "Angkatan 2023, belum konfirmasi" },
        { nama: "Dewi Anggraini",       nim: "E41241008", bulanTunggak: 0, keterangan: "Angkatan 2024" },
        { nama: "Bagus Setiawan",       nim: "E41241013", bulanTunggak: 1, keterangan: "Angkatan 2024" },
        { nama: "Putri Maharani",       nim: "E41241022", bulanTunggak: 0, keterangan: "Angkatan 2024" },
        { nama: "Dimas Aditya",         nim: "E41241035", bulanTunggak: 3, keterangan: "Angkatan 2024, akan melunasi akhir bulan" },
        { nama: "Nabila Zahra",         nim: "E41241041", bulanTunggak: 0, keterangan: "Angkatan 2024" },
        { nama: "Fajar Nugroho",        nim: "E41251003", bulanTunggak: 2, keterangan: "Angkatan 2025" },
        { nama: "Rina Wulandari",       nim: "E41251011", bulanTunggak: 0, keterangan: "Angkatan 2025" },
        { nama: "Yoga Prakoso",         nim: "E41251019", bulanTunggak: 0, keterangan: "Angkatan 2025" },
        { nama: "Salsabila Putri",      nim: "E41251027", bulanTunggak: 1, keterangan: "Angkatan 2025" },
        { nama: "Hendra Kurniawan",     nim: "E41251034", bulanTunggak: 5, keterangan: "Angkatan 2025, cuti semester ini" },
        { nama: "Anisa Rahmawati",      nim: "E41251042", bulanTunggak: 0, keterangan: "Angkatan 2025" }
    ];

    /* ---------- FUNGSI BANTU ---------- */
    function rupiah(n) {
        return "Rp " + n.toLocaleString("id-ID");
    }

    // 0 bulan = Lunas, 1-2 bulan = Belum Lunas, 3 bulan atau lebih = Menunggak
    function statusDari(bulan) {
        if (bulan === 0) return { teks: "Lunas", kelas: "status-lunas" };
        if (bulan <= 2) return { teks: "Belum Lunas", kelas: "status-belum" };
        return { teks: "Menunggak", kelas: "status-menunggak" };
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
    var ringkasan = document.getElementById("ringkasan-kas");
    var form = document.getElementById("form-cari");
    var inputNama = document.getElementById("nama");
    var inputNim = document.getElementById("nim");
    var inputCatatan = document.getElementById("catatan");

    // Urutkan berdasarkan nama
    anggota.sort(function (a, b) { return a.nama.localeCompare(b.nama, "id"); });

    /* ---------- RINGKASAN (dihitung dari seluruh data) ---------- */
    function tampilkanRingkasan() {
        var lunas = 0, belum = 0, menunggak = 0, totalTunggakan = 0;

        anggota.forEach(function (a) {
            var s = statusDari(a.bulanTunggak).kelas;
            if (s === "status-lunas") lunas++;
            else if (s === "status-belum") belum++;
            else menunggak++;
            totalTunggakan += a.bulanTunggak * IURAN_PER_BULAN;
        });

        var kartu = [
            { kelas: "",        label: "Total Anggota",   nilai: anggota.length + " orang" },
            { kelas: "lunas",   label: "Lunas",           nilai: lunas + " orang" },
            { kelas: "belum",   label: "Belum Lunas",     nilai: (belum + menunggak) + " orang" },
            { kelas: "tunggak", label: "Total Tunggakan", nilai: rupiah(totalTunggakan) }
        ];

        ringkasan.textContent = "";
        kartu.forEach(function (k) {
            var div = buatEl("div", k.kelas);
            div.appendChild(buatEl("span", "", k.label));
            div.appendChild(buatEl("strong", "", k.nilai));
            ringkasan.appendChild(div);
        });
    }

    /* ---------- TABEL ---------- */
    function tampilkanTabel(daftar) {
        tbody.textContent = "";

        if (daftar.length === 0) {
            var tr = buatEl("tr");
            var td = buatEl("td", "kosong");
            td.colSpan = 4;
            td.appendChild(buatEl("strong", "", "Data anggota tidak ditemukan"));
            td.appendChild(document.createTextNode("Coba ubah nama, NIM, atau keterangan yang dicari."));
            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        daftar.forEach(function (a) {
            var status = statusDari(a.bulanTunggak);
            var tunggakan = a.bulanTunggak * IURAN_PER_BULAN;
            var tr = buatEl("tr");

            tr.appendChild(buatEl("td", "", a.nama));
            tr.appendChild(buatEl("td", "nim", a.nim));

            var tdStatus = buatEl("td");
            tdStatus.appendChild(buatEl("span", "pill " + status.kelas, status.teks));
            tr.appendChild(tdStatus);

            tr.appendChild(buatEl("td", "nominal" + (tunggakan === 0 ? " nol" : ""), rupiah(tunggakan)));
            tbody.appendChild(tr);
        });

        jumlah.textContent = daftar.length + " Anggota";
    }

    /* ---------- PENCARIAN ---------- */
    function cari() {
        var nama = inputNama.value.trim().toLowerCase();
        var nim = inputNim.value.trim().toLowerCase();
        var catatan = inputCatatan.value.trim().toLowerCase();

        var hasil = anggota.filter(function (a) {
            return a.nama.toLowerCase().indexOf(nama) !== -1 &&
                   a.nim.toLowerCase().indexOf(nim) !== -1 &&
                   a.keterangan.toLowerCase().indexOf(catatan) !== -1;
        });

        tampilkanTabel(hasil);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        cari();
        document.getElementById("daftar").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // hasil ikut berubah saat mengetik
    [inputNama, inputNim, inputCatatan].forEach(function (el) {
        el.addEventListener("input", cari);
    });

    // tombol Reset: kosongkan isian lalu tampilkan semua data
    form.addEventListener("reset", function () {
        setTimeout(cari, 0);
    });

    /* ---------- MULAI ---------- */
    tampilkanRingkasan();
    tampilkanTabel(anggota);
})();
