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
