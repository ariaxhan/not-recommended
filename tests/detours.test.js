const test = require("node:test");
const assert = require("node:assert/strict");

const {drawUniqueDetours} = require("../lib/core.js");

function page(id) {
  return {
    pageid: id,
    title: `Unexpected topic ${id}`,
    extract: `Unexpected topic ${id} has enough encyclopedia context to make a useful detour card.`,
    fullurl: `https://en.wikipedia.org/wiki/Unexpected_topic_${id}`,
  };
}

test("GIVEN a random source WHEN drawing detours SHOULD request each article serially", async () => {
  let active = 0;
  let peak = 0;
  let next = 0;
  const result = await drawUniqueDetours(async () => {
    active += 1;
    peak = Math.max(peak, active);
    const value = page(++next);
    await Promise.resolve();
    active -= 1;
    return value;
  });
  assert.equal(peak, 1);
  assert.deepEqual(result.map(item => item.id), ["1", "2", "3"]);
});

test("GIVEN duplicate random pages WHEN drawing detours SHOULD retry and keep three unique pages", async () => {
  const ids = [1, 1, 2, 2, 3];
  const result = await drawUniqueDetours(async () => page(ids.shift()));
  assert.deepEqual(result.map(item => item.id), ["1", "2", "3"]);
});

test("GIVEN no usable random pages WHEN drawing detours SHOULD stop at the hard attempt cap", async () => {
  let calls = 0;
  await assert.rejects(
    drawUniqueDetours(async () => {
      calls += 1;
      return page(1);
    }, 4),
    /three usable, unique articles/,
  );
  assert.equal(calls, 4);
});
