(() => {
  "use strict";

  const Core = globalThis.NotRecommendedCore;
  const DEFAULTS = {
    enabled: true,
    hideSidebar: true,
    hideComments: false,
    hideShorts: true,
    intentPrompt: true,
    threads: [],
    saved: [],
  };
  let settings = {...DEFAULTS};
  let reconcileTimer = null;

  const storageGet = defaults => chrome.storage.local.get(defaults);
  const storageSet = value => chrome.storage.local.set(value);

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(response);
      });
    });
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, className = "cl-button") {
    const node = element("button", className, text);
    node.type = "button";
    return node;
  }

  function applyFlags() {
    const root = document.documentElement;
    root.dataset.nrEnabled = String(Boolean(settings.enabled));
    root.dataset.nrHideSidebar = String(Boolean(settings.hideSidebar));
    root.dataset.nrHideComments = String(Boolean(settings.hideComments));
    root.dataset.nrHideShorts = String(Boolean(settings.hideShorts));
  }

  function isHome() {
    return location.pathname === "/" || location.pathname === "/feed/recommended";
  }

  function isWatch() {
    return location.pathname === "/watch" && new URL(location.href).searchParams.has("v");
  }

  function goToSearch(query) {
    location.assign(Core.buildYouTubeSearchUrl(query));
  }

  function makeSectionHeading(kicker, title, description) {
    const group = element("div", "nr-section-heading");
    group.append(element("p", "nr-kicker", kicker), element("h2", "nr-h2", title));
    if (description) group.append(element("p", "nr-copy", description));
    return group;
  }

  function renderThreads(host) {
    const list = host.querySelector("[data-nr-threads]");
    if (!list) return;
    list.replaceChildren();
    if (!settings.threads.length) {
      list.append(element("p", "nr-empty", "No saved searches."));
      return;
    }
    settings.threads.forEach((thread, index) => {
      const row = element("div", "nr-thread-row");
      const open = button(thread, "nr-thread-open");
      open.addEventListener("click", () => goToSearch(thread));
      const remove = button("Remove", "nr-text-button");
      remove.setAttribute("aria-label", `Remove question: ${thread}`);
      remove.addEventListener("click", async () => {
        settings.threads = settings.threads.filter((_item, itemIndex) => itemIndex !== index);
        await storageSet({threads: settings.threads});
        renderThreads(host);
      });
      row.append(open, remove);
      list.append(row);
    });
  }

  function renderSaved(host) {
    const list = host.querySelector("[data-nr-saved]");
    if (!list) return;
    list.replaceChildren();
    if (!settings.saved.length) {
      list.append(element("p", "nr-empty", "No saved videos."));
      return;
    }
    settings.saved.slice().reverse().forEach(video => {
      const safe = Core.normalizeYouTubeVideo(video);
      if (!safe) return;
      const row = element("div", "nr-saved-row");
      const link = element("a", "nr-saved-link", safe.title);
      link.href = safe.url;
      const remove = button("Remove", "nr-text-button");
      remove.setAttribute("aria-label", `Remove saved video: ${safe.title}`);
      remove.addEventListener("click", async () => {
        settings.saved = settings.saved.filter(item => item.id !== safe.id);
        await storageSet({saved: settings.saved});
        renderSaved(host);
      });
      row.append(link, remove);
      list.append(row);
    });
  }

  function renderDetourCards(host, record, errorMessage) {
    const list = host.querySelector("[data-nr-detours]");
    const status = host.querySelector("[data-nr-detour-status]");
    list.replaceChildren();
    status.textContent = errorMessage || "";
    if (!record?.detours?.length) {
      list.append(element("p", "nr-empty", "Wikipedia is unavailable."));
      return;
    }
    record.detours.forEach((detour, index) => {
      const page = Core.normalizeWikipediaPage({
        pageid: detour.id,
        title: detour.title,
        extract: detour.summary,
        fullurl: detour.url,
      });
      if (!page) return;
      const card = element("article", "nr-detour-card");
      card.append(element("p", "nr-detour-number", String(index + 1).padStart(2, "0")));
      card.append(element("h3", "nr-detour-title", page.title));
      card.append(element("p", "nr-detour-summary", page.summary));
      const actions = element("div", "nr-detour-actions");
      const follow = button("Search YouTube", "nr-button nr-button-dark");
      follow.addEventListener("click", () => goToSearch(page.title));
      const read = element("a", "nr-button nr-button-light", "Wikipedia");
      read.href = page.url;
      read.target = "_blank";
      read.rel = "noopener noreferrer";
      actions.append(follow, read);
      card.append(actions);
      list.append(card);
    });
  }

  async function loadDetours(host, reroll = false) {
    if (host.dataset.nrLoading === "true") return;
    const rerollButton = host.querySelector("[data-nr-reroll]");
    const status = host.querySelector("[data-nr-detour-status]");
    host.dataset.nrLoading = "true";
    rerollButton.disabled = true;
    rerollButton.textContent = "Loading...";
    status.textContent = "";
    return sendMessage({type: reroll ? "REROLL_DETOURS" : "GET_DETOURS"})
      .then(response => {
        if (!document.contains(host)) return;
        const message = response?.ok ? "" : "Could not load a new set. Showing the previous one.";
        renderDetourCards(host, response?.record, message);
      })
      .catch(() => {
        if (document.contains(host)) renderDetourCards(host, null, "Wikipedia is unavailable.");
      })
      .finally(() => {
        if (document.contains(host)) {
          delete host.dataset.nrLoading;
          rerollButton.disabled = false;
          rerollButton.textContent = "New set";
        }
      });
  }

  function createHome() {
    const home = element("main", "nr-home");
    home.id = "not-recommended-home";

    const mast = element("header", "nr-mast");
    const titleWrap = element("div", "nr-title-wrap");
    titleWrap.append(element("p", "nr-kicker", "Not Recommended"), element("h1", "nr-title", "Skip the feed."));
    titleWrap.append(element("p", "nr-lede", "Search YouTube directly. Or open something the algorithm did not pick."));
    mast.append(titleWrap);

    const searchForm = element("form", "nr-search-form");
    const searchLabel = element("label", "nr-sr-only", "Search YouTube");
    searchLabel.htmlFor = "nr-question";
    const searchInput = element("input", "nr-input");
    searchInput.id = "nr-question";
    searchInput.name = "question";
    searchInput.placeholder = "What do you want to find?";
    searchInput.autocomplete = "off";
    const searchButton = button("Search", "nr-button nr-button-dark");
    searchButton.type = "submit";
    searchForm.append(searchLabel, searchInput, searchButton);
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (query) goToSearch(query);
    });

    const detours = element("section", "nr-detours-section");
    detours.setAttribute("aria-labelledby", "nr-detours-title");
    const detourHead = element("div", "nr-detour-head");
    const heading = makeSectionHeading("Outside the feed", "Three random Wikipedia articles.", "No profile. No ranking.");
    heading.querySelector("h2").id = "nr-detours-title";
    const reroll = button("New set", "nr-button nr-button-light");
    reroll.dataset.nrReroll = "";
    reroll.addEventListener("click", () => loadDetours(home, true));
    detourHead.append(heading, reroll);
    const status = element("p", "nr-status");
    status.dataset.nrDetourStatus = "";
    status.setAttribute("role", "status");
    const detourList = element("div", "nr-detour-grid");
    detourList.dataset.nrDetours = "";
    detours.append(detourHead, status, detourList);

    const lower = element("div", "nr-lower-grid");
    const threads = element("section", "nr-panel");
    threads.append(makeSectionHeading("Searches", "Saved searches.", "Stored in this browser."));
    const threadForm = element("form", "nr-add-form");
    const threadLabel = element("label", "nr-sr-only", "Save a search");
    threadLabel.htmlFor = "nr-thread-input";
    const threadInput = element("input", "nr-input");
    threadInput.id = "nr-thread-input";
    threadInput.placeholder = "Save a search";
    const add = button("Add", "nr-button nr-button-light");
    add.type = "submit";
    threadForm.append(threadLabel, threadInput, add);
    threadForm.addEventListener("submit", async event => {
      event.preventDefault();
      const question = threadInput.value.trim();
      if (!question) return;
      settings.threads = [...settings.threads, question].slice(-50);
      await storageSet({threads: settings.threads});
      threadInput.value = "";
      renderThreads(home);
    });
    const threadList = element("div", "nr-list");
    threadList.dataset.nrThreads = "";
    threads.append(threadForm, threadList);

    const saved = element("section", "nr-panel nr-panel-offset");
    saved.append(makeSectionHeading("Videos", "Saved videos.", "Only what you picked."));
    const savedList = element("div", "nr-list");
    savedList.dataset.nrSaved = "";
    saved.append(savedList);
    lower.append(threads, saved);

    home.append(mast, searchForm, detours, lower);
    renderThreads(home);
    renderSaved(home);
    loadDetours(home);
    return home;
  }

  function mountHome() {
    if (!settings.enabled || !isHome() || document.getElementById("not-recommended-home")) return;
    const browse = document.querySelector("ytd-browse[page-subtype='home']");
    if (browse) browse.prepend(createHome());
  }

  function getVideo() {
    const id = new URL(location.href).searchParams.get("v");
    const title = document.querySelector("h1.ytd-watch-metadata yt-formatted-string")?.textContent?.trim()
      || document.title.replace(/\s+-\s+YouTube$/, "").trim();
    return Core.normalizeYouTubeVideo({id, title, url: `https://www.youtube.com/watch?v=${encodeURIComponent(id || "")}`});
  }

  function showIntentDialog(trigger) {
    if (document.getElementById("nr-intent-dialog")) return;
    const video = getVideo();
    if (!video || sessionStorage.getItem(`nr-intent:${video.id}`)) return;
    const dialog = element("dialog", "nr-dialog");
    dialog.id = "nr-intent-dialog";
    dialog.setAttribute("aria-labelledby", "nr-intent-title");
    const form = element("form", "nr-dialog-card");
    form.method = "dialog";
    const dialogTitle = element("h2", "nr-dialog-title", "Why this one?");
    dialogTitle.id = "nr-intent-title";
    form.append(element("p", "nr-kicker", "Optional"), dialogTitle);
    form.append(element("p", "nr-copy", "Write a reason, or skip."));
    const label = element("label", "nr-field-label", "Reason");
    label.htmlFor = "nr-intent-input";
    const input = element("input", "nr-input");
    input.id = "nr-intent-input";
    input.autocomplete = "off";
    const actions = element("div", "nr-dialog-actions");
    const skip = button("Skip", "nr-button nr-button-light");
    skip.value = "skip";
    const keep = button("Continue", "nr-button nr-button-dark");
    keep.value = "continue";
    keep.type = "submit";
    actions.append(skip, keep);
    form.append(label, input, actions);
    dialog.append(form);
    document.body.append(dialog);
    const close = async save => {
      if (save && input.value.trim()) await storageSet({currentIntent: input.value.trim()});
      sessionStorage.setItem(`nr-intent:${video.id}`, "1");
      dialog.close();
    };
    skip.addEventListener("click", () => close(false));
    form.addEventListener("submit", event => {
      event.preventDefault();
      close(true);
    });
    dialog.addEventListener("cancel", () => sessionStorage.setItem(`nr-intent:${video.id}`, "1"));
    dialog.addEventListener("close", () => {
      dialog.remove();
      trigger?.focus();
    });
    dialog.showModal();
    input.focus();
  }

  function createWatchTools() {
    const tools = element("section", "nr-watch-tools");
    tools.id = "not-recommended-watch-tools";
    tools.dataset.nrVideoId = getVideo()?.id || "";
    tools.setAttribute("aria-label", "Not Recommended video tools");
    const head = element("div", "nr-watch-head");
    head.append(element("strong", "", "Not Recommended"));
    const row = element("div", "nr-watch-row");
    const save = button("Save", "nr-watch-button");
    save.addEventListener("click", async () => {
      const video = getVideo();
      if (!video) return;
      settings.saved = Core.mergeSavedVideos(settings.saved, {...video, savedAt: Date.now()});
      await storageSet({saved: settings.saved});
      save.textContent = "Saved";
    });
    const actions = [
      ["More detail", () => goToSearch(`${getVideo()?.title || ""} deeper explanation lecture`)],
      ["Find criticism", () => goToSearch(`${getVideo()?.title || ""} critique opposing view`)],
      ["Stop watching", () => location.assign("https://www.youtube.com/")],
    ];
    row.append(save);
    actions.forEach(([label, handler]) => {
      const action = button(label, "nr-watch-button");
      action.addEventListener("click", handler);
      row.append(action);
    });
    tools.append(head, row);
    return tools;
  }

  function mountWatch() {
    if (!settings.enabled || !isWatch()) return;
    const expectedVideoId = new URL(location.href).searchParams.get("v") || "";
    const existing = document.getElementById("not-recommended-watch-tools");
    if (existing?.dataset.nrVideoId === expectedVideoId) return;
    if (existing) {
      existing.remove();
      document.getElementById("nr-intent-dialog")?.remove();
    }
    const target = document.querySelector("#above-the-fold") || document.querySelector("ytd-watch-metadata");
    if (!target) return;
    const tools = createWatchTools();
    target.append(tools);
    if (settings.intentPrompt) showIntentDialog(tools.querySelector("button"));
  }

  function reconcile() {
    clearTimeout(reconcileTimer);
    reconcileTimer = null;
    if (!isHome()) document.getElementById("not-recommended-home")?.remove();
    if (!isWatch()) {
      document.getElementById("not-recommended-watch-tools")?.remove();
      document.getElementById("nr-intent-dialog")?.remove();
    }
    if (!settings.enabled) {
      document.getElementById("not-recommended-home")?.remove();
      document.getElementById("not-recommended-watch-tools")?.remove();
      document.getElementById("nr-intent-dialog")?.remove();
      return;
    }
    mountHome();
    mountWatch();
  }

  function scheduleReconcile() {
    if (reconcileTimer) return;
    reconcileTimer = setTimeout(reconcile, 120);
  }

  document.addEventListener("yt-navigate-finish", scheduleReconcile);
  new MutationObserver(scheduleReconcile).observe(document.documentElement, {childList: true, subtree: true});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    Object.entries(changes).forEach(([key, change]) => { settings[key] = change.newValue; });
    applyFlags();
    scheduleReconcile();
  });

  storageGet(DEFAULTS).then(values => {
    settings = {...DEFAULTS, ...values};
    applyFlags();
    reconcile();
  });
})();
