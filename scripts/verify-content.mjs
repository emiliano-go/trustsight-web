import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  plate: await readFile(new URL('../src/plate.js', import.meta.url), 'utf8'),
}

const checks = [
  ['license metadata uses the current default branch', files.index.includes('trustsight/blob/master/LICENSE')],
  ['current test count is documented', files.app.includes('4,233 tests across 85 files')],
  ['gate suites are described without stale gate counts', files.app.includes('separate security and calibration gate suites')],
  ['old test count is absent', !files.app.includes('4,010 tests') && !files.app.includes('3,617 tests') && !files.app.includes('2,473 tests')],
  ['documented rule total matches the catalog', files.app.includes('197 documented rules, in seven namespaces')],
  ['stale rule totals are absent', !files.app.includes('192 documented rules') && !files.app.includes('184 documented rules') && !files.app.includes('127 rules')],
  ['R and H namespace count matches the catalog', files.app.includes("count: '134 rules'") && files.app.includes("['Fetch and Execution', 'fetch-and-execution', 36]")],
  ['C namespace count matches the catalog', files.app.includes("count: '13 rules'") && files.app.includes("['Integrity and Verification', 'integrity', 10]") && files.app.includes("['Deception and Anti-Analysis', 'deception', 1]")],
  ['crossfire namespace count matches the catalog', files.app.includes("count: '25 rules'") && files.app.includes("['Crossfire', 'crossfire', 25]")],
  ['calibration figures match the measured corpus', files.app.includes('70.3%') && files.app.includes('95th percentile of <strong>30</strong>') && files.app.includes('5th percentile of <strong>60</strong>') && files.app.includes('92.1th percentile')],
  ['published seed counts are exact', files.app.includes('185,902') && files.app.includes('36,912') && files.app.includes('215,504')],
  ['stale seed counts are absent', !files.app.includes('180,000') && !files.app.includes('35,587')],
  ['tokenizer isolation is described', files.app.includes('the tokenizer') && files.app.includes('runs in a separate, resource-capped process')],
  ['old gate counts are absent', !files.app.includes('65 security gates') && !files.app.includes('10 calibration gates')],
  ['current quickstart examples are captured', files.plate.includes('some-app-bin') && files.plate.includes('sketchy-package')],
  ['old terminal examples are absent', !files.plate.includes('chez-scheme-bin') && !files.plate.includes('sketchy-pkg')],
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${checks.length} content checks.`)
}
