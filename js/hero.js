(() => {
  const art = document.querySelector(".hero-art");
  if (!art) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = art.querySelector(".hero-stage");
  const viewW = 1600;
  const viewH = 900;
  const spanX = 1180;
  const spanY = 840;
  const paths = [...art.querySelectorAll(".draw")];

  const fitStage = () => {
    if (!stage) return;
    const rect = art.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    const cover = Math.max(rect.width / viewW, rect.height / viewH);
    const visibleWidth = rect.width / cover;
    const visibleHeight = rect.height / cover;
    const next = Math.min(1, visibleWidth / spanX, visibleHeight / spanY);
    stage.setAttribute("transform", `scale(${Math.max(0.32, next)})`);
  };

  paths.forEach((path, index) => {
    let length = 0;
    try {
      length = path.getTotalLength();
    } catch {
      return;
    }
    if (length < 1) return;

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduceMotion ? "0" : `${length}`;
    if (!reduceMotion) {
      const delay = Math.min(index * 0.028, 0.85);
      path.style.transition = `stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
    }
  });

  const reveal = () => {
    paths.forEach((path) => {
      path.style.strokeDashoffset = "0";
    });
    art.classList.add("is-drawn");
    if (!reduceMotion) {
      window.requestAnimationFrame(() => art.classList.add("is-alive"));
    }
  };

  window.requestAnimationFrame(() => {
    fitStage();
    window.requestAnimationFrame(reveal);
  });
  window.addEventListener("resize", fitStage);
  window.visualViewport?.addEventListener("resize", fitStage);
})();
