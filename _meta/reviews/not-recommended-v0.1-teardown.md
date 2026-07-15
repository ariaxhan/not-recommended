# Tear Down: Not Recommended v0.1

reviewed: 2026-07-15
tier: 3
scope: 19 files plus generated icons

## Big 5

input_validation: pass
edge_cases: pass
error_handling: pass
duplication: pass
complexity: pass

## Security

- Fixed `GET_DETOURS` and `REROLL_DETOURS` messages; no arbitrary URL proxy.
- Narrow Wikipedia and YouTube hosts only.
- Remote strings rendered with DOM `textContent`; outbound URLs allowlisted.
- No accounts, tokens, cookies, backend, remote code, or analytics.

## Testing

- Behavior tests exist before implementation and currently fail for missing source files.
- Covered: invalid dates, malformed pages, unsafe URLs, missing extracts, duplicates, Unicode search, save deduplication, save limit, manifest scope, and referenced files.
- Browser verification must additionally exercise worker restart, rapid reroll, offline startup, soft navigation, and dialog focus.

## Architecture

- `background.js`: fixed Wikipedia networking and atomic daily records.
- `lib/core.js`: dependency-free validation and state helpers.
- `content.js`: route reconciliation and DOM behavior only.
- `popup.js`: settings only.

## Verdict: PROCEED

The worker boundary resolves the cross-origin and privilege issues without introducing a framework. The plan has a stable test seam and a finite error path.

## Action Items

1. Bound each network request with a timeout and all draw attempts with a hard cap.
2. Keep the previous complete draw visible if reroll fails.
3. Use request IDs or a single-flight promise to prevent stale reroll writes.
4. Keep functions small and route rendering idempotent.
5. Verify the native dialog and YouTube soft-navigation path in Chrome.
