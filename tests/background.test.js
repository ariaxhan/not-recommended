const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const Core = require("../lib/core.js");

function validPage(id) {
  return {
    pageid: id,
    title: `Random article ${id}`,
    extract: `Random article ${id} includes enough plain encyclopedia context for a complete detour card.`,
    fullurl: `https://en.wikipedia.org/wiki/Random_article_${id}`,
  };
}

function createWorker({stored, fetch}) {
  let listener;
  const state = {detourDraw: stored};
  const context = {
    AbortController,
    Error,
    NotRecommendedCore: Core,
    URL,
    chrome: {
      runtime: {onMessage: {addListener(value) { listener = value; }}},
      storage: {local: {
        async get(key) { return {[key]: state[key]}; },
        async set(value) { Object.assign(state, value); },
      }},
    },
    fetch,
    importScripts() {},
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(fs.readFileSync("background.js", "utf8"), context, {filename: "background.js"});
  return {
    state,
    send(message) {
      return new Promise(resolve => {
        assert.equal(listener(message, {}, resolve), true);
      });
    },
  };
}

test("GIVEN a failed reroll WHEN a complete draw exists SHOULD retain and return that draw", async () => {
  const dateKey = Core.createDateKey();
  const previous = {
    schemaVersion: 1,
    dateKey,
    detours: [1, 2, 3].map(id => Core.normalizeWikipediaPage(validPage(id))),
  };
  const worker = createWorker({stored: previous, fetch: async () => { throw new Error("offline"); }});
  const response = await worker.send({type: "REROLL_DETOURS"});
  assert.equal(response.ok, false);
  assert.deepEqual(response.record.detours, previous.detours);
  assert.deepEqual(worker.state.detourDraw.detours, previous.detours);
});

test("GIVEN two rapid rerolls WHEN drawing SHOULD share one three-request flight", async () => {
  let calls = 0;
  const worker = createWorker({
    fetch: async () => {
      const page = validPage(++calls);
      await new Promise(resolve => setImmediate(resolve));
      return {ok: true, async json() { return {query: {pages: [page]}}; }};
    },
  });
  const [first, second] = await Promise.all([
    worker.send({type: "REROLL_DETOURS"}),
    worker.send({type: "REROLL_DETOURS"}),
  ]);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(calls, 3);
  assert.deepEqual(first.record.detours, second.record.detours);
});
