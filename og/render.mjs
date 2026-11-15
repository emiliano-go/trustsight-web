#!/usr/bin/env node
/* Render every numbered HTML study to out/<name>.png (1200x630) and
   out/<name>@2x.png (2400x1260). Requires Chromium and ImageMagick 7. */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'out')
const chrome = process.env.CHROME_BIN || 'chromium'
const magick = process.env.MAGICK_BIN || 'magick'

mkdirSync(outDir, { recursive: true })

const pages = readdirSync(here)
  .filter((file) => /^\d.*\.html$/.test(file))
  .sort()

if (pages.length === 0) throw new Error('render: no numbered HTML studies found')

for (const page of pages) {
  const name = page.replace(/\.html$/, '')
  const source = `file://${join(here, page)}`
  const retina = join(outDir, `${name}@2x.png`)
  const standard = join(outDir, `${name}.png`)

  execFileSync(chrome, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1200,630',
    `--screenshot=${retina}`,
    source,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })

  // Downscale the 2x capture rather than rendering at 1x: small mono text
  // stays crisp without the browser's thin 1x hinting.
  execFileSync(magick, [
    retina,
    '-resize', '50%',
    '-strip',
    '-define', 'png:compression-level=9',
    standard,
  ])

  const kb = (bytes) => `${Math.round(bytes / 1024)} KB`
  console.log(
    `${name.padEnd(14)} ${kb(statSync(standard).size).padStart(7)}  ` +
    `${kb(statSync(retina).size).padStart(7)}  (@2x)`,
  )
}
