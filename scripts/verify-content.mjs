import { readFile } from 'node:fs/promises'

const read = (rel) => readFile(new URL(rel, import.meta.url), 'utf8')
const files = {
  app: await read('../src/App.jsx'),
  index: await read('../index.html'),
  plate: await read('../src/plate.js'),
  figures: JSON.parse(await read('../src/figures.generated.json')),
}

const fig = files.figures
const comma = (n) => n.toLocaleString('en-US')

// Fixed prose checks that are not derived figures.
const checks = [
  ['license metadata uses the current default branch', files.index.includes('trustsight/blob/master/LICENSE')],
  ['gate suites are described without stale gate counts', files.app.includes('separate security and calibration gate suites')],
  ['old test count is absent', !files.app.includes('4,233 tests') && !files.app.includes('3,617 tests') && !files.app.includes('2,473 tests')],
  ['stale rule totals are absent', !files.app.includes('192 documented rules') && !files.app.includes('184 documented rules') && !files.app.includes('127 rules')],
  ['tokenizer isolation is described', files.app.includes('the tokenizer') && files.app.includes('runs in a separate, resource-capped process')],
  ['old gate counts are absent', !files.app.includes('65 security gates') && !files.app.includes('10 calibration gates')],
  ['current quickstart examples are captured', files.plate.includes('some-app-bin') && files.plate.includes('sketchy-package')],
  ['old terminal examples are absent', !files.plate.includes('chez-scheme-bin') && !files.plate.includes('sketchy-pkg')],
  ['stale seed counts are absent', !files.app.includes('180,000') && !files.app.includes('35,587')],
]

// Every figure the site prints is derived in src/figures.generated.json from
// the trustSight catalog (rule counts) and its published-figures.json (seed,
// suite, calibration). `npm run verify:rules` regenerates and checks that
// file against the catalog, so a site copy that lags the tool fails here.
checks.push(
  ['documented rule total matches the catalog', files.app.includes(`${fig.total_rules} documented rules, in seven namespaces`)],
  ['category pages match the catalog', files.app.includes(`the ${fig.category_pages} category pages`)],
)

for (const [name, ns] of Object.entries(fig.namespaces)) {
  checks.push([`${name} namespace count matches the catalog`, files.app.includes(`count: '${ns.count_label}'`)])
  for (const [title, slug, count] of ns.categories) {
    checks.push([`${name} category ${slug} count matches the catalog`, files.app.includes(`['${title}', '${slug}', ${count}]`)])
  }
}

const cal = fig.calibration
checks.push(
  ['calibration figures match the measured corpus',
    files.app.includes(`${cal.benign_zero_rate_pct}%`) &&
    files.app.includes(`95th percentile of <strong>${cal.benign_p95}</strong>`) &&
    files.app.includes(`5th percentile of <strong>${cal.malicious_p5}</strong>`) &&
    files.app.includes(`${cal.threshold_percentile}th percentile`)],
  ['published seed counts are exact',
    files.app.includes(comma(fig.seed.source_urls)) &&
    files.app.includes(comma(fig.seed.hashed_maintainers)) &&
    files.app.includes(comma(fig.seed.dependency_names))],
  ['current test count is documented', files.app.includes(`${comma(fig.tests.count)} tests across ${fig.tests.files} files`)],
)

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${checks.length} content checks.`)
}
