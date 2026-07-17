# Plugin landing page

## Contract

- **Goal:** ship a simple, provocative landing page for Not Recommended.
- **Constraints:** match the extension’s finite/question-first philosophy; no
  analytics, forms, cookies, app framework, or unnecessary runtime code; preserve
  existing extension behavior and user changes.
- **Inputs:** current README, extension UI, screenshots, and privacy disclosure.
- **Outputs:** responsive landing page, `/privacy/`, Cloudflare config, live deploy.
- **Done when:** both routes return 200 over HTTPS, security headers are present,
  links work, layout holds at mobile and desktop widths, and the deployed account
  is confirmed as `tiredlillies@gmail.com`.

## Options considered

1. **Workers Static Assets:** plain HTML/CSS, no runtime dependencies, about 500
   lines. Smallest surface and Cloudflare’s recommendation for new static sites.
2. **Pages Direct Upload:** similarly small, but Cloudflare now directs new sites
   toward Workers while Pages mainly remains for existing projects.
3. **Vite app:** richer build pipeline, but adds dependencies and client JavaScript
   without improving this two-page site.

Choose option 1. Use the real product screenshot as proof, with a stark editorial
layout: warm paper, black type, one YouTube-red signal, almost no rounded UI.

## Verification

- Local HTML/link/accessibility checks and existing `npm run verify`.
- Wrangler dry run before deploy.
- Live `curl` checks for `/`, `/privacy/`, missing routes, headers, and assets.
- Browser render at desktop and mobile widths after deploy.
