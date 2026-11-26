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
    header.style.transition = "transform 0.35s ease, box-shadow 0.35s ease";
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
