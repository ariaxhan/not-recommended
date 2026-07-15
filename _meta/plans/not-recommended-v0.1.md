# Not Recommended v0.1 plan

## Goal

Turn YouTube into a finite, question-first learning surface with three non-personalized Wikipedia detours per day and an explicit reroll.

## Approaches considered

1. **Single content script (~650 lines, no worker):** smallest file count, but cross-origin behavior is fragile and networking, state, and DOM concerns become tangled.
2. **Framework build (~900 lines plus dependencies):** component structure and test tooling, but unnecessary supply-chain and build complexity for one injected screen.
3. **Small extension modules (~750 lines, zero runtime dependencies):** service worker owns fixed Wikipedia requests, shared pure functions own validation/state, content script owns YouTube UI. Chosen for clear boundaries and direct browser loading.

## Files

- `manifest.json`, `background.js`, `content.js`, `content.css`
- `lib/core.js`
- `popup.html`, `popup.css`, `popup.js`
- `icons/*.png`
- `tests/*.test.js`, `scripts/package.mjs`, `package.json`
- `README.md`, `PRIVACY.md`, `LICENSE`

## Locked behavior

- Daily draw: three unique, independent, serial Wikipedia main-namespace articles.
- Reroll: explicit, replaces all three, single-flight, and persists for the day.
- Failure: last complete draw stays visible; local dashboard never depends on Wikipedia.
- Privacy: local-only settings/content; no accounts, analytics, AI, or arbitrary network proxy.
- Claims: non-personalized and random from Wikipedia, never “the algorithm hid these.”

## Verification

Tests-first pure logic; manifest and syntax checks; package inspection; browser QA at 375/768/1440; hard/soft YouTube navigation; keyboard dialog; offline/error simulation; zero console errors.
