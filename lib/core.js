(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NotRecommendedCore = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const DETOUR_COUNT = 3;
  const SAVE_LIMIT = 100;
  const DRAW_SCHEMA_VERSION = 1;

  function createDateKey(date = new Date()) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError("createDateKey requires a valid Date");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isAllowedWikipediaUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "en.wikipedia.org" && url.pathname.startsWith("/wiki/");
    } catch {
      return false;
    }
  }

  function normalizeWikipediaPage(page) {
    if (!page || typeof page !== "object") return null;
    const id = String(page.pageid ?? "").trim();
    const title = typeof page.title === "string" ? page.title.trim() : "";
    const summary = typeof page.extract === "string" ? page.extract.trim() : "";
    const url = typeof page.fullurl === "string" ? page.fullurl : "";
    if (!/^\d+$/.test(id) || !title || summary.length < 40 || !isAllowedWikipediaUrl(url)) return null;
    return {id, title, summary, url};
  }

  function isCompleteDraw(record, expectedDateKey) {
    if (!record || record.schemaVersion !== DRAW_SCHEMA_VERSION || record.dateKey !== expectedDateKey) return false;
    if (!Array.isArray(record.detours) || record.detours.length !== DETOUR_COUNT) return false;
    const normalized = record.detours.map(item => normalizeWikipediaPage({
      pageid: item?.id,
      title: item?.title,
      extract: item?.summary,
      fullurl: item?.url,
    }));
    return normalized.every(Boolean) && new Set(normalized.map(item => item.id)).size === DETOUR_COUNT;
  }

  function buildYouTubeSearchUrl(query) {
    const url = new URL("https://www.youtube.com/results");
    url.searchParams.set("search_query", String(query ?? "").trim());
    return url.toString();
  }

  function normalizeYouTubeVideo(video) {
    if (!video || typeof video !== "object") return null;
    const id = typeof video.id === "string" ? video.id.trim() : "";
    const title = typeof video.title === "string" ? video.title.trim() : "";
    try {
      const url = new URL(video.url);
      if (!id || !title || url.protocol !== "https:" || url.hostname !== "www.youtube.com" || url.pathname !== "/watch") return null;
      if (url.searchParams.get("v") !== id) return null;
      return {...video, id, title, url: url.toString()};
    } catch {
      return null;
    }
  }

  function mergeSavedVideos(current, next) {
    const validNext = normalizeYouTubeVideo(next);
    if (!validNext) return Array.isArray(current) ? current.slice(-SAVE_LIMIT) : [];
    const safeCurrent = Array.isArray(current) ? current.filter(item => normalizeYouTubeVideo(item)) : [];
    return [...safeCurrent.filter(item => item.id !== validNext.id), validNext].slice(-SAVE_LIMIT);
  }

  async function drawUniqueDetours(fetchOne, maxAttempts = 12) {
    if (typeof fetchOne !== "function") throw new TypeError("fetchOne must be a function");
    const detours = [];
    for (let attempts = 0; attempts < maxAttempts && detours.length < DETOUR_COUNT; attempts += 1) {
      const candidate = normalizeWikipediaPage(await fetchOne());
      if (candidate && !detours.some(item => item.id === candidate.id)) detours.push(candidate);
    }
    if (detours.length !== DETOUR_COUNT) throw new Error("Wikipedia did not return three usable, unique articles");
    return detours;
  }

  return {
    DETOUR_COUNT,
    DRAW_SCHEMA_VERSION,
    buildYouTubeSearchUrl,
    createDateKey,
    drawUniqueDetours,
    isAllowedWikipediaUrl,
    isCompleteDraw,
    mergeSavedVideos,
    normalizeWikipediaPage,
    normalizeYouTubeVideo,
  };
});
