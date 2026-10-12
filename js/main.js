(() => {
  const STORAGE_KEY = "kz-lang";
  const root = document.documentElement;
  const toast = document.getElementById("toast");
  const timelineEl = document.getElementById("timeline");
  const researchEl = document.getElementById("research-list");
  const computingEl = document.getElementById("computing-list");
  const writingEl = document.getElementById("writing-list");
  const galleryLeft = document.getElementById("gallery-left");
  const galleryRight = document.getElementById("gallery-right");
  const resumeEl = document.getElementById("resume");
  const resumeClose = document.querySelector(".resume-close");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const dossierEl = document.getElementById("dossier");
  const dossierKicker = document.getElementById("dossier-kicker");
  const dossierTitle = document.getElementById("dossier-title");
  const dossierStage = document.getElementById("dossier-stage");
  const dossierClose = document.querySelector(".dossier-close");
  const metaDescription = document.querySelector('meta[name="description"]');

  const getDict = (lang) => window.I18N[lang] || window.I18N.zh;

  const stored = localStorage.getItem(STORAGE_KEY);
  let lang = stored === "en" || stored === "zh" ? stored : "zh";
  let photoIndex = 0;

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

  const setText = (el, value) => {
    if (!el || value == null) return;
    el.textContent = value;
  };

  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

  const DOCS = [
    [
      { kind: "pdf", src: "assets/docs/apmcm-paper.pdf" },
      { kind: "pdf", src: "assets/docs/apmcm-award.pdf" },
    ],
    [
      { kind: "pdf", src: "assets/docs/huashu-paper.pdf" },
      { kind: "image", src: "assets/docs/huashu-award.png" },
    ],
    [
      { kind: "pdf", src: "assets/docs/xiong-award.pdf" },
      {
        kind: "archive",
        src: "论文证书/大语言模型/智审通.mhtml",
        href: "https://www.tongyi.com/discover/chat?agentId=A-92285-b5558f41&type=MyAgent",
      },
    ],
  ];

  const fileHref = (src) => encodeURI(src);

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
      "assets/computing/modeling.jpg",
      "assets/computing/lighting.jpg",
      "assets/computing/llm.jpg",
    ];
    computingEl.innerHTML = dict.computing.items
      .map((item, index) => {
        const span = spans[index] || "span-12";
        const cover = covers[index] || covers[covers.length - 1];
        const keys = (item.files || [])
          .map((file, fileIndex) => {
            const label = file.role === "archive" ? file.name : dict.computing[file.role] || file.name;
            return `<button type="button" class="doc-key" data-doc="${index}" data-file="${fileIndex}">${esc(label)}</button>`;
          })
          .join("");
        return `
      <article class="work-card ${span}">
        <img class="work-photo" src="${esc(cover)}" alt="" />
        <div class="work-card-body">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.detail)}</p>
          <div class="doc-keys">${keys}</div>
        </div>
      </article>`;
      })
      .join("");
  };

  let pdfTask = null;
  let pdfDoc = null;
  let pdfRenderGen = 0;

  const sheetLink = (url) =>
    `<a class="sheet-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(getDict(lang).computing.openFile)}</a>`;

  const stopPdf = () => {
    pdfRenderGen += 1;
    pdfDoc = null;
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
    if (!window.pdfjsLib) {
      pages.innerHTML = sheetLink(url);
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("missing");
      const data = await response.arrayBuffer();
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      const loading = window.pdfjsLib.getDocument({
        data,
        cMapUrl: "js/vendor/cmaps/",
        cMapPacked: true,
        disableWorker: true,
        disableRange: true,
        disableStream: true,
      });
      pdfTask = loading;
      const pdf = await loading.promise;
      if (gen !== pdfRenderGen || !pages.isConnected) return;
      pdfDoc = pdf;
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
        stage.innerHTML = "";
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
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          await page.render({ canvasContext: context, viewport }).promise;
          if (gen !== pdfRenderGen) return;
          stage.replaceChildren(canvas);
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
      if (!pages.querySelector("canvas")) {
        pages.innerHTML = `<p>${esc(dict.computing.fail)}</p>${sheetLink(url)}`;
      }
    }
  };

  const openViewer = (docIndex, fileIndex) => {
    const dict = getDict(lang);
    const item = dict.computing.items[docIndex];
    const file = DOCS[docIndex] && DOCS[docIndex][fileIndex];
    const meta = item && item.files && item.files[fileIndex];
    if (!file || !meta || !dossierEl) return;
    const href = fileHref(file.src);
    setText(dossierKicker, dict.computing.dossierKicker);
    setText(dossierTitle, meta.name);
    if (dossierClose) dossierClose.setAttribute("aria-label", dict.computing.close);
    dossierEl.classList.toggle("is-archive", file.kind === "archive");
    if (file.kind === "archive") {
      dossierStage.innerHTML = `
        <div class="archive-scene">
          <img src="assets/computing/zhishentong.jpg" alt="" />
          <div class="archive-scene-copy">
            <h3>${esc(meta.name)}</h3>
            <a class="btn-fill" href="${esc(href)}" download>${esc(dict.computing.openArchive)}</a>
          </div>
        </div>`;
    } else if (file.kind === "image") {
      dossierStage.innerHTML = `<div class="sheet-frame single"><img src="${esc(href)}" alt="${esc(meta.name)}" /></div>`;
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

  const renderWriting = (posts) => {
    if (!writingEl || !Array.isArray(posts)) return;
    writingEl.innerHTML = posts
      .map(
        (post, index) => `
      <a class="journal-row" href="${esc(post.href)}" target="_blank" rel="noopener noreferrer">
        <span class="post-mark">${postMarks[index] || ""}</span>
        <span class="journal-copy"><h3>${esc(post.title)}</h3></span>
        <span class="row-go" aria-hidden="true">${arrow}</span>
      </a>`
      )
      .join("");
  };

  const renderGallery = (dict) => {
    const photos = window.PHOTOS || [];
    const leftRots = [-4, 3, -2];
    const rightRots = [4, -3, 2];
    const columns = { left: [], right: [] };
    photos.forEach((photo, index) => {
      const side = index % 2 === 0 ? "left" : "right";
      const slot = Math.floor(index / 2) % 3;
      const rot = side === "left" ? leftRots[slot] : rightRots[slot];
      columns[side].push({ photo, index, rot });
    });
    const paint = (items) =>
      items
        .map(
          ({ photo, index, rot }) => `
      <button type="button" class="gallery-item shot" data-index="${index}" style="--rot:${rot}deg" aria-label="${esc(dict.photo.open)} ${index + 1}">
        <img src="${esc(photo.src)}" alt="" width="${photo.w}" height="${photo.h}" loading="lazy" />
      </button>`
        )
        .join("");
    galleryLeft.innerHTML = paint(columns.left);
    galleryRight.innerHTML = paint(columns.right);
  };

  const applyLang = (next) => {
    lang = next;
    localStorage.setItem(STORAGE_KEY, lang);
    const dict = getDict(lang);
    root.lang = lang === "en" ? "en" : "zh-CN";
    document.title = lang === "en" ? "Kun Zhang / 张焜" : "张焜 / Kun Zhang";
    if (metaDescription) metaDescription.setAttribute("content", dict.metaDescription);
    if (resumeClose) resumeClose.setAttribute("aria-label", dict.resume.close);

    document.querySelectorAll("button[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.dataset.i18n.split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") setText(el, value);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const path = el.dataset.i18nAria.split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") el.setAttribute("aria-label", value);
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

    renderComputing(dict);
    renderWriting(dict.writing.posts);
    renderTimeline(dict.resume.path);
    renderResearch(dict.resume.research);
    renderGallery(dict);
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

  const playerFab = document.getElementById("player-fab");
  const trackToggle = document.getElementById("track-toggle");
  const siteAudio = document.getElementById("site-audio");
  let userPaused = false;

  const setPlaying = (on) => {
    if (playerFab) {
      playerFab.classList.toggle("is-on", on);
      playerFab.setAttribute("aria-pressed", String(on));
    }
    if (trackToggle) trackToggle.classList.toggle("is-on", on);
  };

  const tryPlay = () => {
    if (!siteAudio || userPaused) return;
    const played = siteAudio.play();
    if (played) played.then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const toggleAudio = () => {
    if (!siteAudio) return;
    if (!siteAudio.paused && !siteAudio.ended) {
      userPaused = true;
      siteAudio.pause();
      setPlaying(false);
      return;
    }
    userPaused = false;
    tryPlay();
  };

  if (siteAudio) {
    siteAudio.preload = "auto";
    siteAudio.src = "assets/music/desafinado.m4a";
    siteAudio.autoplay = true;
    siteAudio.addEventListener("playing", () => setPlaying(true));
    siteAudio.addEventListener("pause", () => setPlaying(false));
    siteAudio.addEventListener("ended", () => {
      userPaused = false;
      setPlaying(false);
    });
    tryPlay();
    window.addEventListener("pageshow", tryPlay);
    document.addEventListener(
      "pointerdown",
      () => {
        if (siteAudio.paused && !userPaused) tryPlay();
      },
      { capture: true }
    );
  }
  if (playerFab) playerFab.addEventListener("click", toggleAudio);
  if (trackToggle) trackToggle.addEventListener("click", toggleAudio);

  document.querySelectorAll("button[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
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
  }

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
    if (event.key === "Escape" && resumeEl.open) closeResume();
    if (event.key === "Escape" && dossierEl && dossierEl.open) closeDossier();
    if (lightbox.hidden) return;
    if (event.key === "Escape") hidePhoto();
    if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
    if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
  });

  applyLang(lang);
})();
