const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const contentStyles = fs.readFileSync(path.join(root, "content.css"), "utf8");

test("GIVEN the extension manifest WHEN inspected SHOULD use Manifest V3", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "Not Recommended");
});

test("GIVEN extension permissions WHEN inspected SHOULD stay narrowly scoped", () => {
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.deepEqual(manifest.host_permissions, [
    "https://www.youtube.com/*",
    "https://en.wikipedia.org/*",
  ]);
});

test("GIVEN all manifest file references WHEN inspected SHOULD exist", () => {
  const referenced = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    ...manifest.content_scripts.flatMap(script => [...script.js, ...script.css]),
    ...Object.values(manifest.icons),
  ];

  for (const file of referenced) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} should exist`);
  }
});

test("GIVEN the intentional home WHEN hiding sidebars SHOULD remove the guide and reclaim its width", () => {
  assert.match(contentStyles, /:has\(#not-recommended-home\)[^}]*#guide/);
  assert.match(contentStyles, /:has\(#not-recommended-home\)[^}]*#page-manager[^}]*margin-left:\s*0\s*!important/);
});

test("GIVEN YouTube dark mode WHEN rendering the intentional home SHOULD use the dark editorial palette", () => {
  assert.match(contentStyles, /html\[dark\]\s*\{[^}]*--nr-bone:[^}]*--nr-ink:/s);
  assert.match(contentStyles, /html\[dark\] \.nr-home\s*\{[^}]*color-scheme:\s*dark/s);
});
