# Social-image studies

Three type-only replacements for `public/og-image.png`, authored as fixed-size
HTML and rendered to PNG. Feed previews are small, so nothing here is smaller
than 34 px at 1x: each file is the wordmark plus one line, or a headline plus
the wordmark. No gradients, rules, cards, or footers.

## The three

| File | Composition | Reads best as |
| --- | --- | --- |
| `01-lockup` | Centred wordmark at 88 px and one tagline at 46 px, dark. | The default brand card. |
| `02-headline` | The masthead headline at 84 px, wordmark at 34 px, dark. | The product message, with the most thumbnail impact. |
| `03-light` | The `01` lockup on the light theme. | Light-mode clients. |

## Specs

- `1200 × 630` (1.91:1) PNG, sRGB, no transparency; `@2x` at `2400 × 1260`.
- Palette is the site's: `#0B0F14` / `#1793D1` on dark, `#FAFAF7` / `#1073A8`
  on light.
- Inter 400 for the tagline, 600 for the wordmark and headline. The wordmark is
  text only, as on the site.
- Copy: `An immune system for the AUR.` and the current masthead headline.
  Nothing claims a package is safe.

## Render

```bash
cd trustsight-web/og
node render.mjs
```

Requires headless Chromium (`CHROME_BIN` overrides `chromium`) and
ImageMagick 7 (`magick`, or `MAGICK_BIN`). Output lands in `out/`.

`assets/fonts/Inter-400.ttf` and `Inter-600.ttf` are static instances of the
site's Inter Variable, so the render does not depend on local font matching.

## Chosen

`public/og-image.png` is `out/02-headline.png` (1200 × 630). The SEO head in
`index.html` declares the same dimensions.

## Install one

```bash
cp og/out/02-headline.png public/og-image.png
```

Then update the declared size in `scripts/generate_seo.py`
(`OG_IMAGE_WIDTH` / `OG_IMAGE_HEIGHT`) to `1200` / `630`, regenerate the head
with `npm run generate:seo`, and check `npm run verify:seo`.
