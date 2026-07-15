# Privacy

Not Recommended does not collect or transmit personal information.

## Stored locally

The extension stores these items in `chrome.storage.local`:

- display settings;
- question threads;
- saved YouTube video titles, IDs, URLs, and save times;
- the most recent intention sentence, if entered; and
- the current Wikipedia detour set and draw date.

This data stays in the browser profile where the extension is installed. Not Recommended has no account system, backend, analytics, advertising, tracking, or telemetry.

## Network access

The content script runs on `https://www.youtube.com/*` to replace and simplify YouTube surfaces. The extension's background worker sends fixed, credential-free requests to `https://en.wikipedia.org/w/api.php` to retrieve random main-namespace encyclopedia articles. It does not send saved videos, questions, settings, intentions, YouTube activity, or identifiers to Wikipedia.

The worker does not accept arbitrary URLs from the page or content script. It cannot be used as a general network proxy.

## Removing data

Removing the extension through Chrome removes its local extension storage. Individual question threads and saved videos can also be removed from the intentional home screen.

Last updated: July 15, 2026.
