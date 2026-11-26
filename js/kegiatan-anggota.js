const header = document.querySelector("header");
let tinggiHeader = header.offsetHeight; // Mengukur tinggi asli header secara otomatis

window.addEventListener("resize", () => {
  tinggiHeader = header.offsetHeight;
});

window.addEventListener("scroll", () => {
  const posisiScroll = window.scrollY;

  if (posisiScroll <= tinggiHeader) {
    // Tahap 1: Saat scroll belum melewati tinggi header,
    // header ikut terdorong ke atas seiring jarak scroll
    header.style.transition = "none";
    header.style.transform = `translateY(-${posisiScroll}px)`;
    header.classList.remove("muncul");
  } else {
    // Tahap 2: Setelah header habis ter-scroll,
    // munculkan kembali ke posisi atas (0) dengan animasi halus
    header.style.transition = "transform 0.35s ease, box-shadow 0.35s ease";
    header.style.transform = "translateY(0)";
    header.classList.add("muncul");
  }
});

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

function setMenu(buka) {
  navMenu.classList.toggle("active", buka);
  menuToggle.textContent = buka ? "X" : "☰";
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

// Data kegiatan ada di js/data-kegiatan.js (dipakai bersama kalender dan halaman lain).
const kegiatan = window.KEGIATAN_KEMATIF;
const STATUS = {
  soon: ["Akan datang", "st-soon"],
  now: ["Berlangsung", "st-now"],
  done: ["Selesai", "st-done"],
};
const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const fmt = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${+d} ${BULAN[+m - 1]} ${y}`;
};

// Pendaftaran disimpan di browser (sementara). Ganti dengan request ke server.
let terdaftar = [];
try {
  terdaftar = JSON.parse(localStorage.getItem("kegiatan-terdaftar") || "[]");
} catch (e) {}
const simpan = () => {
  try {
    localStorage.setItem("kegiatan-terdaftar", JSON.stringify(terdaftar));
  } catch (e) {}
};

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const jumlah = document.getElementById("jumlah");
const cari = document.getElementById("cari");
let filter = "semua";

const icon = (d) =>
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC_CAL = icon(
  '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
);
const IC_CLK = icon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>');
const IC_PIN = icon(
  '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function aksi(k) {
  const b = el("button", "btn");
  b.type = "button";
  if (k.status === "done") {
    b.className = "btn btn-outline";
    b.textContent = "Lihat dokumentasi";
    b.addEventListener("click", () =>
      toast('Dokumentasi "' + k.judul + '" belum tersedia'),
    );
    return b;
  }
  if (terdaftar.includes(k.id)) {
    b.className = "btn btn-done";
    b.textContent = "✓ Terdaftar";
    b.disabled = true;
    return b;
  }
  b.className = "btn btn-primary";
  b.textContent = k.status === "now" ? "Gabung sekarang" : "Daftar";
  b.addEventListener("click", () => {
    terdaftar.push(k.id);
    simpan();
    toast("Berhasil mendaftar: " + k.judul);
    render();
  });
  return b;
}

function render() {
  const q = cari.value.trim().toLowerCase();
  const data = kegiatan.filter(
    (k) =>
      (filter === "semua" || k.status === filter) &&
      (!q ||
        (k.judul + " " + k.ket + " " + k.tempat).toLowerCase().includes(q)),
  );
  grid.replaceChildren();
  data.forEach((k) => {
    const card = el("article", "card event");
    const thumb = el("div", "thumb " + k.tema,);
    if(k.foto){
      const img = document.createElement("img");
      img.src = k.foto;
      img.alt = "Foto " + k.judul;
      img.loading = "lazy";

      img.addEventListener("error", () => {
        img.remove();
        thumb.textContent = k.judul;
      });
      thumb.append(img);
    }else{
      thumb.textContent = k.judul;
    }
    const body = el("div", "body");
    const row = el("div", "row");
    row.append(el("span", "pill " + STATUS[k.status][1], STATUS[k.status][0]));
    body.append(row, el("h3", "", k.judul), el("p", "", k.ket));
    const meta = el("div", "meta");
    [
      [IC_CAL, fmt(k.tanggal)],
      [IC_CLK, k.jam],
      [IC_PIN, k.tempat],
    ].forEach(([ic, t]) => {
      const s = el("span");
      s.innerHTML = ic;
      s.append(t);
      meta.append(s);
    });
    const foot = el("div", "foot");
    foot.append(aksi(k));
    body.append(meta, foot);
    card.append(thumb, body);
    grid.append(card);
  });
  jumlah.textContent = data.length + " Kegiatan";
  empty.style.display = data.length ? "none" : "block";
}

let tt;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("show"), 2200);
}

document.querySelectorAll(".chip").forEach((c) =>
  c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
    c.classList.add("on");
    filter = c.dataset.status;
    render();
  }),
);
cari.addEventListener("input", render);
document
  .getElementById("btn-agenda")
  .addEventListener("click", () =>
    document
      .getElementById("agenda")
      .scrollIntoView({ behavior: "smooth", block: "start" }),
  );

render();
