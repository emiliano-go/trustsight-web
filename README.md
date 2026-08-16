# TrustSight web

The front door for [trustsight.org](https://trustsight.org) — a standalone,
single-page showcase of TrustSight, separate from the docs at
`docs.trustsight.org`.

The page documents what the tool does in the same voice as the docs: what it
detects (the README's table, with the rules that do the work), the four
evidence tiers, the measured calibration figures, how the claims are tested
and configured, what it cannot see, and the six rule namespaces with their
categories. Copy rules: never claim safety, every number sourced from the
current docs (calibration figures from `explanation/benchmarks-and-methodology.md`,
rule counts from the generated rules index), and limits stated in the same
voice as capabilities.

## Stack

- **React + Vite** — single page, one route. No router, no state library.
- **oxc** JS minifier + **lightningcss** CSS transformer (the dbwarden site's
  performance baseline).
- **Inter** via `@fontsource-variable/inter`, self-hosted — no font CDN.
  Fonts are served from `/assets` and allowed by `font-src 'self'`.
- The one inline script (theme bootstrap in `index.html`) is pinned by sha256
  in `public/_headers`; `npm run verify:csp` fails the build on drift.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # emits dist/
npm run verify:csp
```

The plate content (`src/plate.js`) is real `trustsight review` output (default
flags — no `--score`), matching the rendering logic in the TrustSight repo's
`src/trustsight/cli/review.py`. It is never hand-typed.
