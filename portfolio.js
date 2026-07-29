(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = [...document.querySelectorAll("[data-nav-link]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setMenu = (open) => {
    if (!menu || !menuButton || !header) return;
    menu.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.querySelector(".sr-only").textContent = open ? "Close navigation" : "Open navigation";
  };

  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { setMenu(false); menuButton?.focus(); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 1100) setMenu(false); });

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
          active ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-22% 0px -68% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const selector = link.getAttribute("href");
      if (!selector || selector === "#") return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", selector);
    });
  });

  document.querySelectorAll(".devlog-details").forEach((details) => {
    const sync = () => details.querySelector("summary")?.setAttribute("aria-expanded", String(details.open));
    details.addEventListener("toggle", sync);
    sync();
  });

  document.querySelectorAll("[data-current-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
