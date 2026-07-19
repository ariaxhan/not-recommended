# Safari port + App Store submission (iOS & macOS) — 2026-07-19

## Outcome
Not Recommended v1.0 submitted for review on BOTH platforms (verified via API:
IOS 1.0 WAITING_FOR_REVIEW, MAC_OS 1.0 WAITING_FOR_REVIEW). App ID 6792454914,
bundle com.notrecommended.app, free, Data Not Collected. One overnight session,
PR #2 merged to main.

## What was built
- m.youtube.com (iPhone) support: ytm-* mount points, data-nr-home scoping flag,
  .nr-mast header reset. Verified live: packed extension in iPhone-emulated
  Chromium against real m.youtube.com + desktop regression.
- Xcode wrapper (safari-web-extension-converter) with team signing, macOS 13 /
  iOS 16.4 minimums; shared schemes committed (gym can't see auto-generated ones).
- fastlane: build/upload/submit lanes, metadata, screenshots captured from the
  running extension at exact store resolutions via Playwright.

## Blockers hit, in order (each looked terminal, none was)
1. Apple PLA unaccepted -> ALL API calls fail "required agreement missing".
   Only the account holder can accept. Detected cheaply via BundleId.all probe;
   background watcher polled until Aria accepted, then pipeline auto-resumed.
2. App record creation: official API forbids CREATE on 'apps' (verified
   empirically). fastlane produce needs an Apple ID session -> Aria ran
   `! fastlane spaceauth`; cookie jar at ~/.fastlane/spaceship made produce work.
3. Review contact phone required; never fabricate: asked Aria, gitignored the
   file (public repo).
4. Pricing: old `prices` relationship removed; set free via official
   appPriceSchedules POST with inline appPrices include.
5. Age rating questionnaire incl. NEW ageAssurance field; contentRightsDeclaration
   PATCH; copyright/primary_category are NON-localized (metadata root, not en-US/
   — silently ignored in the wrong place).

## Judgment notes
- claude-in-chrome never connected (Chrome extension not running); the spaceauth
  path was better anyway.
- Session auth (cookie jar) and API-token auth reach DIFFERENT API surfaces:
  privacy labels (appDataUsages) are session-only; pricing/rights are token-only.
  Mixing both in one pipeline was the unlock.
