(() => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BLOOMS = ["#a84d62", "#b45c6e", "#c07a84", "#8c5360", "#d4a3a8", "#c9a36a"];

  let width = 0;
  let height = 0;
  let flowers = [];
  let clouds = [];
  let blades = [];
  let petals = [];
  let hills = [];
  let start = performance.now();
  let frame = 0;
  let visible = true;
  let running = false;

  const mulberry = (seed) => {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const build = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rand = mulberry(1799);
    const count = Math.round(34 + width / 26);

    flowers = Array.from({ length: count }, () => {
      const depth = rand();
      const y = height * (0.58 + depth * 0.4);
      return {
        x: rand() * width,
        y,
        stem: 56 + depth * 120 + rand() * 24,
        size: 6 + depth * 13 + rand() * 3,
        color: BLOOMS[Math.floor(rand() * BLOOMS.length)],
        phase: rand() * Math.PI * 2,
        sway: 0.28 + rand() * 0.5,
        leaf: rand() > 0.42,
        kind: rand() > 0.22 ? "tulip" : "poppy",
        alpha: 0.5 + depth * 0.5,
        depth,
      };
    }).sort((a, b) => a.depth - b.depth);

    clouds = Array.from({ length: 4 }, (_, i) => ({
      x: rand() * width,
      y: height * (0.1 + rand() * 0.16),
      w: 220 + rand() * 280,
      h: 18 + rand() * 14,
      speed: 2.4 + rand() * 4.5,
      alpha: 0.08 + rand() * 0.08,
      delay: i,
    }));

    blades = Array.from({ length: Math.round(width / 7) }, () => ({
      x: rand() * width,
      y: height * (0.64 + rand() * 0.34),
      h: 16 + rand() * 48,
      phase: rand() * Math.PI * 2,
    }));

    petals = Array.from({ length: 9 }, () => ({
      x: rand() * width,
      y: height * (0.12 + rand() * 0.5),
      r: 2.6 + rand() * 4.2,
      color: BLOOMS[Math.floor(rand() * 4)],
      drift: 8 + rand() * 12,
      fall: 0.008 + rand() * 0.01,
      phase: rand() * Math.PI * 2,
    }));

    hills = [
      { y: 0.5, amp: 0.018, color: "rgba(94,132,152,0.22)", freq: 0.7, shift: 0.4 },
      { y: 0.53, amp: 0.022, color: "rgba(44,66,58,0.32)", freq: 1.05, shift: 1.6 },
      { y: 0.57, amp: 0.016, color: "rgba(28,43,36,0.5)", freq: 0.85, shift: 2.8 },
    ];
  };

  const drawSky = (t) => {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#6f93a3");
    sky.addColorStop(0.28, "#9db8c2");
    sky.addColorStop(0.5, "#c9dbe0");
    sky.addColorStop(0.66, "#dce8e4");
    sky.addColorStop(1, "#1c2b24");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * 0.72;
    const sunY = height * 0.28;
    const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, height * 0.34);
    glow.addColorStop(0, "rgba(243,247,246,0.55)");
    glow.addColorStop(0.18, "rgba(212,163,168,0.18)");
    glow.addColorStop(1, "rgba(212,163,168,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height * 0.7);

    clouds.forEach((cloud) => {
      const x = ((cloud.x + (t * cloud.speed) / 110) % (width + cloud.w * 2)) - cloud.w;
      ctx.fillStyle = `rgba(243,247,246,${cloud.alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
      ctx.ellipse(x + cloud.w * 0.28, cloud.y + 6, cloud.w * 0.7, cloud.h * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    hills.forEach((hill) => {
      ctx.fillStyle = hill.color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * hill.y);
      for (let x = 0; x <= width; x += 12) {
        const ny =
          height * hill.y +
          Math.sin(x * 0.005 * hill.freq + hill.shift) * height * hill.amp +
          Math.sin(x * 0.012 + hill.shift) * 4;
        ctx.lineTo(x, ny);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    });
  };

  const drawTulip = (x, y, size, color) => {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.bezierCurveTo(x - size, y + size * 0.18, x - size * 0.9, y - size * 0.8, x, y - size);
    ctx.bezierCurveTo(x + size * 0.9, y - size * 0.8, x + size, y + size * 0.18, x, y + size * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "rgba(243,247,246,0.16)";
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.12, size * 0.16, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPoppy = (x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.12, size * 0.62, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(28,43,36,0.28)";
    ctx.beginPath();
    ctx.arc(x, y - size * 0.08, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawField = (t) => {
    const wind = Math.sin(t * 0.00048);

    ctx.strokeStyle = "rgba(94,132,104,0.38)";
    ctx.lineWidth = 1;
    blades.forEach((blade) => {
      const lean = Math.sin(t * 0.0011 + blade.phase) * 6 + wind * 5;
      ctx.beginPath();
      ctx.moveTo(blade.x, blade.y);
      ctx.quadraticCurveTo(blade.x + lean, blade.y - blade.h * 0.5, blade.x + lean * 1.35, blade.y - blade.h);
      ctx.stroke();
    });

    flowers.forEach((flower) => {
      const lean = Math.sin(t * 0.00085 + flower.phase) * flower.sway * 11 + wind * flower.sway * 9;
      const topX = flower.x + lean;
      const topY = flower.y - flower.stem;
      ctx.globalAlpha = flower.alpha;

      ctx.strokeStyle = "#3d5648";
      ctx.lineWidth = 1.15 + flower.depth * 0.5;
      ctx.beginPath();
      ctx.moveTo(flower.x, flower.y);
      ctx.quadraticCurveTo(flower.x + lean * 0.42, flower.y - flower.stem * 0.52, topX, topY);
      ctx.stroke();

      if (flower.leaf) {
        ctx.fillStyle = "#4a6756";
        ctx.beginPath();
        ctx.ellipse(flower.x + lean * 0.22 - 7, flower.y - flower.stem * 0.46, 8 + flower.size * 0.2, 3.2, -0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      if (flower.kind === "tulip") drawTulip(topX, topY, flower.size, flower.color);
      else drawPoppy(topX, topY, flower.size, flower.color);
    });

    ctx.globalAlpha = 1;
    petals.forEach((petal) => {
      const x = petal.x + Math.sin(t * 0.00065 + petal.phase) * petal.drift;
      const y = ((petal.y + t * petal.fall) % (height * 0.72) + height * 0.72) % (height * 0.72);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.00035 + petal.phase);
      ctx.fillStyle = petal.color;
      ctx.globalAlpha = 0.48;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.r, petal.r * 1.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, "rgba(16,24,21,0.4)");
    veil.addColorStop(0.26, "rgba(16,24,21,0)");
    veil.addColorStop(0.6, "rgba(16,24,21,0)");
    veil.addColorStop(1, "rgba(16,24,21,0.5)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);
  };

  const paint = (now) => {
    const t = reduceMotion ? 22000 : now - start;
    drawSky(t);
    drawField(t);
  };

  const loop = (now) => {
    paint(now);
    if (!reduceMotion && visible) frame = window.requestAnimationFrame(loop);
    else running = false;
  };

  const play = () => {
    if (reduceMotion || running || !visible) return;
    running = true;
    frame = window.requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frame);
  };

  const onResize = () => {
    build();
    paint(performance.now());
  };

  build();
  if (reduceMotion) paint(start);
  else play();

  window.addEventListener("resize", onResize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) play();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
        else stop();
      },
      { threshold: 0.05 }
    ).observe(canvas);
  }
})();
