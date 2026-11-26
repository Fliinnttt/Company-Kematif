/* ============================================================
   Grafik Keuangan & Kas — js/grafik.js
   Membaca window.DATA_KEUANGAN (js/keuangan-anggota.js) dan
   window.DATA_KAS (js/kas-anggota.js). Murni HTML + CSS + JS (SVG).
   ============================================================ */
(function () {
    "use strict";

    var NS = "http://www.w3.org/2000/svg";
    var BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    var WARNA = {
        masuk: "#168b41",
        keluar: "#cc2222",
        biru: "#0f4c81",
        cyan: "#48c6ef",
        emas: "#d9a93f",
        kuning: "#d99a1b"
    };

    /* ---------- FUNGSI BANTU ---------- */
    function rupiah(n) { return "Rp " + n.toLocaleString("id-ID"); }

    function singkat(n) {
        if (n >= 1000000) return (Math.round(n / 100000) / 10).toString().replace(".", ",") + " jt";
        if (n >= 1000) return Math.round(n / 1000) + " rb";
        return String(n);
    }

    function svgEl(tag, attrs, induk) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (induk) induk.appendChild(e);
        return e;
    }

    function el(tag, kelas, teks) {
        var e = document.createElement(tag);
        if (kelas) e.className = kelas;
        if (teks !== undefined) e.textContent = teks;
        return e;
    }

    // Jalankan animasi ketika elemen terlihat di layar
    function saatTampil(elemen, fn) {
        if (!("IntersectionObserver" in window)) { fn(); return; }
        var io = new IntersectionObserver(function (entri) {
            if (entri[0].isIntersecting) { io.disconnect(); fn(); }
        }, { threshold: 0.2 });
        io.observe(elemen);
    }

    function langkahBagus(x) {
        var pangkat = Math.pow(10, Math.floor(Math.log(x) / Math.LN10));
        var f = x / pangkat;
        var bagus = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
        return bagus * pangkat;
    }

    function legenda(seri) {
        var ul = el("ul", "g-legenda");
        seri.forEach(function (s) {
            var li = el("li");
            var kotak = el("i");
            kotak.style.background = s.warna;
            li.appendChild(kotak);
            li.appendChild(document.createTextNode(s.nama));
            ul.appendChild(li);
        });
        return ul;
    }

    /* ---------- GRAFIK BATANG BERKELOMPOK ---------- */
    // grup : [{ label, nilai: [..] }]   seri : [{ nama, warna }]
    function grafikBatang(wadah, grup, seri, deskripsi) {
        var W = 520, H = 300, m = { l: 46, r: 12, t: 24, b: 38 };
        var pw = W - m.l - m.r, ph = H - m.t - m.b;

        var maks = 0;
        grup.forEach(function (g) { g.nilai.forEach(function (v) { if (v > maks) maks = v; }); });
        if (maks === 0) maks = 1;
        var langkah = langkahBagus(maks / 4);
        var atas = Math.ceil(maks / langkah) * langkah;

        var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": deskripsi });
        svg.setAttribute("class", "g-svg");

        for (var v = 0; v <= atas + 0.001; v += langkah) {
            var y = m.t + ph - (v / atas) * ph;
            svgEl("line", { x1: m.l, x2: W - m.r, y1: y, y2: y, class: "g-garis" }, svg);
            var t = svgEl("text", { x: m.l - 8, y: y + 4, class: "g-sumbu", "text-anchor": "end" }, svg);
            t.textContent = singkat(v);
        }

        var slot = pw / grup.length;
        var lebar = Math.min(48, slot / (seri.length + 1));
        var jarak = 8;
        var total = seri.length * lebar + (seri.length - 1) * jarak;

        grup.forEach(function (g, i) {
            var cx = m.l + slot * (i + 0.5);
            g.nilai.forEach(function (nilai, j) {
                var x = cx - total / 2 + j * (lebar + jarak);
                var tinggi = (nilai / atas) * ph;
                var yb = m.t + ph - tinggi;
                var rect = svgEl("rect", {
                    x: x, y: yb, width: lebar, height: Math.max(tinggi, 0), rx: 6,
                    fill: seri[j].warna, class: "g-batang"
                }, svg);
                rect.style.transitionDelay = (i * 120 + j * 80) + "ms";
                var tip = svgEl("title", {}, rect);
                tip.textContent = g.label + " — " + seri[j].nama + ": " + rupiah(nilai);

                var lb = svgEl("text", { x: x + lebar / 2, y: yb - 7, "text-anchor": "middle", class: "g-nilai" }, svg);
                lb.textContent = singkat(nilai);
                lb.style.transitionDelay = (i * 120 + j * 80 + 250) + "ms";
            });
            var tl = svgEl("text", { x: cx, y: H - 12, "text-anchor": "middle", class: "g-label" }, svg);
            tl.textContent = g.label;
        });

        wadah.replaceChildren(svg, legenda(seri));
        saatTampil(wadah, function () { svg.classList.add("tampil"); });
    }

    /* ---------- GRAFIK DONUT ---------- */
    // irisan : [{ nama, nilai, warna, teks }]   tengah : { judul, isi }
    function grafikDonut(wadah, irisan, tengah, deskripsi) {
        var R = 70, SW = 26, C = 2 * Math.PI * R;
        var jumlah = irisan.reduce(function (a, b) { return a + b.nilai; }, 0);

        var kotak = el("div", "g-donut");
        var svg = svgEl("svg", { viewBox: "0 0 200 200", role: "img", "aria-label": deskripsi });
        svg.setAttribute("class", "g-svg");
        svgEl("circle", { cx: 100, cy: 100, r: R, fill: "none", stroke: "#eaf2f9", "stroke-width": SW }, svg);

        var gabung = svgEl("g", { transform: "rotate(-90 100 100)" }, svg);
        var segmen = [];
        var geser = 0;
        irisan.forEach(function (s) {
            var panjang = jumlah ? (s.nilai / jumlah) * C : 0;
            var isi = Math.max(panjang - (irisan.length > 1 ? 3 : 0), 0);
            var c = svgEl("circle", {
                cx: 100, cy: 100, r: R, fill: "none", stroke: s.warna, "stroke-width": SW,
                "stroke-dasharray": "0 " + C, "stroke-dashoffset": -geser, class: "g-irisan", tabindex: 0
            }, gabung);
            c.dataset.isi = isi;
            segmen.push(c);
            geser += panjang;
        });

        var judul = svgEl("text", { x: 100, y: 96, "text-anchor": "middle", class: "g-tengah-besar" }, svg);
        var sub = svgEl("text", { x: 100, y: 116, "text-anchor": "middle", class: "g-tengah-kecil" }, svg);
        function setTengah(a, b) { judul.textContent = a; sub.textContent = b; }
        setTengah(tengah.isi, tengah.judul);

        var ul = el("ul", "g-daftar");
        irisan.forEach(function (s, i) {
            var persen = jumlah ? Math.round((s.nilai / jumlah) * 100) : 0;
            var li = el("li");
            var kt = el("i");
            kt.style.background = s.warna;
            var nama = el("span", "", s.nama);
            var nilai = el("strong", "", s.teks);
            var pr = el("em", "", persen + "%");
            li.append(kt, nama, nilai, pr);
            ul.appendChild(li);

            function aktif() {
                segmen.forEach(function (x, k) { x.classList.toggle("redup", k !== i); });
                setTengah(persen + "%", s.nama);
            }
            function reda() {
                segmen.forEach(function (x) { x.classList.remove("redup"); });
                setTengah(tengah.isi, tengah.judul);
            }
            [li, segmen[i]].forEach(function (e) {
                e.addEventListener("mouseenter", aktif);
                e.addEventListener("mouseleave", reda);
                e.addEventListener("focus", aktif);
                e.addEventListener("blur", reda);
            });
        });

        kotak.append(svg, ul);
        wadah.replaceChildren(kotak);
        saatTampil(wadah, function () {
            segmen.forEach(function (c, i) {
                c.style.transitionDelay = (i * 150) + "ms";
                c.setAttribute("stroke-dasharray", c.dataset.isi + " " + C);
            });
        });
    }

    /* ---------- KEUANGAN ---------- */
    function renderKeuangan() {
        var d = window.DATA_KEUANGAN;
        var wBatang = document.getElementById("grafik-batang");
        if (!d || !wBatang) return;

        // Pemasukan & pengeluaran per bulan
        var perBulan = {};
        d.transaksi.forEach(function (t) {
            var k = t.tanggal.slice(0, 7);
            if (!perBulan[k]) perBulan[k] = { masuk: 0, keluar: 0 };
            if (t.jenis === "Pemasukan") perBulan[k].masuk += t.nominal;
            else perBulan[k].keluar += t.nominal;
        });
        var grup = Object.keys(perBulan).sort().map(function (k) {
            var p = k.split("-");
            return { label: BULAN[Number(p[1]) - 1] + " " + p[0], nilai: [perBulan[k].masuk, perBulan[k].keluar] };
        });
        grafikBatang(wBatang, grup,
            [{ nama: "Pemasukan", warna: WARNA.masuk }, { nama: "Pengeluaran", warna: WARNA.keluar }],
            "Grafik batang pemasukan dan pengeluaran per bulan");

        // Pengeluaran per kategori
        var perKategori = {};
        var totalKeluar = 0;
        d.transaksi.forEach(function (t) {
            if (t.jenis !== "Pengeluaran") return;
            perKategori[t.kategori] = (perKategori[t.kategori] || 0) + t.nominal;
            totalKeluar += t.nominal;
        });
        var warnaKat = { Iuran: WARNA.biru, Operasional: WARNA.cyan, Kegiatan: WARNA.emas };
        var irisan = Object.keys(perKategori).map(function (k) {
            return { nama: k, nilai: perKategori[k], warna: warnaKat[k] || WARNA.biru, teks: rupiah(perKategori[k]) };
        });
        var wDonut = document.getElementById("grafik-donut");
        if (wDonut) {
            grafikDonut(wDonut, irisan, { isi: singkat(totalKeluar), judul: "Total keluar" },
                "Grafik donut pengeluaran per kategori");
        }

        // Target dana kegiatan
        var wTarget = document.getElementById("grafik-target");
        if (wTarget && d.target) {
            var terkumpul = 0;
            d.transaksi.forEach(function (t) {
                if (t.jenis === "Pemasukan" && t.kategori === d.target.kategori) terkumpul += t.nominal;
            });
            var persen = Math.min(100, Math.round((terkumpul / d.target.nominal) * 100));
            var sisa = Math.max(d.target.nominal - terkumpul, 0);

            var kepala = el("div", "g-target-kepala");
            kepala.append(el("strong", "", d.target.nama), el("span", "", persen + "%"));
            var trek = el("div", "g-trek");
            var isi = el("div", "g-isi");
            trek.appendChild(isi);
            trek.setAttribute("role", "progressbar");
            trek.setAttribute("aria-valuemin", "0");
            trek.setAttribute("aria-valuemax", "100");
            trek.setAttribute("aria-valuenow", persen);
            var ket = el("p", "g-target-ket",
                "Terkumpul " + rupiah(terkumpul) + " dari target " + rupiah(d.target.nominal) +
                (sisa ? " — kurang " + rupiah(sisa) + "." : " — target tercapai.")
            );
            wTarget.replaceChildren(kepala, trek, ket);
            saatTampil(wTarget, function () { isi.style.width = persen + "%"; });
        }
    }

    /* ---------- KAS ---------- */
    function statusDari(bulan) {
        if (bulan === 0) return 0;      // Lunas
        if (bulan <= 2) return 1;       // Belum lunas
        return 2;                       // Menunggak
    }

    function renderKas() {
        var d = window.DATA_KAS;
        var wDonut = document.getElementById("grafik-kas-donut");
        if (!d || !wDonut) return;

        var NAMA = ["Lunas", "Belum Lunas", "Menunggak"];
        var WARNA_S = [WARNA.masuk, WARNA.kuning, WARNA.keluar];
        var hitung = [0, 0, 0];
        var perAngkatan = {};

        d.anggota.forEach(function (a) {
            var s = statusDari(a.bulanTunggak);
            hitung[s]++;
            var m = a.keterangan.match(/Angkatan\s+(\d{4})/);
            var th = m ? m[1] : "Lainnya";
            if (!perAngkatan[th]) perAngkatan[th] = [0, 0, 0];
            perAngkatan[th][s]++;
        });

        var persenLunas = Math.round((hitung[0] / d.anggota.length) * 100);
        var irisan = NAMA.map(function (n, i) {
            return { nama: n, nilai: hitung[i], warna: WARNA_S[i], teks: hitung[i] + " orang" };
        });
        grafikDonut(wDonut, irisan, { isi: persenLunas + "%", judul: "Anggota lunas" },
            "Grafik donut status pembayaran kas anggota");

        var wAngkatan = document.getElementById("grafik-kas-angkatan");
        if (!wAngkatan) return;
        var daftar = el("div", "g-tumpuk");
        var batang = [];
        Object.keys(perAngkatan).sort().forEach(function (th) {
            var baris = el("div", "g-baris");
            baris.appendChild(el("span", "g-baris-label", th));
            var trek = el("div", "g-trek-tumpuk");
            var isi = el("div", "g-tumpuk-isi");
            perAngkatan[th].forEach(function (n, i) {
                if (!n) return;
                var seg = el("span", "", String(n));
                seg.style.flexGrow = n;
                seg.style.background = WARNA_S[i];
                seg.title = th + " — " + NAMA[i] + ": " + n + " orang";
                isi.appendChild(seg);
            });
            trek.appendChild(isi);
            baris.appendChild(trek);
            daftar.appendChild(baris);
            batang.push(isi);
        });
        wAngkatan.replaceChildren(daftar, legenda(NAMA.map(function (n, i) { return { nama: n, warna: WARNA_S[i] }; })));
        saatTampil(wAngkatan, function () {
            batang.forEach(function (b, i) {
                b.style.transitionDelay = (i * 120) + "ms";
                b.classList.add("tampil");
            });
        });
    }

    renderKeuangan();
    renderKas();
})();
