/* ============================================================
   Timeline program kerja + kartu divisi — js/proker.js
   Dipakai di struktur.html. Butuh:
   - js/data-kegiatan.js  (window.KEGIATAN_KEMATIF)
   - skrip struktur.html  (daftar `posisi` dan fungsi `pasangFoto`)
   Murni HTML + CSS + JS, tanpa library.
   ============================================================ */
(function () {
    "use strict";

    if (typeof posisi === "undefined" || !window.KEGIATAN_KEMATIF) return;

    var DATA = window.KEGIATAN_KEMATIF.slice().sort(function (a, b) {
        return a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : 0;
    });
    var DIVISI = posisi.filter(function (p) { return p.id !== "kabinet"; });
    var BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    // Warna penanda tiap divisi
    var WARNA = {
        kahim: "#0f4c81", sekre: "#2a85b8", bendahara: "#168b41", kwu: "#c8921f",
        kominfo: "#7a5cd6", psdm: "#0e8f8f", humas: "#d6577a"
    };

    function pad(n) { return String(n).padStart(2, "0"); }
    function el(tag, kelas, teks) {
        var e = document.createElement(tag);
        if (kelas) e.className = kelas;
        if (teks !== undefined) e.textContent = teks;
        return e;
    }
    function namaDivisi(id) {
        var d = DIVISI.filter(function (x) { return x.id === id; })[0];
        return d ? d.nama : id;
    }
    var n = new Date();
    var HARI_INI = n.getFullYear() + "-" + pad(n.getMonth() + 1) + "-" + pad(n.getDate());

    /* ============ TIMELINE ============ */
    var wTimeline = document.getElementById("pk-timeline");
    var wChip = document.getElementById("pk-chip");
    var filter = "semua";

    function gambarChip() {
        wChip.replaceChildren();
        [{ id: "semua", nama: "Semua divisi" }].concat(DIVISI).forEach(function (d) {
            var b = el("button", "pk-chip" + (d.id === filter ? " on" : ""), d.nama);
            b.type = "button";
            b.setAttribute("aria-pressed", d.id === filter);
            b.addEventListener("click", function () { setFilter(d.id, false); });
            wChip.appendChild(b);
        });
    }

    function setFilter(id, gulir) {
        filter = id;
        gambarChip();
        gambarTimeline();
        if (gulir) document.getElementById("pk-judul").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function gambarTimeline() {
        var daftar = DATA.filter(function (k) { return filter === "semua" || k.divisi === filter; });
        wTimeline.replaceChildren();

        if (!daftar.length) {
            wTimeline.appendChild(el("p", "pk-kosong", "Belum ada program kerja terjadwal untuk divisi ini."));
            return;
        }

        var jalur = el("ol", "pk-jalur");
        var berikutnya = daftar.filter(function (k) { return k.tanggal >= HARI_INI; })[0];
        var liBerikutnya = null;

        daftar.forEach(function (k) {
            var lalu = k.tanggal < HARI_INI;
            var li = el("li", "pk-item " + (lalu ? "lalu" : "depan"));
            li.style.setProperty("--w", WARNA[k.divisi] || "#0f4c81");
            li.appendChild(el("span", "pk-titik"));

            var p = k.tanggal.split("-");
            var tgl = el("div", "pk-tgl");
            tgl.append(el("b", "", String(Number(p[2]))), el("span", "", BULAN[Number(p[1]) - 1] + " " + p[0]));

            var kartu = el("article", "pk-kartu");
            if (k === berikutnya) {
                kartu.classList.add("berikutnya");
                kartu.appendChild(el("em", "pk-lencana", "Berikutnya"));
            }
            kartu.appendChild(el("span", "pk-divisi", namaDivisi(k.divisi)));
            kartu.appendChild(el("h4", "", k.judul));
            kartu.appendChild(el("p", "", k.ket));
            kartu.appendChild(el("small", "", k.jam + " · " + k.tempat));

            li.append(tgl, kartu);
            jalur.appendChild(li);
            if (k === berikutnya) liBerikutnya = li;
        });

        wTimeline.appendChild(jalur);

        // Mulai dari kegiatan terdekat; gulir hanya di dalam jalur, bukan halaman
        if (liBerikutnya) {
            wTimeline.scrollLeft = Math.max(liBerikutnya.offsetLeft - 24, 0);
        } else {
            wTimeline.scrollLeft = 0;
        }
        perbaruiPanah();
    }

    var btnKiri = document.getElementById("pk-kiri");
    var btnKanan = document.getElementById("pk-kanan");
    function perbaruiPanah() {
        var maks = wTimeline.scrollWidth - wTimeline.clientWidth - 2;
        btnKiri.disabled = wTimeline.scrollLeft <= 2;
        btnKanan.disabled = wTimeline.scrollLeft >= maks;
    }
    btnKiri.addEventListener("click", function () { wTimeline.scrollBy({ left: -320, behavior: "smooth" }); });
    btnKanan.addEventListener("click", function () { wTimeline.scrollBy({ left: 320, behavior: "smooth" }); });
    wTimeline.addEventListener("scroll", perbaruiPanah, { passive: true });
    window.addEventListener("resize", perbaruiPanah);

    /* ============ KARTU DIVISI (FLIP) ============ */
    var wKartu = document.getElementById("pk-divisi");

    function balik(kartu, nyala) {
        var buka = typeof nyala === "boolean" ? nyala : !kartu.classList.contains("terbalik");
        kartu.classList.toggle("terbalik", buka);
        kartu.setAttribute("aria-pressed", buka);
        kartu.querySelector(".fl-depan").setAttribute("aria-hidden", buka);
        kartu.querySelector(".fl-belakang").setAttribute("aria-hidden", !buka);
    }

    DIVISI.forEach(function (d) {
        var kartu = el("div", "fl");
        kartu.setAttribute("role", "button");
        kartu.tabIndex = 0;
        kartu.setAttribute("aria-pressed", "false");
        kartu.setAttribute("aria-label", "Divisi " + d.nama + ", tekan untuk membalik kartu");
        kartu.style.setProperty("--w", WARNA[d.id] || "#0f4c81");

        var dalam = el("div", "fl-dalam");

        // Depan
        var depan = el("div", "fl-depan");
        var foto = el("div", "fl-foto");
        pasangFoto(d.foto, function (img) { foto.appendChild(img); }, function () { foto.classList.add("nofoto"); });
        var teksDepan = el("div", "fl-teks");
        teksDepan.append(el("h3", "", d.nama), el("span", "", "Ketuk untuk melihat tugas ↻"));
        depan.append(foto, teksDepan);

        // Belakang
        var belakang = el("div", "fl-belakang");
        belakang.setAttribute("aria-hidden", "true");
        depan.setAttribute("aria-hidden", "false");
        belakang.appendChild(el("h3", "", d.nama));
        belakang.appendChild(el("p", "fl-info", d.info));
        belakang.appendChild(el("h4", "", "Tugas utama"));
        var ul = el("ul");
        d.tugas.forEach(function (t) { ul.appendChild(el("li", "", t)); });
        belakang.appendChild(ul);

        var proker = DATA.filter(function (k) { return k.divisi === d.id; });
        belakang.appendChild(el("h4", "", "Program kerja"));
        if (proker.length) {
            var up = el("ul", "fl-proker");
            proker.forEach(function (k) {
                var p = k.tanggal.split("-");
                up.appendChild(el("li", "", k.judul + " (" + Number(p[2]) + " " + BULAN[Number(p[1]) - 1] + ")"));
            });
            belakang.appendChild(up);
            var lihat = el("button", "fl-lihat", "Lihat di timeline");
            lihat.type = "button";
            lihat.addEventListener("click", function (e) {
                e.stopPropagation();
                setFilter(d.id, true);
            });
            lihat.addEventListener("keydown", function (e) { e.stopPropagation(); });
            belakang.appendChild(lihat);
        } else {
            belakang.appendChild(el("p", "fl-info", "Belum ada program kerja terjadwal."));
        }

        dalam.append(depan, belakang);
        kartu.appendChild(dalam);

        kartu.addEventListener("click", function () { balik(kartu); });
        kartu.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); balik(kartu); }
        });
        wKartu.appendChild(kartu);
    });

    gambarChip();
    gambarTimeline();
})();
