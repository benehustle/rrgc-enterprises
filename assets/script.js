/* =============================================================================
   RRGC Enterprises — Site behaviour
   ============================================================================= */

/* -----------------------------------------------------------------------------
   loadIncludes — fetch header/footer, then init nav + active link
   ----------------------------------------------------------------------------- */
async function loadIncludes() {
  const headerPh = document.getElementById("header-placeholder");
  const footerPh = document.getElementById("footer-placeholder");
  if (!headerPh || !footerPh) return;

  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch("includes/header.html"),
      fetch("includes/footer.html"),
    ]);
    if (headerRes.ok) {
      headerPh.innerHTML = await headerRes.text();
    }
    if (footerRes.ok) {
      footerPh.innerHTML = await footerRes.text();
    }
  } catch (e) {
    /* Network / file protocol — leave placeholders */
  }

  initNav();
  setActiveNavLink();
}

/* -----------------------------------------------------------------------------
   initNav — hamburger, scroll shrink, drawer close
   ----------------------------------------------------------------------------- */
function initNav() {
  const header = document.querySelector(".header");
  const toggle = document.querySelector("[data-nav-toggle]");
  const drawer = document.querySelector("[data-nav-drawer]");
  const overlay = document.querySelector("[data-nav-overlay]");
  const closeBtn = document.querySelector("[data-nav-close]");
  const drawerLinks = document.querySelectorAll("[data-drawer-link]");

  function setDrawerOpen(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = !drawer.classList.contains("is-open");
      setDrawerOpen(open);
    });
  }

  [overlay, closeBtn].forEach((el) => {
    if (el) {
      el.addEventListener("click", () => setDrawerOpen(false));
    }
  });

  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => setDrawerOpen(false));
  });

  if (header) {
    const onScroll = () => {
      header.classList.toggle("header--scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}

/* -----------------------------------------------------------------------------
   setActiveNavLink — pathname vs href
   ----------------------------------------------------------------------------- */
const SERVICE_PAGE_FILES = new Set([
  "services.html",
  "autonomous-boat-hire.html",
  "inflatable-islands.html",
  "commercial-water-cleaning-solutions.html",
  "franchise-distributor-opportunities.html",
  "bespoke-inflatable-vehicle-design.html",
]);

function setActiveNavLink() {
  let path = window.location.pathname.split("/").pop();
  if (!path || path === "") path = "index.html";

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.classList.remove("is-active");
    const href = link.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    const isIndex =
      path === "index.html" && (file === "index.html" || href === "index.html");
    const sameFile = file === path;
    const isServicesHub =
      link.hasAttribute("data-nav-services") && SERVICE_PAGE_FILES.has(path);
    if (isIndex || sameFile || isServicesHub) {
      link.classList.add("is-active");
    }
  });
}

/* -----------------------------------------------------------------------------
   initSmoothScroll — #anchors with 90px header offset
   ----------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector(".header");
      const offset = header ? header.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* -----------------------------------------------------------------------------
   initScrollAnimations — IntersectionObserver
   ----------------------------------------------------------------------------- */
function initScrollAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  document.querySelectorAll(".animate-stagger").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      observer.observe(child);
    });
  });
}

/* -----------------------------------------------------------------------------
   initCounters — stat numbers
   ----------------------------------------------------------------------------- */
function initCounters() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".stat-number").forEach((el) => {
      el.textContent = el.dataset.target + (el.dataset.suffix || "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimals, 10) || 0;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent =
            (target * eased).toFixed(decimals) +
            (progress === 1 ? suffix : "");
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat-number").forEach((el) => {
    observer.observe(el);
  });
}

/* -----------------------------------------------------------------------------
   initCallBar — 2s delay, session dismiss, phone from link
   ----------------------------------------------------------------------------- */
function initCallBar() {
  const bar = document.querySelector("[data-call-bar]");
  if (!bar) return;

  const storageKey = "rrgc_call_bar_dismissed";
  if (sessionStorage.getItem(storageKey) === "1") return;

  const dismiss = bar.querySelector("[data-call-bar-dismiss]");

  setTimeout(() => {
    bar.classList.add("is-visible");
    document.body.classList.add("has-call-bar");
  }, 2000);

  if (dismiss) {
    dismiss.addEventListener("click", () => {
      bar.classList.remove("is-visible");
      document.body.classList.remove("has-call-bar");
      sessionStorage.setItem(storageKey, "1");
    });
  }
}

/* -----------------------------------------------------------------------------
   initContactForm — validation + success
   ----------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const success = document.querySelector("[data-form-success]");
  const phoneDisplayEl = document.querySelector("[data-site-phone-display]");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    const fields = form.querySelectorAll("[data-validate]");

    fields.forEach((field) => {
      const wrap = field.closest(".form-group");
      let ok = true;
      const val = field.value.trim();
      if (field.tagName === "SELECT") {
        ok = val !== "";
      } else if (field.type === "email") {
        ok =
          val !== "" &&
          val.includes("@") &&
          val.includes(".") &&
          val.length > 4;
      } else {
        ok = val !== "";
      }
      if (wrap) {
        wrap.classList.toggle("is-invalid", !ok);
      }
      if (!ok) valid = false;
    });

    if (!valid) return;

    fields.forEach((field) => {
      const wrap = field.closest(".form-group");
      if (wrap) wrap.classList.remove("is-invalid");
    });

    form.reset();
    if (success) {
      success.textContent = "";
      const phoneText = phoneDisplayEl
        ? phoneDisplayEl.textContent.trim()
        : "";
      const telHref = form.getAttribute("data-phone-href") || "";
      const msg = document.createDocumentFragment();
      msg.append(
        document.createTextNode(
          "Thanks — we'll be in touch soon! For urgent jobs call "
        )
      );
      const a = document.createElement("a");
      a.href = telHref;
      a.textContent = phoneText;
      msg.append(a);
      msg.append(document.createTextNode(" directly."));
      success.append(msg);
      success.classList.add("is-visible");
    }
  });
}

/* -----------------------------------------------------------------------------
   initFaq — smooth accordion for details
   ----------------------------------------------------------------------------- */
function initFaq() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".faq__item").forEach((details) => {
    const summary = details.querySelector("summary");
    const answer = details.querySelector(".faq__answer");
    if (!summary || !answer) return;

    answer.style.overflow = "hidden";
    answer.style.transition = "max-height 0.35s ease";
    answer.style.maxHeight = details.open ? `${answer.scrollHeight}px` : "0px";

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (details.open) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        requestAnimationFrame(() => {
          answer.style.maxHeight = "0px";
        });
        const onEnd = () => {
          details.removeAttribute("open");
          answer.removeEventListener("transitionend", onEnd);
        };
        answer.addEventListener("transitionend", onEnd);
      } else {
        document.querySelectorAll(".faq__item").forEach((other) => {
          if (other !== details && other.hasAttribute("open")) {
            const oa = other.querySelector(".faq__answer");
            if (oa) {
              oa.style.maxHeight = `${oa.scrollHeight}px`;
              requestAnimationFrame(() => {
                oa.style.maxHeight = "0px";
              });
            }
            other.removeAttribute("open");
          }
        });
        details.setAttribute("open", "");
        answer.style.maxHeight = "0px";
        requestAnimationFrame(() => {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        });
      }
    });
  });
}

/* -----------------------------------------------------------------------------
   DOMContentLoaded
   ----------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadIncludes();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initCallBar();
  initContactForm();
  initFaq();
});
