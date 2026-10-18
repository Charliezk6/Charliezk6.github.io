(() => {
  let abort = null;
  let getDict = () => window.I18N.zh;
  let reduce = false;
  let roles = [];
  let roleIndex = 0;
  let roleTimer = 0;

  const easeOut = (t) => 1 - (1 - t) ** 3;
  const motionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");

  const splitName = (el, base = 40) => {
    if (!el) return;
    const text = el.dataset.text || el.textContent || "";
    el.dataset.text = text;
    const chars = [...text];
    const count = chars.length;
    el.replaceChildren();
    chars.forEach((ch, index) => {
      const span = document.createElement("span");
      span.className = "char";
      const step = count < 4 ? 84 : 34;
      const ease = count < 4 ? 0 : index * index * 4;
      span.style.setProperty("--d", `${base + index * step + ease}ms`);
      span.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(span);
    });
  };

  const showRole = (animate) => {
    const el = document.getElementById("role-word");
    if (!el || !roles.length) return;
    el.textContent = roles[roleIndex] || "";
    if (!animate || reduce) {
      el.classList.remove("is-in");
      return;
    }
    el.classList.remove("is-in");
    void el.offsetWidth;
    el.classList.add("is-in");
  };

  const bindNav = (signal) => {
    const links = [...document.querySelectorAll("[data-nav]")];
    const ids = [...new Set(links.map((link) => link.getAttribute("href")))];
    const sections = ids.map((href) => document.querySelector(href)).filter(Boolean);
    const now = document.getElementById("nav-now");
    const update = () => {
      const line = 120;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section;
      });
      const id = current ? current.id : "";
      links.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
      const label = links.find((link) => link.closest(".nav-links") && link.getAttribute("href") === `#${id}`);
      if (now && label) now.textContent = label.textContent.trim();
    };
    update();
    window.addEventListener("scroll", update, { passive: true, signal });
    window.addEventListener("resize", update, { signal });
  };

  const bindCounts = (signal) => {
    const nodes = [...document.querySelectorAll("[data-count]")];
    if (reduce) return;
    const play = (node) => {
      const target = Number(node.dataset.count);
      const decimals = Number(node.dataset.decimals || 0);
      const valueEl = node.querySelector(".stat-value");
      if (!valueEl || Number.isNaN(target)) return;
      const factor = 10 ** decimals;
      const start = performance.now();
      const step = (now) => {
        if (signal.aborted) return;
        const t = Math.min((now - start) / 1200, 1);
        const eased = easeOut(t) * target;
        const shown = t >= 1 ? target : Math.round(eased * factor) / factor;
        valueEl.textContent = decimals ? shown.toFixed(decimals) : String(Math.round(shown));
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    nodes.forEach((node) => observer.observe(node));
    signal.addEventListener("abort", () => observer.disconnect());
  };

  const bindRoles = () => {
    window.clearInterval(roleTimer);
    if (reduce || roles.length < 2) return;
    roleTimer = window.setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      showRole(true);
    }, 2200);
  };

  window.SiteMotion = {
    mount(reader) {
      getDict = reader;
      if (abort) abort.abort();
      abort = new AbortController();
      const { signal } = abort;
      reduce = motionQuery().matches;
      motionQuery().addEventListener(
        "change",
        () => {
          reduce = motionQuery().matches;
          this.sync();
        },
        { signal }
      );
      bindNav(signal);
      bindCounts(signal);
      signal.addEventListener("abort", () => window.clearInterval(roleTimer));
      this.sync();
    },
    sync() {
      if (!abort) return;
      const zhName = document.querySelector(".name-zh");
      const enName = document.querySelector(".name-en");
      const englishFirst = document.documentElement.lang === "en";
      splitName(englishFirst ? enName : zhName, 36);
      splitName(englishFirst ? zhName : enName, englishFirst ? 280 : 210);
      roles = Array.isArray(getDict().hero.roles) ? getDict().hero.roles : [];
      roleIndex = 0;
      showRole(false);
      bindRoles();
    },
  };
})();
