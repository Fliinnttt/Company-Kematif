/* ============================================================
   Kalender & hitung mundur kegiatan — js/kalender.js
   Butuh js/data-kegiatan.js (window.KEGIATAN_KEMATIF).
   - #hitung-mundur      : penghitung mundur ke kegiatan berikutnya
   - #kalender-kegiatan  : kalender bulanan + unduh .ics
   Murni HTML + CSS + JS, tanpa library.
   ============================================================ */
(function () {
    "use strict";

    var DATA = window.KEGIATAN_KEMATIF || [];
    var DURASI_JAM = 2; // data belum punya jam selesai, jadi file .ics memakai durasi ini

    var BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var HARI_PENDEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    var HARI_PANJANG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    var STATUS = { soon: "Akan datang", now: "Berlangsung", done: "Selesai" };

    /* ---------- FUNGSI BANTU ---------- */
    function pad(n) { return String(n).padStart(2, "0"); }

    function el(tag, kelas, teks) {
        var e = document.createElement(tag);
        if (kelas) e.className = kelas;
        if (teks !== undefined) e.textContent = teks;
        return e;
    }

    function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

    // "08.00 WIB" + "2026-12-06" -> Date (WIB = UTC+7, tidak bergantung zona waktu perangkat)
    function mulai(k) {
        var m = String(k.jam).match(/(\d{1,2})[.:](\d{2})/);
        var jam = m ? pad(m[1]) : "00";
        var menit = m ? m[2] : "00";
        return new Date(k.tanggal + "T" + jam + ":" + menit + ":00+07:00");
    }

    function tglPanjang(isoStr) {
        var p = isoStr.split("-");
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        return HARI_PANJANG[d.getDay()] + ", " + Number(p[2]) + " " + BULAN[Number(p[1]) - 1] + " " + p[0];
    }

    /* ---------- FILE .ICS ---------- */
    function utc(d) {
        return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
            pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
    }

    function esc(t) {
        return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    }

    // Aturan iCalendar: satu baris maksimal 75 karakter, lanjutannya diawali spasi
    function lipat(baris) {
        var hasil = [];
        while (baris.length > 73) {
            hasil.push(baris.slice(0, 73));
            baris = " " + baris.slice(73);
        }
        hasil.push(baris);
        return hasil;
    }

    function buatIcs(daftar) {
        var sekarang = utc(new Date());
        var baris = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//KEMATIF//Kalender Kegiatan//ID",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:Kegiatan KEMATIF"
        ];
        daftar.forEach(function (k) {
            var awal = mulai(k);
            var akhir = new Date(awal.getTime() + DURASI_JAM * 3600 * 1000);
            baris.push(
                "BEGIN:VEVENT",
                "UID:kematif-" + k.id + "-" + k.tanggal + "@kematif.local",
                "DTSTAMP:" + sekarang,
                "DTSTART:" + utc(awal),
                "DTEND:" + utc(akhir),
                "SUMMARY:" + esc(k.judul),
                "LOCATION:" + esc(k.tempat),
                "DESCRIPTION:" + esc(k.ket),
                "END:VEVENT"
            );
        });
        baris.push("END:VCALENDAR");
        var keluar = [];
        baris.forEach(function (b) { keluar = keluar.concat(lipat(b)); });
        return keluar.join("\r\n") + "\r\n";
    }

    function unduh(namaFile, daftar) {
        var blob = new Blob([buatIcs(daftar)], { type: "text/calendar;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = namaFile;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

    function tombolIcs(k, kelas) {
        var b = el("button", kelas || "kal-btn", "Tambah ke kalender");
        b.type = "button";
        b.title = "Unduh file .ics untuk Google Calendar, Apple Calendar, atau Outlook";
        b.addEventListener("click", function () { unduh("kematif-" + slug(k.judul) + ".ics", [k]); });
        return b;
    }

    /* ---------- HITUNG MUNDUR ---------- */
    function hitungMundur(wadah) {
        var timer = null;

        function berikutnya() {
            var sekarang = Date.now();
            return DATA
                .filter(function (k) { return mulai(k).getTime() > sekarang; })
                .sort(function (a, b) { return mulai(a) - mulai(b); })[0];
        }

        function gambar() {
            clearInterval(timer);
            var k = berikutnya();
            var kotak = el("div", "hm");

            if (!k) {
                kotak.classList.add("kosong");
                kotak.appendChild(el("strong", "", "Belum ada kegiatan mendatang"));
                kotak.appendChild(el("p", "", "Pantau halaman ini, agenda baru akan muncul di sini."));
                wadah.replaceChildren(kotak);
                return;
            }

            var info = el("div", "hm-info");
            info.appendChild(el("span", "hm-tag", "Kegiatan berikutnya"));
            info.appendChild(el("h3", "", k.judul));
            info.appendChild(el("p", "", tglPanjang(k.tanggal) + " · " + k.jam + " · " + k.tempat));

            var aksi = el("div", "hm-aksi");
            aksi.appendChild(tombolIcs(k, "kal-btn terang"));
            var tautan = wadah.getAttribute("data-tautan");
            if (tautan) {
                var a = el("a", "kal-btn garis", "Lihat kalender");
                a.href = tautan;
                aksi.appendChild(a);
            }
            info.appendChild(aksi);

            var waktu = el("div", "hm-waktu");
            waktu.setAttribute("role", "timer");
            var angka = {};
            [["hari", "Hari"], ["jam", "Jam"], ["menit", "Menit"], ["detik", "Detik"]].forEach(function (u) {
                var sel = el("div", "hm-sel");
                var b = el("b", "", "00");
                sel.append(b, el("span", "", u[1]));
                waktu.appendChild(sel);
                angka[u[0]] = b;
            });

            kotak.append(info, waktu);
            wadah.replaceChildren(kotak);

            var target = mulai(k).getTime();
            function tik() {
                var sisa = Math.floor((target - Date.now()) / 1000);
                if (sisa <= 0) { gambar(); return; } // pindah ke kegiatan berikutnya
                angka.hari.textContent = Math.floor(sisa / 86400);
                angka.jam.textContent = pad(Math.floor(sisa % 86400 / 3600));
                angka.menit.textContent = pad(Math.floor(sisa % 3600 / 60));
                angka.detik.textContent = pad(sisa % 60);
            }
            tik();
            timer = setInterval(tik, 1000);
        }

        gambar();
    }

    /* ---------- KALENDER ---------- */
    function kalender(wadah) {
        var hariIni = iso(new Date());
        var sekarang = new Date();
        var tahun = sekarang.getFullYear();
        var bulan = sekarang.getMonth();
        var terpilih = hariIni;

        function perTanggal() {
            var peta = {};
            DATA.forEach(function (k) {
                (peta[k.tanggal] = peta[k.tanggal] || []).push(k);
            });
            Object.keys(peta).forEach(function (t) {
                peta[t].sort(function (a, b) { return mulai(a) - mulai(b); });
            });
            return peta;
        }

        function pindah(selisih) {
            bulan += selisih;
            if (bulan < 0) { bulan = 11; tahun--; }
            if (bulan > 11) { bulan = 0; tahun++; }
            terpilih = null;
            gambar();
        }

        function pilih(tgl) {
            terpilih = tgl;
            gambar();
            var sel = wadah.querySelector('[data-tgl="' + tgl + '"]');
            if (sel) sel.focus();
        }

        function kartuKegiatan(k) {
            var kartu = el("article", "kal-acara " + k.status);
            kartu.appendChild(el("span", "kal-jam", k.jam));
            var isi = el("div", "kal-acara-isi");
            isi.appendChild(el("h4", "", k.judul));
            isi.appendChild(el("p", "", k.tempat));
            var baris = el("div", "kal-acara-baris");
            baris.appendChild(el("em", "kal-status " + k.status, STATUS[k.status] || ""));
            baris.appendChild(tombolIcs(k));
            isi.appendChild(baris);
            kartu.appendChild(isi);
            return kartu;
        }

        function gambar() {
            var peta = perTanggal();
            var kotak = el("div", "kal");

            /* kepala: navigasi bulan */
            var kepala = el("div", "kal-kepala");
            var nav = el("div", "kal-nav");
            var prev = el("button", "kal-ikon", "‹");
            prev.type = "button";
            prev.setAttribute("aria-label", "Bulan sebelumnya");
            prev.addEventListener("click", function () { pindah(-1); });
            var next = el("button", "kal-ikon", "›");
            next.type = "button";
            next.setAttribute("aria-label", "Bulan berikutnya");
            next.addEventListener("click", function () { pindah(1); });
            var judul = el("h3", "kal-judul", BULAN[bulan] + " " + tahun);
            judul.setAttribute("aria-live", "polite");
            nav.append(prev, judul, next);

            var aksi = el("div", "kal-aksi");
            var btnHariIni = el("button", "kal-btn garis", "Hari ini");
            btnHariIni.type = "button";
            btnHariIni.addEventListener("click", function () {
                var n = new Date();
                tahun = n.getFullYear();
                bulan = n.getMonth();
                terpilih = hariIni;
                gambar();
            });
            var btnSemua = el("button", "kal-btn", "Unduh semua (.ics)");
            btnSemua.type = "button";
            btnSemua.addEventListener("click", function () { unduh("kegiatan-kematif.ics", DATA); });
            aksi.append(btnHariIni, btnSemua);
            kepala.append(nav, aksi);

            /* grid tanggal */
            var grid = el("div", "kal-grid");
            HARI_PENDEK.forEach(function (h) { grid.appendChild(el("div", "kal-hari-nama", h)); });

            var awal = (new Date(tahun, bulan, 1).getDay() + 6) % 7; // Senin = 0
            var jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
            for (var i = 0; i < awal; i++) grid.appendChild(el("div", "kal-kosong"));

            var bulanIni = [];
            for (var d = 1; d <= jumlahHari; d++) {
                var tgl = tahun + "-" + pad(bulan + 1) + "-" + pad(d);
                var daftar = peta[tgl] || [];
                var sel = el("button", "kal-sel");
                sel.type = "button";
                sel.setAttribute("data-tgl", tgl);
                if (daftar.length) { sel.classList.add("ada"); bulanIni = bulanIni.concat(daftar); }
                if (tgl === hariIni) sel.classList.add("hari-ini");
                if (tgl === terpilih) { sel.classList.add("dipilih"); sel.setAttribute("aria-pressed", "true"); }
                sel.setAttribute("aria-label", tglPanjang(tgl) + (daftar.length ? ", " + daftar.length + " kegiatan" : ""));
                sel.appendChild(el("span", "kal-angka", String(d)));
                if (daftar.length) {
                    var titik = el("span", "kal-titik");
                    daftar.slice(0, 3).forEach(function (k) { titik.appendChild(el("i", k.status)); });
                    sel.appendChild(titik);
                }
                (function (t) { sel.addEventListener("click", function () { pilih(t); }); })(tgl);
                grid.appendChild(sel);
            }

            var legenda = el("ul", "kal-legenda");
            [["soon", "Akan datang"], ["now", "Berlangsung"], ["done", "Selesai"]].forEach(function (l) {
                var li = el("li");
                li.append(el("i", l[0]), document.createTextNode(l[1]));
                legenda.appendChild(li);
            });

            var kiri = el("div", "kal-kiri");
            kiri.append(kepala, grid, legenda);

            /* panel kanan: detail tanggal + daftar bulan ini */
            var kanan = el("aside", "kal-panel");
            if (terpilih) {
                kanan.appendChild(el("h4", "kal-panel-judul", tglPanjang(terpilih)));
                var hariDipilih = peta[terpilih] || [];
                if (hariDipilih.length) {
                    hariDipilih.forEach(function (k) { kanan.appendChild(kartuKegiatan(k)); });
                } else {
                    kanan.appendChild(el("p", "kal-kosong-teks", "Tidak ada kegiatan pada tanggal ini."));
                }
            } else {
                kanan.appendChild(el("h4", "kal-panel-judul", "Pilih tanggal"));
                kanan.appendChild(el("p", "kal-kosong-teks", "Klik tanggal bertanda titik untuk melihat detail kegiatan."));
            }

            var judulBulan = el("h4", "kal-panel-judul kecil", "Agenda " + BULAN[bulan]);
            kanan.appendChild(judulBulan);
            if (bulanIni.length) {
                var ul = el("ul", "kal-agenda");
                bulanIni.sort(function (a, b) { return mulai(a) - mulai(b); }).forEach(function (k) {
                    var li = el("li");
                    var b = el("button", "kal-agenda-btn");
                    b.type = "button";
                    b.appendChild(el("i", k.status));
                    b.appendChild(el("span", "", Number(k.tanggal.slice(8)) + " " + BULAN[bulan].slice(0, 3)));
                    b.appendChild(el("strong", "", k.judul));
                    b.addEventListener("click", function () { pilih(k.tanggal); });
                    li.appendChild(b);
                    ul.appendChild(li);
                });
                kanan.appendChild(ul);
            } else {
                kanan.appendChild(el("p", "kal-kosong-teks", "Belum ada kegiatan di bulan ini."));
            }

            kotak.append(kiri, kanan);
            wadah.replaceChildren(kotak);
        }

        gambar();
    }

    /* ---------- PASANG ---------- */
    var wHitung = document.getElementById("hitung-mundur");
    if (wHitung) hitungMundur(wHitung);

    var wKal = document.getElementById("kalender-kegiatan");
    if (wKal) kalender(wKal);
})();
