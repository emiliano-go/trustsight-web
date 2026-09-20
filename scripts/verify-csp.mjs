// CSP hash drift gate: the same instinct as the project's own calibration
// gates: a claim without a check is a claim this project does not make.
//
// index.html carries one inline <script> (the no-flash theme bootstrap).
// Its sha256 hash is pinned in public/_headers. If either side changes, the
// page breaks silently under the CSP, so this script fails the build.
//
//   node scripts/verify-csp.mjs

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const match = html.match(/<script>([\s\S]*?)<\/script>/)
if (!match) throw new Error('verify-csp: no bare inline <script> found in index.html')

const hash = `sha256-${createHash('sha256').update(match[1]).digest('base64')}`
const headers = readFileSync('public/_headers', 'utf8')

if (!headers.includes(hash)) {
  console.error(`verify-csp: CSP hash drift.\n  index.html script now hashes to ${hash}\n  public/_headers does not pin it. Update the CSP line and commit together.`)
  process.exit(1)
}

// The plate discipline from the design notes: no line may mix light-dark()
// with a plate token, or the plate stops being theme-independent.
const css = readFileSync('src/styles.css', 'utf8')
const offenders = css
  .split('\n')
  .map((line, i) => ({ line, i: i + 1 }))
  .filter(({ line }) => line.includes('light-dark(') && line.includes('--plate-'))
if (offenders.length) {
  console.error(`verify-csp: light-dark() mixed with plate tokens on line(s) ${offenders.map((o) => o.i).join(', ')}. Plates must read only layer-3 literals.`)
  process.exit(1)
}

console.log(`verify-csp: OK (${hash})`)
