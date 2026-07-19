# Safari port

Xcode project wrapping the unchanged MV3 extension for Safari (macOS + iOS),
generated with `xcrun safari-web-extension-converter`.

## How it works

The Xcode targets reference the extension files in `../dist/unpacked/` (not a
copy), so the extension source at the repo root stays the single source of
truth. `dist/` is gitignored — regenerate it before building:

```sh
npm run package
open "safari/Not Recommended/Not Recommended.xcodeproj"
```

After any extension change, just re-run `npm run package`; no converter re-run
needed unless `manifest.json` gains new files.

## Running locally (macOS)

1. Build & run the "Not Recommended (macOS)" scheme in Xcode.
2. Safari → Settings → Developer → check "Allow unsigned extensions"
   (re-check after every Safari restart; requires the Develop menu enabled).
3. Safari → Settings → Extensions → enable Not Recommended, grant access to
   youtube.com and en.wikipedia.org (Safari asks per-site on first use).

## Regenerating the project from scratch

```sh
npm run package
xcrun safari-web-extension-converter dist/unpacked \
  --project-location safari --app-name "Not Recommended" \
  --bundle-identifier com.notrecommended.app --no-open --no-prompt --force
```

## Distribution

App Store only (both macOS and iOS) — requires an Apple Developer account
($99/yr). Archive each platform's App scheme in Xcode → Distribute.
