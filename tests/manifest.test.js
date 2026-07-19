const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const contentStyles = fs.readFileSync(path.join(root, "content.css"), "utf8");
const contentSource = fs.readFileSync(path.join(root, "content.js"), "utf8");
const popupMarkup = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const popupStyles = fs.readFileSync(path.join(root, "popup.css"), "utf8");
const popupSource = fs.readFileSync(path.join(root, "popup.js"), "utf8");

test("GIVEN the extension manifest WHEN inspected SHOULD use Manifest V3", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "Not Recommended");
});

test("GIVEN extension permissions WHEN inspected SHOULD stay narrowly scoped", () => {
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.deepEqual(manifest.host_permissions, [
    "https://www.youtube.com/*",
    "https://m.youtube.com/*",
    "https://en.wikipedia.org/*",
  ]);
});

test("GIVEN mobile YouTube (m.youtube.com) WHEN the extension runs SHOULD cover the ytm-* surface", () => {
  const matches = manifest.content_scripts[0].matches;
  assert.ok(matches.includes("https://m.youtube.com/*"), "content script should match m.youtube.com");
  assert.match(contentSource, /ytm-browse/);
  assert.match(contentSource, /ytm-slim-video-metadata-section-renderer/);
  assert.match(contentSource, /slim-video-information-title/);
  assert.match(contentStyles, /ytm-rich-grid-renderer/);
  assert.match(contentStyles, /section-identifier="related-items"/);
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
  assert.match(contentStyles, /--nr-bone:\s*var\(--yt-spec-base-background/);
  assert.match(contentStyles, /--nr-bone:\s*var\(--yt-spec-base-background,\s*#(?:fff|0f0f0f)\)/);
  assert.match(popupStyles, /prefers-color-scheme:\s*dark/);
  assert.doesNotMatch(`${contentStyles}\n${popupStyles}`, /#c54a36|#b94837/);
});

test("GIVEN user-facing copy WHEN rendered SHOULD stay short and direct", () => {
  assert.match(contentSource, /Skip the feed\./);
  assert.match(contentSource, /No profile\. No ranking\./);
  assert.match(popupMarkup, /Feed controls\./);
  assert.doesNotMatch(`${contentSource}\n${popupMarkup}`, /Opening the atlas|Shape the room|Naming the intention|Keep returning from different directions|Cross disciplines|Related fields/);
});

test("GIVEN a fresh install WHEN settings load SHOULD hide comments by default everywhere", () => {
  assert.match(contentSource, /hideComments:\s*true/);
  assert.match(popupSource, /hideComments:\s*true/);
});

test("GIVEN the core interface WHEN styled SHOULD avoid decorative marks and divider-heavy cards", () => {
  assert.doesNotMatch(`${contentSource}\n${contentStyles}`, /nr-strike-rule|nr-watch-mark/);
  assert.match(contentStyles, /\.nr-home\s*\{[^}]*background:\s*var\(--nr-bone\)/s);
  assert.match(contentStyles, /\.nr-detour-card\s*\{[^}]*background:\s*transparent/s);
});
