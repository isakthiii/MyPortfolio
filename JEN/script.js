(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* ---------- Theme toggle (remembers choice) ---------- */
  const saved = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = saved || (prefersDark ? "dark" : "light");

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  });

  /* ---------- Split the hero name into letters ---------- */
  const lines = document.querySelectorAll("#heroName .line");
  const letters = [];
  let delay = 0;
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.style.animationDelay = `${delay}ms`;
      delay += 55;
      line.appendChild(s);
      letters.push(s);
    });
  });

  /* ---------- Pointer: glow + letter weight ---------- */
  const glow = document.querySelector(".glow");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 3;
  let glowX = mouseX, glowY = mouseY;

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!reduceMotion) updateWeights();
  });

  function updateWeights() {
    const radius = 220;
    letters.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = mouseX - (r.left + r.width / 2);
      const dy = mouseY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      const t = Math.max(0, 1 - d / radius);       // 0 far, 1 close
      el.style.fontVariationSettings = `"wght" ${Math.round(300 + t * 500)}`;
    });
  }

  function loop() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    requestAnimationFrame(loop);
  }
  if (!reduceMotion) loop();

  /* ---------- Typing line ---------- */
  const typedEl = document.getElementById("typed");
  const phrases = ["web development.", "solving problems on LeetCode.", "building on GitHub.", "exploring Web3."];
  let p = 0, i = 0, deleting = false;

  function type() {
    const word = phrases[p];
    typedEl.textContent = word.slice(0, i);
    if (!deleting && i < word.length) { i++; setTimeout(type, 70); }
    else if (!deleting) { deleting = true; setTimeout(type, 1600); }
    else if (i > 0) { i--; setTimeout(type, 35); }
    else { deleting = false; p = (p + 1) % phrases.length; setTimeout(type, 300); }
  }
  if (reduceMotion) typedEl.textContent = phrases[0];
  else type();

  /* ---------- Project card spotlight ---------- */
  document.querySelectorAll(".project").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Subtle reveal for section titles only ---------- */
  const revealEls = document.querySelectorAll(".section__title, .contact__big");
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.3 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Hide nav on scroll down, show on scroll up ---------- */
  const nav = document.querySelector(".nav");
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("hide", y > lastY && y > 120);
    lastY = y;
  }, { passive: true });

  /* ---------- Contact form opens your mail app ---------- */
  const form = document.getElementById("mailForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fName").value.trim();
    const msg = document.getElementById("fMsg").value.trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}`);
    window.location.href = `mailto:ursakthi19@gmail.com?subject=${subject}&body=${body}`;
    note.textContent = "Opening your email app…";
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();