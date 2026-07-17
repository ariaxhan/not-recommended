---
query: Cloudflare Workers Static Assets deployment, privacy, and failure modes
date: 2026-07-16
ttl: 30
---

# Cloudflare static landing failure map

## Decision

Use Cloudflare Workers Static Assets with an explicit `wrangler.jsonc`. Cloudflare
recommends Workers Static Assets for new static sites; Pages remains supported but
new work is focused on Workers.

## Failure modes

| Symptom | Root cause | Fix | Source |
| --- | --- | --- | --- |
| Deploy stops with “missing entry-point or assets directory.” | Wrangler cannot infer which directory contains the static site. | Commit an explicit `assets.directory` in `wrangler.jsonc`. | https://github.com/cloudflare/workers-sdk/issues/10563 |
| Deploy fails as logged out in an automated or non-interactive shell. | The saved OAuth token expired and Wrangler cannot open the login flow. | Run `wrangler login` interactively, then confirm the intended account with `wrangler whoami`. | https://github.com/cloudflare/workers-sdk/issues/2978 |
| Static files briefly 404 or deployments behave inconsistently. | Legacy Workers Sites used KV-backed asset publishing. | Use current Workers Static Assets, not deprecated Workers Sites. | https://github.com/cloudflare/workers-sdk/issues/1162 |
| `/privacy` returns 404 while `/privacy/` works. | Static asset URL handling maps nested `index.html` files to trailing-slash routes. | Link to `/privacy/` and verify both the canonical route and its HTML asset after deploy. | https://developers.cloudflare.com/workers/static-assets/ |
| Security headers are absent. | Static assets only receive custom headers declared in the asset directory’s `_headers` file. | Ship `_headers` beside the site assets and verify response headers live. | https://developers.cloudflare.com/workers/static-assets/headers/ |
| Site policy says “no collection,” but the hosting layer still processes request data. | Cloudflare processes end-user traffic such as IP addresses and routing data to deliver and secure customer sites. | State that the site itself sets no analytics/cookies while Cloudflare processes technical request data under its own policy. | https://www.cloudflare.com/privacypolicy/ |

## Production precedent

Cloudflare’s production architecture converges Pages and Workers around a unified
static-asset platform. The current guidance is to use Workers Static Assets for new
projects, with static requests served without a Worker script.

- https://blog.cloudflare.com/pages-and-workers-are-converging-into-one-experience/
- https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/
- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/

