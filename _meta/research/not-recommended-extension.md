---
topic: Not Recommended Chrome extension
status: canonical
query: Manifest V3 YouTube SPA random Wikipedia extension failure modes
last_updated: 2026-07-15
ttl: 30
channels_run: [A, D]
entries: 13
---

# Not Recommended extension failure modes

## TL;DR

Use an idempotent YouTube route controller, a narrow Manifest V3 service worker for Wikipedia requests, and atomic local storage records. Draw three articles independently and serially; preserve the last complete draw when networking fails.

## Failure-mode table

| # | Symptom | Root cause | Fix | Source URL |
|---|---|---|---|---|
| 1 | Dashboard works after refresh but disappears after navigation | YouTube changes routes without reloading the document | Listen for YouTube navigation events, keep a URL fallback, and make reconciliation idempotent | https://github.com/Zren/ResizeYoutubePlayerToWindowSize/issues/72 |
| 2 | Injected UI duplicates or vanishes | YouTube replaces owned DOM subtrees while a broad observer reruns work | Use one stable host per route, debounce fallback observation, and clean stale hosts before mounting | https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab |
| 3 | Wikipedia requests fail from the content script | Cross-origin content-script requests remain subject to page-origin rules | Fetch from a service worker with a narrow host permission and fixed message contract | https://developer.chrome.com/docs/extensions/develop/concepts/network-requests |
| 4 | Remote article text alters the dashboard DOM | Fetched text is untrusted and was inserted as HTML | Validate response shapes and assign all remote strings with `textContent` | https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts |
| 5 | Detours contain talk pages or internal wiki pages | Random defaults are not restricted to encyclopedia articles | Set namespace 0, reject redirects, and require a modest minimum page size | https://www.mediawiki.org/wiki/API%3ARandom/en |
| 6 | Three supposedly random cards repeatedly appear together | Multi-page random results follow a fixed stored sequence from one random start | Make three separate serial draws and deduplicate by page ID | https://www.mediawiki.org/wiki/API%3ARandom/en |
| 7 | Special-character titles intermittently fail | The REST random redirect has an open URL-encoding bug | Use the Action API and consume its canonical URL | https://phabricator.wikimedia.org/T364153 |
| 8 | A Wikimedia deployment breaks all detours | The REST random endpoint is documented as unstable | Isolate the stable Action API behind one adapter and retain cached data on failure | https://phabricator.wikimedia.org/T393897 |
| 9 | Fast rerolls race, throttle, or overwrite a newer draw | Overlapping requests and unsynchronized storage writes | Disable reroll during a draw, serialize requests, use request IDs, and bound retries | https://www.mediawiki.org/wiki/API%3AEtiquette/en |
| 10 | Offline startup blanks the whole intentional homepage | Remote inspiration was treated as a rendering prerequisite | Render local features first; show cached detours or a compact retry state | https://developer.chrome.com/docs/extensions/reference/api/storage |
| 11 | Detours reset when the background worker sleeps | Manifest V3 workers are temporary and in-memory state is disposable | Treat `chrome.storage.local` as the source of truth | https://github.com/w3c/webextensions/issues/284 |
| 12 | The intention overlay is unusable by keyboard or screen reader | A styled div does not implement modal behavior | Use native `dialog`, initial focus, Escape, labels, and focus restoration | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ |
| 13 | Settings or saves vanish without an error | Storage is asynchronous, quota-bound, and read-modify-write can race | Use Promise storage calls, bounded payloads, atomic records, and visible errors | https://developer.chrome.com/docs/extensions/reference/api/storage |

## Pre-flight checklist

- [ ] Three random articles are fetched independently and serially.
- [ ] The worker accepts named actions, never arbitrary URLs.
- [ ] Wikipedia fields and URLs are shape-checked before storage or rendering.
- [ ] Home and watch mounts remain singular across hard and soft navigation.
- [ ] A failed reroll never destroys a complete cached draw.
- [ ] The intent dialog works with Tab, Shift+Tab, Escape, and focus return.
- [ ] Offline, malformed, partial, duplicate, and rapid-reroll cases are tested.

## Notes

The subject matter remains unfiltered beyond a readability floor. That preserves non-personalized randomness without falsely promising mathematical randomness or editorial selection.
