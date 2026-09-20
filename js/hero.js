(() => {
  const art = document.querySelector(".hero-art");
  if (!art) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = window.matchMedia("(max-width: 833px)");
  const pieces = [...art.querySelectorAll(".hero-piece")];
  const paths = [...art.querySelectorAll(".draw")];

  const fitArt = () => {
    const mobile = mobileQuery.matches;
    art.setAttribute("preserveAspectRatio", mobile ? "xMidYMid meet" : "xMidYMid slice");
    art.setAttribute("viewBox", mobile ? "500 0 600 900" : "0 0 1600 900");
    pieces.forEach((piece) => {
      const next = mobile ? piece.dataset.phone : piece.dataset.desk;
      if (next) piece.setAttribute("transform", next);
    });
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

  fitArt();
  window.requestAnimationFrame(() => window.requestAnimationFrame(reveal));
  window.addEventListener("resize", fitArt);
  mobileQuery.addEventListener("change", fitArt);
  window.visualViewport?.addEventListener("resize", fitArt);
})();
