const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DETOUR_COUNT,
  buildYouTubeSearchUrl,
  createDateKey,
  isCompleteDraw,
  mergeSavedVideos,
  normalizeWikipediaPage,
} = require("../lib/core.js");

test("GIVEN a local date WHEN creating its key SHOULD use local calendar fields", () => {
  const localDate = new Date(2026, 0, 2, 23, 59, 59);
  assert.equal(createDateKey(localDate), "2026-01-02");
});

test("GIVEN an invalid date WHEN creating its key SHOULD reject it", () => {
  assert.throws(() => createDateKey(new Date("invalid")), /valid Date/);
});

test("GIVEN a valid Wikipedia page WHEN normalizing SHOULD return safe card data", () => {
  const page = {
    pageid: 42,
    title: "A surprisingly specific beetle",
    extract: "A surprisingly specific beetle is a beetle with a useful encyclopedia summary.",
    fullurl: "https://en.wikipedia.org/wiki/A_surprisingly_specific_beetle",
  };

  assert.deepEqual(normalizeWikipediaPage(page), {
    id: "42",
    title: page.title,
    summary: page.extract,
    url: page.fullurl,
  });
});

test("GIVEN a non-Wikipedia URL WHEN normalizing SHOULD reject the page", () => {
  assert.equal(normalizeWikipediaPage({
    pageid: 7,
    title: "Looks harmless",
    extract: "This summary is intentionally long enough to pass the readability floor.",
    fullurl: "javascript:alert(1)",
  }), null);
});

test("GIVEN an empty extract WHEN normalizing SHOULD reject the page", () => {
  assert.equal(normalizeWikipediaPage({
    pageid: 7,
    title: "Empty",
    extract: "",
    fullurl: "https://en.wikipedia.org/wiki/Empty",
  }), null);
});

test("GIVEN three unique valid detours WHEN checking a daily draw SHOULD accept it", () => {
  const detours = Array.from({length: DETOUR_COUNT}, (_, index) => ({
    id: String(index + 1),
    title: `Topic ${index + 1}`,
    summary: `A sufficiently descriptive summary for topic number ${index + 1}.`,
    url: `https://en.wikipedia.org/wiki/Topic_${index + 1}`,
  }));

  assert.equal(isCompleteDraw({schemaVersion: 1, dateKey: "2026-07-15", detours}, "2026-07-15"), true);
});

test("GIVEN duplicate detours WHEN checking a daily draw SHOULD reject it", () => {
  const repeated = {
    id: "1",
    title: "Repeated",
    summary: "A sufficiently descriptive summary for the same repeated article.",
    url: "https://en.wikipedia.org/wiki/Repeated",
  };

  assert.equal(isCompleteDraw({
    schemaVersion: 1,
    dateKey: "2026-07-15",
    detours: [repeated, repeated, repeated],
  }, "2026-07-15"), false);
});

test("GIVEN Unicode text WHEN building a YouTube search SHOULD preserve it as a query", () => {
  const url = new URL(buildYouTubeSearchUrl("Bogotá architecture and memory"));
  assert.equal(url.origin, "https://www.youtube.com");
  assert.equal(url.searchParams.get("search_query"), "Bogotá architecture and memory");
});

test("GIVEN a repeated saved video WHEN merging SHOULD replace rather than duplicate it", () => {
  const current = [{id: "abc", title: "Old", url: "https://www.youtube.com/watch?v=abc"}];
  const updated = {id: "abc", title: "New", url: "https://www.youtube.com/watch?v=abc"};
  assert.deepEqual(mergeSavedVideos(current, updated), [updated]);
});

test("GIVEN more than the save limit WHEN merging SHOULD keep the newest one hundred", () => {
  const current = Array.from({length: 100}, (_, index) => ({
    id: String(index),
    title: `Video ${index}`,
    url: `https://www.youtube.com/watch?v=${index}`,
  }));
  const newest = {id: "new", title: "Newest", url: "https://www.youtube.com/watch?v=new"};
  const merged = mergeSavedVideos(current, newest);
  assert.equal(merged.length, 100);
  assert.equal(merged.at(-1).id, "new");
  assert.equal(merged.some(video => video.id === "0"), false);
});
