"use strict";

importScripts("lib/core.js");

const {DRAW_SCHEMA_VERSION, createDateKey, drawUniqueDetours, isCompleteDraw} = NotRecommendedCore;
const CACHE_KEY = "detourDraw";
const API_URL = "https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=1&grnfilterredir=nonredirects&prop=extracts%7Cinfo&exintro=1&explaintext=1&exchars=420&inprop=url&format=json&formatversion=2&origin=*";
const REQUEST_TIMEOUT_MS = 8000;
let activeDraw = null;

function storageGet(key) {
  return chrome.storage.local.get(key);
}

function storageSet(value) {
  return chrome.storage.local.set(value);
}

async function fetchRandomPage() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`);
    const data = await response.json();
    const pages = data?.query?.pages;
    if (!Array.isArray(pages) || pages.length !== 1) throw new Error("Wikipedia returned an unexpected response");
    return pages[0];
  } finally {
    clearTimeout(timeout);
  }
}

async function performDraw(dateKey) {
  const detours = await drawUniqueDetours(fetchRandomPage);
  const record = {schemaVersion: DRAW_SCHEMA_VERSION, dateKey, detours, drawnAt: Date.now()};
  await storageSet({[CACHE_KEY]: record});
  return record;
}

async function getDetours({reroll = false} = {}) {
  const dateKey = createDateKey();
  const stored = (await storageGet(CACHE_KEY))[CACHE_KEY];
  if (!reroll && isCompleteDraw(stored, dateKey)) return {ok: true, record: stored, cached: true};

  if (!activeDraw) {
    activeDraw = performDraw(dateKey).finally(() => {
      activeDraw = null;
    });
  }

  try {
    const record = await activeDraw;
    return {ok: true, record, cached: false};
  } catch (error) {
    const fallback = (await storageGet(CACHE_KEY))[CACHE_KEY];
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Wikipedia is unavailable",
      record: fallback && Array.isArray(fallback.detours) && fallback.detours.length === 3 ? fallback : null,
    };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || (message.type !== "GET_DETOURS" && message.type !== "REROLL_DETOURS")) return false;
  getDetours({reroll: message.type === "REROLL_DETOURS"}).then(sendResponse);
  return true;
});
