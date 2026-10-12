(() => {
  let abort = null;
  let getDict = () => window.I18N.zh;
  let reduce = false;
  let roles = [];
  let roleIndex = 0;
  let roleTimer = 0;
  let raf = 0;
  let last = 0;
  let currentL = 0;
  let currentR = 0;
  let startRoles = () => {};

  const easeOut = (t) => 1 - (1 - t) ** 3;

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch])
    );

  const motionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");

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

  const paintMarquee = () => {
    const track = document.getElementById("marquee-track");
    if (!track) return;
    const text = esc(getDict().marquee || "");
    const group = `<div class="marquee-group">${`<span>${text}</span>`.repeat(8)}</div>`;
    track.innerHTML = group + group;
  };

  const sizeExplore = () => {
    const section = document.getElementById("photography");
    const left = document.getElementById("gallery-left");
    const right = document.getElementById("gallery-right");
    if (!section || !left || !right) return;
    if (reduce) {
      section.style.minHeight = "";
      left.style.transform = "";
      right.style.transform = "";
      return;
    }
    const needed = Math.max(left.scrollHeight, right.scrollHeight, window.innerHeight * 3);
    section.style.minHeight = `${needed}px`;
  };

  const bindNav = (signal) => {
    const links = [...document.querySelectorAll("[data-nav]")];
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
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
    };
    update();
    window.addEventListener("scroll", update, { passive: true, signal });
    window.addEventListener("resize", update, { signal });
  };

  const loopParallax = (signal) => {
    const section = document.getElementById("photography");
    const left = document.getElementById("gallery-left");
    const right = document.getElementById("gallery-right");
    if (!section || !left || !right) return;
    const tick = (now) => {
      if (signal.aborted || reduce) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const total = section.offsetHeight - window.innerHeight;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
      const targetL = progress * -0.1 * left.offsetHeight;
      const targetR = progress * -0.26 * right.offsetHeight;
      const k = 1 - Math.exp(-dt / 1);
      currentL += (targetL - currentL) * k;
      currentR += (targetR - currentR) * k;
      left.style.transform = `translate3d(0, ${currentL}px, 0)`;
      right.style.transform = `translate3d(0, ${currentR}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };
    window.cancelAnimationFrame(raf);
    last = 0;
    if (!reduce) raf = window.requestAnimationFrame(tick);
  };

  const bindComet = (signal) => {
    const canvas = document.querySelector(".comet");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const points = [];
    let head = null;
    let lastMove = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { signal });

    if (reduce || !fine.matches) {
      canvas.style.display = "none";
      return;
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const next = { x: event.clientX, y: event.clientY, hue: 0 };
        const lastPoint = points[points.length - 1];
        const dist = lastPoint ? Math.hypot(next.x - lastPoint.x, next.y - lastPoint.y) : 12;
        if (lastPoint && dist < 3) return;
        next.hue = ((lastPoint ? lastPoint.hue : 200) + Math.min(18, dist * 0.35)) % 360;
        points.push(next);
        if (points.length > 28) points.shift();
        head = next;
        lastMove = performance.now();
      },
      { signal }
    );
    document.documentElement.addEventListener(
      "pointerleave",
      () => {
        lastMove = 0;
      },
      { signal }
    );

    let raf = 0;
    const tick = () => {
      if (signal.aborted) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!reduce && points.length > 1) {
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < points.length; i += 1) {
          const t = i / (points.length - 1);
          const hue = points[i].hue;
          ctx.shadowBlur = 18;
          ctx.shadowColor = `hsla(${hue}, 100%, 62%, 0.9)`;
          ctx.strokeStyle = `hsla(${hue}, 95%, 64%, ${0.2 + t * 0.8})`;
          ctx.lineWidth = 8 + t * 14;
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        if (head) {
          const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 28);
          glow.addColorStop(0, `hsla(${head.hue}, 100%, 78%, 0.95)`);
          glow.addColorStop(0.35, `hsla(${(head.hue + 40) % 360}, 100%, 60%, 0.45)`);
          glow.addColorStop(1, "hsla(0, 0%, 100%, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 28, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
      if (points.length && performance.now() - lastMove > 32) points.shift();
      if (!points.length) head = null;
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    signal.addEventListener("abort", () => window.cancelAnimationFrame(raf));
  };

  const bindParallax = (signal) => {
    sizeExplore();
    loopParallax(signal);
    window.addEventListener("resize", sizeExplore, { signal });
    signal.addEventListener("abort", () => window.cancelAnimationFrame(raf));
  };

  const bindCounts = (signal) => {
    if (reduce) return;
    const nodes = [...document.querySelectorAll("[data-count]")];
    const play = (node) => {
      const target = Number(node.dataset.count);
      const decimals = Number(node.dataset.decimals || 0);
      const valueEl = node.querySelector(".stat-value");
      if (!valueEl || Number.isNaN(target)) return;
      const factor = 10 ** decimals;
      const start = performance.now();
      valueEl.textContent = decimals ? (0).toFixed(decimals) : "0";
      const step = (now) => {
        if (signal.aborted) return;
        const t = Math.min((now - start) / 1400, 1);
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
      { threshold: 0.4 }
    );
    nodes.forEach((node) => observer.observe(node));
    signal.addEventListener("abort", () => observer.disconnect());
  };

  const bindRoles = (signal) => {
    const start = () => {
      window.clearInterval(roleTimer);
      if (reduce || roles.length < 2) return;
      roleTimer = window.setInterval(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        showRole(true);
      }, 2000);
    };
    signal.addEventListener("abort", () => window.clearInterval(roleTimer));
    return start;
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
          currentL = 0;
          currentR = 0;
          sizeExplore();
          loopParallax(signal);
          showRole(false);
          startRoles();
        },
        { signal }
      );
      bindNav(signal);
      bindComet(signal);
      bindParallax(signal);
      bindCounts(signal);
      startRoles = bindRoles(signal);
      this.sync();
    },
    sync() {
      if (!abort) return;
      roles = Array.isArray(getDict().hero.roles) ? getDict().hero.roles : [];
      roleIndex = 0;
      showRole(false);
      paintMarquee();
      startRoles();
    },
  };
})();
