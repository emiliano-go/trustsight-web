import { readFile } from 'node:fs/promises'

const read = (rel) => readFile(new URL(rel, import.meta.url), 'utf8')
const files = {
  app: await read('../src/App.jsx'),
  index: await read('../index.html'),
  plate: await read('../src/plate.js'),
}

// Figures are no longer asserted here: App.jsx imports
// src/figures.generated.json, so the published numbers cannot diverge from
// the catalog. `verify:rules` keeps that file current and
// `verify-prerender.mjs` checks the rendered output carries the values.
// This script guards the editorial content that is not derived.
const checks = [
  ['license metadata uses the current default branch', files.index.includes('trustsight/blob/master/LICENSE')],
  ['gate suites are described without stale gate counts', files.app.includes('separate security and calibration gate suites')],
  ['old test count is absent', !files.app.includes('4,233 tests') && !files.app.includes('4,240 tests') && !files.app.includes('3,617 tests') && !files.app.includes('2,473 tests')],
  ['stale rule totals are absent', !files.app.includes('197 documented rules') && !files.app.includes('192 documented rules') && !files.app.includes('184 documented rules') && !files.app.includes('134 rules') && !files.app.includes('25 rules') && !files.app.includes('127 rules')],
  ['stale calibration figures are absent', !files.app.includes('67.9%') && !files.app.includes('90.3th') && !files.app.includes('25-point margin')],
  ['tokenizer isolation is described', files.app.includes('the tokenizer') && files.app.includes('runs in a separate, resource-capped process')],
  ['old gate counts are absent', !files.app.includes('65 security gates') && !files.app.includes('10 calibration gates')],
  ['current quickstart examples are captured', files.plate.includes('some-app-bin') && files.plate.includes('sketchy-package') && files.plate.includes('some-trusted-tool') && files.plate.includes('[H001]')],
  ['old terminal examples are absent', !files.plate.includes('chez-scheme-bin') && !files.plate.includes('sketchy-pkg') && !files.plate.includes('[R004]') && !files.plate.includes('resembles libuv')],
  ['stale seed counts are absent', !files.app.includes('180,000') && !files.app.includes('35,587')],
  ['published figures are imported, not hand-typed', files.app.includes("from './figures.generated.json'") && files.app.includes('const NS = figures.namespaces')],
  ['namespace cards derive their counts from the catalog', files.app.includes('count: NS[key].count_label') && files.app.includes('cats: key === \'declared_practice\'')],
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${checks.length} content checks.`)
}
