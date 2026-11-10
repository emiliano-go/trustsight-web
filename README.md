# TrustSight Web

The single-page site for [trustsight.org](https://trustsight.org). It presents
TrustSight's evidence-first AUR review model; capabilities, calibration,
configuration, and limits. Product documentation lives at
`docs.trustsight.org`.

Site copy must not claim a package is safe. Keep rule counts and calibration
figures aligned with the TrustSight repository.

## Stack

- React + Vite; one page, no router or state library.
- oxc and lightningcss for production builds.
- Self-hosted Inter via `@fontsource-variable/inter`.
- The theme bootstrap script is SHA-256 pinned in `public/_headers`.

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

The plate in `src/plate.js` is generated from default `trustsight review`
output, without `--score`; do not hand-type it.

## Sync with core

`src/rules.js` and `src/figures.generated.json` are derived from the TrustSight
catalog, and `App.jsx` imports the figures rather than hard-typing them. The
pinned core commit lives in `.github/trustsight-commit`.

`.github/workflows/sync-core.yml` regenerates from core `master` every six
hours, runs the full gate, and opens a pull request when anything changed. If a
gate fails it opens a `sync-blocked` issue instead. Run it by hand from the
Actions tab (`sync-core` → Run workflow) to refresh immediately.
