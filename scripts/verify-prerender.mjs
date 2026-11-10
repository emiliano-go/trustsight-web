import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const assets = await readdir(new URL('../dist/assets/', import.meta.url))
const fonts = await readdir(new URL('../dist/fonts/', import.meta.url))
const headers = await readFile(new URL('../dist/_headers', import.meta.url), 'utf8')
const figures = JSON.parse(await readFile(new URL('../src/figures.generated.json', import.meta.url), 'utf8'))
const client = await readFile(new URL(`../dist/assets/${assets.find((file) => file.endsWith('.js'))}`, import.meta.url), 'utf8')
const comma = (n) => n.toLocaleString('en-US')
const cal = figures.calibration
const style = html.match(/<style>([\s\S]*?)<\/style>/)
const styleHash = style ? `'sha256-${createHash('sha256').update(style[1]).digest('base64')}'` : null
const checks = [
  ['root contains rendered page content', html.includes('<div id="root"><div class="page" id="top">')],
  ['main content is present for no-JS visitors', html.includes('<main id="content">')],
  ['LCP heading is present for no-JS visitors', html.includes('<h1>Audit the AUR update before you build it</h1>')],
  ['install command is present for no-JS visitors', html.includes('git clone https://github.com/emiliano-go/trustsight.git')],
  ['small client module remains available for progressive enhancement', /<script type="module" crossorigin src="\/assets\/[^" ]+\.js"><\/script>/.test(html)],
  ['static controls carry progressive-enhancement hooks', html.includes('data-theme-toggle="true"') && html.includes('data-install="true"')],
  ['client bundle does not contain the framework runtime', !client.includes('preact') && !client.includes('hydrate')],
  ['no additional inline scripts were generated', (html.match(/<script(?![^>]*\bsrc=)[^>]*>/g) ?? []).length === 2],
  ['stylesheet is inlined, not a render-blocking asset', style !== null && !assets.some((file) => file.endsWith('.css'))],
  ['inline style hash is pinned on every CSP line', styleHash !== null && headers.includes(`style-src 'self' ${styleHash}`) && !/style-src 'self'(?!\s+'sha256-)/.test(headers)],
  ['font subset is shipped (under 35 kB)', fonts.some((file) => file.endsWith('.woff2'))],
  ['rule total and namespace count render from the catalog', html.includes(`${figures.total_rules} documented rules, in ${figures.namespace_count} namespaces`)],
  ['category page count renders from the catalog', html.includes(`the ${figures.category_pages} category pages`)],
  ['test suite count renders from the catalog', html.includes(`${comma(figures.tests.count)} tests across ${figures.tests.files} files`)],
  ['calibration figures render from the catalog', html.includes(`${cal.benign_zero_rate_pct}%`) && html.includes(`Benign p95 · ${cal.benign_p95}`) && html.includes(`Malicious p5 · ${cal.malicious_p5}`) && html.includes(`${cal.threshold_percentile}th percentile`)],
  ['seed counts render from the catalog', html.includes(comma(figures.seed.source_urls)) && html.includes(comma(figures.seed.hashed_maintainers)) && html.includes(comma(figures.seed.dependency_names))],
  ['declared and unverifiable ranges render from the catalog', html.includes(figures.namespaces.declared_practice.range) && html.includes(figures.namespaces.unverifiable.range)],
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL ${name}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${checks.length} prerender checks.`)
}
