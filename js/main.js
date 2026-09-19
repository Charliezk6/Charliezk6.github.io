(() => {
  const STORAGE_KEY = "kz-lang";
  const root = document.documentElement;
  const toast = document.getElementById("toast");
  const header = document.querySelector(".site-header");
  const timelineEl = document.getElementById("timeline");
  const researchEl = document.getElementById("research-list");
  const computingEl = document.getElementById("computing-list");
  const galleryEl = document.getElementById("gallery");
  const resumeEl = document.getElementById("resume");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const metaDescription = document.querySelector('meta[name="description"]');

  const getDict = (lang) => window.I18N[lang] || window.I18N.zh;

  const stored = localStorage.getItem(STORAGE_KEY);
  let lang = stored === "en" || stored === "zh" ? stored : "zh";
  let photoIndex = 0;

  const setText = (el, value) => {
    if (!el || value == null) return;
    el.textContent = value;
  };

  const renderTimeline = (items) => {
    timelineEl.innerHTML = items
      .map(
        (item) => `
      <li class="timeline-item">
        <p class="timeline-period">${item.period}</p>
        <div class="timeline-body">
          <h3>${item.org}</h3>
          <p class="timeline-role">${item.role}</p>
          <p class="timeline-detail">${item.detail}</p>
        </div>
      </li>`
      )
      .join("");
  };

  const renderResearch = (items) => {
    researchEl.innerHTML = items
      .map(
        (item) => `
      <article class="research-item">
        <p class="research-tag">${item.tag}</p>
        <h3>${item.title}</h3>
        <p class="research-meta">${item.meta}</p>
        <p class="research-detail">${item.detail}</p>
      </article>`
      )
      .join("");
  };

  const renderComputing = (items) => {
    computingEl.innerHTML = items
      .map(
        (item) => `
      <article class="work-item">
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      </article>`
      )
      .join("");
  };

  const renderGallery = () => {
    const photos = window.PHOTOS || [];
    galleryEl.innerHTML = photos
      .map(
        (photo, index) => `
      <button type="button" class="gallery-item" data-index="${index}" aria-label="Open photograph ${index + 1}">
        <img src="${photo.src}" alt="" width="${photo.w}" height="${photo.h}" loading="lazy" />
      </button>`
      )
      .join("");
  };

  const applyLang = (next) => {
    lang = next;
    localStorage.setItem(STORAGE_KEY, lang);
    const dict = getDict(lang);
    root.lang = lang === "en" ? "en" : "zh-CN";
    document.title = lang === "en" ? "Kun Zhang / 张焜" : "张焜 / Kun Zhang";
    if (metaDescription) metaDescription.setAttribute("content", dict.metaDescription);

    document.querySelectorAll("button[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.dataset.i18n.split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") setText(el, value);
    });

    document.querySelectorAll("[data-i18n-copy]").forEach((el) => {
      const path = el.dataset.i18nCopy.split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") {
        el.dataset.label = value;
        setText(el, value);
      }
    });

    renderComputing(dict.computing.items);
    renderTimeline(dict.resume.path);
    renderResearch(dict.resume.research);
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-on");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-on"), 1600);
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }
  };

  const openResume = () => {
    if (typeof resumeEl.showModal === "function") resumeEl.showModal();
    else resumeEl.setAttribute("open", "");
  };

  const closeResume = () => {
    if (typeof resumeEl.close === "function") resumeEl.close();
    else resumeEl.removeAttribute("open");
  };

  const showPhoto = (index) => {
    const photos = window.PHOTOS || [];
    if (!photos.length) return;
    photoIndex = (index + photos.length) % photos.length;
    lightboxImg.src = photos[photoIndex].src;
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
  };

  const hidePhoto = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.classList.remove("is-locked");
  };

  document.querySelectorAll("button[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  document.querySelectorAll(".resume-open").forEach((btn) => {
    btn.addEventListener("click", openResume);
  });
  document.querySelector(".resume-close").addEventListener("click", closeResume);
  resumeEl.addEventListener("click", (event) => {
    if (event.target === resumeEl) closeResume();
  });

  document.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest(".copy-btn");
    if (copyBtn) {
      const ok = await copyText(copyBtn.dataset.copy);
      const dict = getDict(lang);
      showToast(ok ? dict.copy.done : copyBtn.dataset.copy);
      if (ok) {
        setText(copyBtn, dict.copy.done);
        window.setTimeout(() => setText(copyBtn, copyBtn.dataset.label || dict.copy.done), 1400);
      }
      return;
    }
    const item = event.target.closest(".gallery-item");
    if (item) showPhoto(Number(item.dataset.index));
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", hidePhoto);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(photoIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) hidePhoto();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") hidePhoto();
    if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
    if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
  });

  const hero = document.querySelector(".hero");
  const onScroll = () => {
    const pastHero = window.scrollY > (hero?.offsetHeight || 480) - 72;
    header.classList.toggle("is-over-hero", !pastHero);
    header.classList.toggle("is-solid", pastHero);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  renderGallery();
  applyLang(lang);
})();
