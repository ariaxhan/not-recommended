# Product Hunt launch kit — Not Recommended

Status: **prepped, gated on Apple approval** (iOS + macOS both WAITING_FOR_REVIEW as of 2026-07-19).
Trigger to launch: Safari approved on at least macOS. If review drags past ~1 week, launch Chrome-only
and add Safari as a launch-page update comment when it lands.

## Launch fields (paste-ready)

| Field | Value |
|---|---|
| Name | Not Recommended |
| Tagline | YouTube without the slot machine |
| Website | https://not-recommended.ariaxhan.workers.dev/ |
| Chrome link | https://chromewebstore.google.com/detail/hpgdmjphjmohhblolojdcpmcbeangnfh |
| App Store link | add on approval (App ID 6792454914) |
| Topics | `chrome-extensions` · `productivity` · `privacy` |
| Pricing | Free |
| Thumbnail | `store-assets/producthunt/thumbnail-512.png` |
| Gallery 1 | `store-assets/producthunt/gallery-dark-1270x760.png` ("Skip the feed." hero) |
| Gallery 2 | `store-assets/producthunt/gallery-light-1270x760.png` |
| Schedule | 12:01 AM PT, first Tue/Wed/Thu after Apple approval |

Tagline alternates (if the primary feels off in the UI, 60-char cap):
- "YouTube without the feed" (matches App Store subtitle)
- "Delete the feed. Start with a question."

## Short description (PH cap 260 chars; this is 247)

> Replaces YouTube's infinite feed with one question: what did you actually come here
> for? Plus three random Wikipedia articles a day — not personalized, that's the point.
> No accounts, no analytics, no AI. Chrome + Safari (iPhone, iPad, Mac).

## Maker's first comment (post immediately after launch goes live)

> Hey PH — I built Not Recommended out of spite for the attention economy.
>
> YouTube's feed is a slot machine: it knows what you'll click and has no idea what you
> want. So this extension deletes the homepage and replaces it with a question box —
> what did you actually come here for?
>
> A few deliberate choices:
>
> — Every day you get three random Wikipedia articles. Random, not personalized.
> That's the whole point: a daily reminder that most of what's interesting will never
> be recommended to you.
> — Shorts hidden, sidebar recommendations gone, comments off by default (each toggleable).
> — Before a video plays, it asks "why this one?" — watching stays a choice, not a reflex.
> — No account, no backend, no analytics, no AI. Everything lives in local browser
> storage. Wikipedia is the only network call.
>
> It's free, MIT-licensed, dependency-free Manifest V3. Chrome today, and Safari on
> iPhone/iPad/Mac just landed in the App Store.
>
> Would love to hear what your homepage looks like without the feed.

## Launch-day checklist

1. Confirm Apple approval; paste the real App Store URL into the launch draft + landing page.
2. Verify draft renders: thumbnail, gallery order (dark hero first), all links resolve.
3. Confirm scheduled for 12:01 AM PT; verify maker account is ariaxhan.
4. After it flips live: post the maker comment, reply to every comment same-day.
5. Add the Product Hunt badge/link to the landing page hero.
6. If Safari still pending at launch: strike App Store row, plan an update comment.

## Assets provenance

Gallery crops generated from `store-assets/screenshots/*-1280x800.png`
(sips resample 1270 → center-crop 760). Thumbnail rendered at 512x512 from `icons/icon.svg`.
Regenerate command lives in git history of this file's commit.
