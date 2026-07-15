# Not Recommended

Not Recommended replaces YouTube's infinite home feed with a finite, question-first starting point.

## What it does

- Replaces the YouTube homepage with **Start with a question**.
- Draws exactly three random, non-personalized Wikipedia articles for **Today's detours**.
- Keeps the day's complete draw locally and lets you explicitly reroll all three.
- Keeps the previous complete draw visible if a reroll fails.
- Hides Shorts and the watch-page recommendation sidebar by default.
- Can hide comments and ask for your intention before a video.
- Stores question threads and up to 100 saved videos in Chrome's local extension storage.
- Adds deliberate watch-page exits: go deeper, challenge this, cross disciplines, and end session.

It has no account, backend, analytics, AI, advertising, or remote executable code. Wikipedia supplies random encyclopedia pages; the extension does not personalize, rank, or claim that YouTube hid them.

## Install from the packaged folder

1. Run `npm run verify` and `npm run package`.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select `dist/unpacked`.
6. Open `https://www.youtube.com/`.

The zip at `dist/not-recommended-v0.1.0.zip` contains the same loadable files.

## Development

This is a dependency-free Manifest V3 extension. It uses plain JavaScript, HTML, and CSS.

```sh
npm test
npm run lint
npm run verify
npm run package
```

YouTube changes its internal page structure. If an injected surface disappears after a YouTube update, check the route mounts in `content.js` and the hide selectors in `content.css`.

## Network and storage

The background worker makes fixed requests to the English Wikipedia Action API only when it needs a daily draw or the user rerolls. It requests main-namespace, nonredirect pages and stores the complete set in `chrome.storage.local`. See [PRIVACY.md](PRIVACY.md).
