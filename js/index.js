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
          header.style.transition =
            "transform 0.35s ease, box-shadow 0.35s ease";
          header.style.transform = "translateY(0)";
          header.classList.add("muncul");
        }
      });

      const menuToggle = document.getElementById("menuToggle");
      const navMenu = document.getElementById("navMenu");

      function setMenu(buka){
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
        if(!header.contains(e.target)) setMenu(false);
      });