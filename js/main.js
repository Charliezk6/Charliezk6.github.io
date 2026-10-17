(() => {
  const STORAGE_KEY = "kz-lang";
  const EMAIL = "charliecheungzk6@gmail.com";
  const AUDIO_SRC = "assets/music/desafinado.m4a";
  const root = document.documentElement;
  const toast = document.getElementById("toast");
  const timelineEl = document.getElementById("timeline");
  const researchEl = document.getElementById("research-list");
  const computingEl = document.getElementById("computing-list");
  const writingEl = document.getElementById("writing-list");
  const galleryEl = document.getElementById("gallery");
  const resumeEl = document.getElementById("resume");
  const resumeClose = document.querySelector(".resume-close");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCount = document.getElementById("lightbox-count");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const dossierEl = document.getElementById("dossier");
  const dossierKicker = document.getElementById("dossier-kicker");
  const dossierTitle = document.getElementById("dossier-title");
  const dossierStage = document.getElementById("dossier-stage");
  const dossierClose = document.querySelector(".dossier-close");
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const navToggle = document.getElementById("nav-toggle");
  const navToggleLabel = document.getElementById("nav-toggle-label");
  const navDrawer = document.getElementById("nav-drawer");
  const playerFab = document.getElementById("player-fab");
  const siteAudio = document.getElementById("site-audio");

  const getDict = (value) => window.I18N[value] || window.I18N.zh;
  const stored = localStorage.getItem(STORAGE_KEY);
  let lang = stored === "en" || stored === "zh" ? stored : "zh";
  let photoIndex = 0;
  let lastFocus = null;
  let audioReady = false;

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
    );

  const readPath = (dict, path) => {
    let value = dict;
    for (const key of path.split(".")) value = value?.[key];
    return value;
  };

  const setText = (el, value) => {
    if (!el || value == null) return;
    el.textContent = value;
  };

  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
  const outIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"></path></svg>';

  const DOCS = [
    [
      { kind: "pdf", src: "assets/docs/apmcm-paper.pdf" },
      { kind: "pdf", src: "assets/docs/apmcm-award.pdf" },
    ],
    [
      { kind: "pdf", src: "assets/docs/huashu-paper.pdf" },
      { kind: "image", src: "assets/docs/huashu-award.png" },
    ],
    [{ kind: "pdf", src: "assets/docs/xiong-award.pdf" }],
  ];

  const postMarks = [
    `<svg class="mark-moon" viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="34" r="13" fill="currentColor"/><circle cx="35" cy="30" r="11" fill="#101010"/><circle class="twinkle" cx="48" cy="18" r="1.8" fill="currentColor"/></svg>`,
    `<svg class="mark-bowl" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path class="steam" d="M26 24c2.2-3.4-.4-5.2 1.6-9"/><path class="steam steam-b" d="M36 24c2.2-3.4-.4-5.2 1.6-9"/><path d="M16 36h32c-1.2 8.4-8 14-16 14s-14.8-5.6-16-14z"/><path d="M20 36h24"/></svg>`,
    `<svg class="mark-kashgar" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle class="mark-sun" cx="44" cy="18" r="3.2" fill="currentColor" stroke="none"/><path d="M18 48V32a14 14 0 0 1 28 0v16"/><path d="M14 48h36"/></svg>`,
    `<svg class="mark-film" viewBox="0 0 64 64" aria-hidden="true" fill="currentColor"><rect x="18" y="16" width="28" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect class="gate" x="24" y="24" width="16" height="12" rx="1"/><circle cx="22" cy="20" r="1.1"/><circle cx="22" cy="26" r="1.1"/><circle cx="22" cy="32" r="1.1"/><circle cx="22" cy="38" r="1.1"/><circle cx="22" cy="44" r="1.1"/><circle cx="42" cy="20" r="1.1"/><circle cx="42" cy="26" r="1.1"/><circle cx="42" cy="32" r="1.1"/><circle cx="42" cy="38" r="1.1"/><circle cx="42" cy="44" r="1.1"/></svg>`,
  ];

  const renderTimeline = (items) => {
    timelineEl.innerHTML = items
      .map(
        (item) => `
      <li class="timeline-item">
        <p class="timeline-period">${esc(item.period)}</p>
        <div class="timeline-body">
          <h3>${esc(item.org)}</h3>
          <p class="timeline-role">${esc(item.role)}</p>
          <p class="timeline-detail">${esc(item.detail)}</p>
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
        <p class="research-tag">${esc(item.tag)}</p>
        <h3>${esc(item.title)}</h3>
        <p class="research-meta">${esc(item.meta)}</p>
        <p class="research-detail">${esc(item.detail)}</p>
      </article>`
      )
      .join("");
  };

  const renderComputing = (dict) => {
    const spans = ["span-7", "span-5", "span-12"];
    const covers = [
      "assets/computing/modeling.webp",
      "assets/computing/lighting.webp",
      "assets/computing/llm.webp",
    ];
    computingEl.innerHTML = dict.computing.items
      .map((item, index) => {
        const keys = (item.files || [])
          .map((file, fileIndex) => {
            const label = file.href ? file.name : dict.computing[file.role] || file.name;
            if (file.href) {
              return `<a class="doc-key" href="${esc(file.href)}" target="_blank" rel="noopener noreferrer">${esc(label)}${outIcon}</a>`;
            }
            return `<button type="button" class="doc-key" data-doc="${index}" data-file="${fileIndex}">${esc(label)}</button>`;
          })
          .join("");
        return `
      <article class="work-card ${spans[index] || "span-12"}">
        <img class="work-photo" src="${esc(covers[index])}" alt="${esc(item.alt || "")}" width="1280" height="720" loading="lazy" decoding="async" />
        <div class="work-card-body">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.detail)}</p>
          <div class="doc-keys">${keys}</div>
        </div>
      </article>`;
      })
      .join("");
  };

  const renderWriting = (posts) => {
    if (!writingEl || !Array.isArray(posts)) return;
    writingEl.innerHTML = posts
      .map(
        (post, index) => `
      <a class="journal-row" href="${esc(post.href)}" target="_blank" rel="noopener noreferrer">
        <span class="post-mark">${postMarks[index] || ""}</span>
        <span class="journal-copy"><h3>${esc(post.title)}</h3></span>
        <span class="row-go">${arrow}</span>
      </a>`
      )
      .join("");
  };

  const renderGallery = (dict) => {
    const photos = window.PHOTOS || [];
    if (!galleryEl) return;
    galleryEl.innerHTML = photos
      .map((photo, index) => {
        const alt = photo.alt?.[lang] || photo.alt?.zh || "";
        const num = String(index + 1).padStart(2, "0");
        return `
      <button type="button" class="plate" data-index="${index}">
        <img src="${esc(photo.thumb)}" alt="${esc(alt)}" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async" />
        <span class="plate-meta" aria-hidden="true"><span class="plate-no">${num}</span><span class="plate-cap">${esc(alt)}</span></span>
      </button>`;
      })
      .join("");
  };

  let pdfTask = null;
  let pdfRenderGen = 0;
  let pdfLibReady = null;

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(src));
      document.head.appendChild(script);
    });

  const ensurePdfEngine = () => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("js/vendor/pdf.worker.min.js", document.baseURI).href;
      return Promise.resolve(window.pdfjsLib);
    }
    if (!pdfLibReady) {
      pdfLibReady = loadScript("js/vendor/pdf.min.js")
        .then(() => {
          const lib = window.pdfjsLib;
          if (!lib) throw new Error("missing");
          lib.GlobalWorkerOptions.workerSrc = new URL("js/vendor/pdf.worker.min.js", document.baseURI).href;
          return lib;
        })
        .catch((error) => {
          pdfLibReady = null;
          throw error;
        });
    }
    return pdfLibReady;
  };

  const sheetLink = (url) =>
    `<a class="sheet-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(getDict(lang).computing.openFile)}</a>`;

  const stopPdf = () => {
    pdfRenderGen += 1;
    if (pdfTask) {
      const task = pdfTask;
      pdfTask = null;
      try {
        task.destroy();
      } catch (error) {
        /* already closed */
      }
    }
  };

  const renderPdf = async (url) => {
    const pages = document.getElementById("pdf-pages");
    if (!pages) return;
    stopPdf();
    const gen = pdfRenderGen;
    const dict = getDict(lang);
    try {
      await ensurePdfEngine();
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      const response = await fetch(url);
      if (!response.ok) throw new Error("missing");
      const data = await response.arrayBuffer();
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      const loading = window.pdfjsLib.getDocument({
        data,
        cMapUrl: new URL("js/vendor/cmaps/", document.baseURI).href,
        cMapPacked: true,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true,
        isOffscreenCanvasSupported: false,
        useWorkerFetch: false,
      });
      pdfTask = loading;
      const pdf = await loading.promise;
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      pages.innerHTML = `
        <div class="pdf-stage" id="pdf-stage"></div>
        <div class="pdf-pager">
          <button type="button" class="pdf-step" id="pdf-prev">${esc(dict.computing.prevPage)}</button>
          <span class="pdf-count" id="pdf-count"></span>
          <button type="button" class="pdf-step" id="pdf-next">${esc(dict.computing.nextPage)}</button>
        </div>`;
      const stage = document.getElementById("pdf-stage");
      const count = document.getElementById("pdf-count");
      const prev = document.getElementById("pdf-prev");
      const next = document.getElementById("pdf-next");
      let current = 1;
      const showPage = async (pageNumber) => {
        if (gen !== pdfRenderGen || !stage) return;
        current = pageNumber;
        count.textContent = `${current} / ${pdf.numPages}`;
        prev.disabled = current <= 1;
        next.disabled = current >= pdf.numPages;
        try {
          const page = await pdf.getPage(current);
          if (gen !== pdfRenderGen) return;
          const base = page.getViewport({ scale: 1 });
          const maxCss = Math.min(Math.max(stage.clientWidth - 8, 280), 920);
          const viewport = page.getViewport({ scale: Math.min(maxCss / base.width, 1.5) });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          stage.replaceChildren(canvas);
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          await page.render({ canvasContext: context, viewport }).promise;
        } catch (error) {
          if (gen !== pdfRenderGen) return;
          stage.innerHTML = sheetLink(url);
        }
      };
      prev.addEventListener("click", () => {
        if (current > 1) showPage(current - 1);
      });
      next.addEventListener("click", () => {
        if (current < pdf.numPages) showPage(current + 1);
      });
      await showPage(1);
    } catch (error) {
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      pages.innerHTML = `<p>${esc(dict.computing.fail)}</p>${sheetLink(url)}`;
    }
  };

  const openViewer = (docIndex, fileIndex) => {
    const dict = getDict(lang);
    const item = dict.computing.items[docIndex];
    const file = DOCS[docIndex] && DOCS[docIndex][fileIndex];
    const meta = item && item.files && item.files[fileIndex];
    if (!file || !meta || !dossierEl) return;
    const href = encodeURI(file.src);
    setText(dossierKicker, dict.computing.dossierKicker);
    setText(dossierTitle, meta.name);
    if (dossierClose) dossierClose.setAttribute("aria-label", dict.computing.close);
    if (file.kind === "image") {
      dossierStage.innerHTML = `<div class="sheet-frame"><img src="${esc(href)}" alt="${esc(meta.name)}" /></div>`;
    } else {
      dossierStage.innerHTML = `<div class="pdf-pages" id="pdf-pages"><p>${esc(dict.computing.loading)}</p></div>`;
      renderPdf(href);
    }
    if (typeof dossierEl.showModal === "function") dossierEl.showModal();
    else dossierEl.setAttribute("open", "");
  };

  const closeDossier = () => {
    stopPdf();
    if (!dossierEl) return;
    if (typeof dossierEl.close === "function" && dossierEl.open) dossierEl.close();
    else dossierEl.removeAttribute("open");
  };

  const setMenu = (open) => {
    if (!navToggle || !navDrawer) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navDrawer.hidden = !open;
    document.body.classList.toggle("is-menu", open);
    const dict = getDict(lang);
    if (navToggleLabel) navToggleLabel.textContent = open ? dict.nav.close : dict.nav.menu;
    if (open) navDrawer.querySelector("a")?.focus();
  };

  const setPlaying = (on) => {
    if (!playerFab) return;
    const dict = getDict(lang);
    playerFab.classList.toggle("is-on", on);
    playerFab.setAttribute("aria-pressed", String(on));
    playerFab.setAttribute("aria-label", on ? dict.music.pause : dict.music.play);
  };

  const toggleAudio = () => {
    if (!siteAudio) return;
    if (!siteAudio.paused && !siteAudio.ended) {
      siteAudio.pause();
      return;
    }
    if (!audioReady) {
      siteAudio.preload = "none";
      siteAudio.src = AUDIO_SRC;
      audioReady = true;
    }
    const played = siteAudio.play();
    if (played) played.then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const applyLang = (next) => {
    lang = next;
    localStorage.setItem(STORAGE_KEY, lang);
    const dict = getDict(lang);
    root.lang = lang === "en" ? "en" : "zh-CN";
    const title = lang === "en" ? "Kun Zhang / 张焜" : "张焜 / Kun Zhang";
    document.title = title;
    if (metaDescription) metaDescription.setAttribute("content", dict.metaDescription);
    if (ogDescription) ogDescription.setAttribute("content", dict.metaDescription);
    if (twitterDescription) twitterDescription.setAttribute("content", dict.metaDescription);
    if (ogTitle) ogTitle.setAttribute("content", title);
    if (twitterTitle) twitterTitle.setAttribute("content", title);
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "zh_CN");
    if (resumeClose) resumeClose.setAttribute("aria-label", dict.resume.close);
    if (lightbox.querySelector(".lightbox-close")) {
      lightbox.querySelector(".lightbox-close").setAttribute("aria-label", dict.photo.close);
      lightbox.querySelector(".lightbox-prev").setAttribute("aria-label", dict.photo.prev);
      lightbox.querySelector(".lightbox-next").setAttribute("aria-label", dict.photo.next);
    }

    document.querySelectorAll("button[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = readPath(dict, el.dataset.i18n);
      if (typeof value === "string") setText(el, value);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const value = readPath(dict, el.dataset.i18nAria);
      if (typeof value === "string") el.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const value = readPath(dict, el.dataset.i18nAlt);
      if (typeof value === "string") el.setAttribute("alt", value);
    });

    document.querySelectorAll("[data-i18n-copy]").forEach((el) => {
      const value = readPath(dict, el.dataset.i18nCopy);
      if (typeof value === "string") {
        el.dataset.label = value;
        setText(el, value);
      }
    });

    if (navToggleLabel && navToggle) {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggleLabel.textContent = open ? dict.nav.close : dict.nav.menu;
    }

    renderComputing(dict);
    renderWriting(dict.writing.posts);
    renderTimeline(dict.resume.path);
    renderResearch(dict.resume.research);
    renderGallery(dict);
    setPlaying(siteAudio ? !siteAudio.paused && !siteAudio.ended && audioReady : false);
    if (window.SiteMotion) window.SiteMotion.mount(() => getDict(lang));
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
    if (typeof resumeEl.close === "function" && resumeEl.open) resumeEl.close();
    else resumeEl.removeAttribute("open");
  };

  const showPhoto = (index) => {
    const photos = window.PHOTOS || [];
    if (!photos.length) return;
    const dict = getDict(lang);
    if (lightbox.hidden) lastFocus = document.activeElement;
    photoIndex = (index + photos.length) % photos.length;
    const photo = photos[photoIndex];
    const alt = photo.alt?.[lang] || photo.alt?.zh || "";
    lightboxImg.src = photo.src;
    lightboxImg.alt = alt;
    lightboxCount.textContent = `${String(photoIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    lightboxCaption.textContent = alt;
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lightbox.querySelector(".lightbox-close").focus();
    lightbox.querySelector(".lightbox-close").setAttribute("aria-label", dict.photo.close);
  };

  const hidePhoto = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  const trapLightbox = (event) => {
    if (event.key !== "Tab" || lightbox.hidden) return;
    const items = [...lightbox.querySelectorAll("button")];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (siteAudio) {
    siteAudio.preload = "none";
    siteAudio.addEventListener("playing", () => setPlaying(true));
    siteAudio.addEventListener("pause", () => setPlaying(false));
    siteAudio.addEventListener("ended", () => setPlaying(false));
  }
  if (playerFab) playerFab.addEventListener("click", toggleAudio);

  document.querySelectorAll("button[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  if (navToggle) navToggle.addEventListener("click", () => setMenu(navToggle.getAttribute("aria-expanded") !== "true"));
  if (navDrawer) {
    navDrawer.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
  }
  window.matchMedia("(min-width: 960px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  document.querySelectorAll(".resume-open").forEach((btn) => {
    btn.addEventListener("click", openResume);
  });
  resumeClose.addEventListener("click", closeResume);
  resumeEl.addEventListener("click", (event) => {
    if (event.target === resumeEl) closeResume();
  });

  computingEl.addEventListener("click", (event) => {
    const key = event.target.closest("[data-file]");
    if (!key) return;
    openViewer(Number(key.dataset.doc), Number(key.dataset.file));
  });

  if (dossierClose) dossierClose.addEventListener("click", closeDossier);
  if (dossierEl) {
    dossierEl.addEventListener("click", (event) => {
      if (event.target === dossierEl) closeDossier();
    });
    dossierEl.addEventListener("close", stopPdf);
  }

  document.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest(".copy-btn");
    if (copyBtn) {
      const ok = await copyText(copyBtn.dataset.copy || EMAIL);
      const dict = getDict(lang);
      showToast(ok ? dict.copy.done : copyBtn.dataset.copy);
      if (ok) {
        setText(copyBtn, dict.copy.done);
        window.setTimeout(() => setText(copyBtn, copyBtn.dataset.label || dict.copy.done), 1400);
      }
      return;
    }
    const item = event.target.closest(".plate");
    if (item) showPhoto(Number(item.dataset.index));
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", hidePhoto);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(photoIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) hidePhoto();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navDrawer && !navDrawer.hidden) {
      setMenu(false);
      navToggle.focus();
      return;
    }
    if (event.key === "Escape" && resumeEl.open) closeResume();
    if (event.key === "Escape" && dossierEl && dossierEl.open) closeDossier();
    if (dossierEl && dossierEl.open && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      const control = document.getElementById(event.key === "ArrowLeft" ? "pdf-prev" : "pdf-next");
      if (control && !control.disabled) control.click();
    }
    trapLightbox(event);
    if (lightbox.hidden) return;
    if (event.key === "Escape") hidePhoto();
    if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
    if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
  });

  applyLang(lang);
})();
