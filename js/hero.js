(() => {
  const art = document.querySelector(".hero-art");
  if (!art) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paths = [...art.querySelectorAll(".draw")];

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

  window.requestAnimationFrame(() => window.requestAnimationFrame(reveal));
})();
