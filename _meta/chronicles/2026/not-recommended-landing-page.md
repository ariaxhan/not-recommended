# Not Recommended landing page

Date: 2026-07-16

## Outcome

Shipped a two-route static site at
`https://not-recommended.ariaxhan.workers.dev/` with a dedicated privacy policy
at `/privacy/`. The design uses the real extension UI, a stark editorial layout,
and product copy centered on attention and agency.

## Decisions

- Used Cloudflare Workers Static Assets rather than Pages because Cloudflare now
  recommends Workers for new static sites.
- Kept the site framework-free: HTML, CSS, local fonts, and existing product art.
- Avoided a fake install action before the Chrome Web Store listing exists; the
  release indicator says “Coming soon.”
- Disclosed Cloudflare’s technical request processing without weakening the
  extension’s accurate no-account, no-analytics, local-storage privacy claim.

## Verification

- Existing extension suite: 23 tests passed; lint passed.
- Wrangler dry run found all 16 static files and no bindings.
- Live `/` and `/privacy/` return HTTP 200.
- Live missing paths return the custom HTTP 404 page.
- Security headers are present on live HTML and assets.
- The deployed screenshot hash matches the repository asset.
- Deployment author is the requested `tiredlillies@gmail.com` Cloudflare account.

## Friction

The saved Wrangler OAuth session had expired. An interactive OAuth refresh reused
the existing Cloudflare login. Immediately after deployment, a few nested assets
briefly returned 404 while the new asset version propagated; the same URLs returned
200 on the next verification pass.
