import { createHash } from 'node:crypto'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const indexPath = new URL('../dist/index.html', import.meta.url)
const serverEntry = new URL('../dist/server/entry-server.js', import.meta.url)
const headersPath = new URL('../dist/_headers', import.meta.url)
const { render } = await import(serverEntry.href)
const html = await readFile(indexPath, 'utf8')
const root = '<div id="root"></div>'

if (!html.includes(root)) {
  throw new Error('prerender: expected an empty #root in dist/index.html')
}

// 1. Inline the single stylesheet so nothing render-blocks first paint, and
//    pin its sha256 in the CSP. The site's CSP is strict (style-src 'self'),
//    so an unpinned inline <style> would be silently blocked by the browser;
//    the hash keeps the CSP strict and the page working.
const cssLink = html.match(/<link rel="stylesheet"[^>]*?href="([^"]+)"/)
let cssText = null
let cssPath = null
if (cssLink) {
  cssPath = new URL(`../dist${cssLink[1]}`, import.meta.url)
  cssText = await readFile(cssPath, 'utf8')
  const styleTag = `<style>${cssText}</style>`
  const hash = `'sha256-${createHash('sha256').update(cssText).digest('base64')}'`
  const headers = await readFile(headersPath, 'utf8')
  const pinned = headers.replace(/style-src 'self'/, `style-src 'self' ${hash}`)
  if (pinned === headers) {
    throw new Error('prerender: could not pin inline CSS hash (style-src \'self\' not found in dist/_headers)')
  }
  await writeFile(headersPath, pinned)
}

// 2. Subset the Inter latin variable font to just the characters the page
//    renders (plus a safety margin in src/font-chars.txt). Keep the variable
//    axes so every weight still works. Requires fonttools (pyftsubset).
const assets = await readdir(new URL('../dist/assets/', import.meta.url))
const latin = assets.find((file) => file.startsWith('inter-latin-wght-normal-') && file.endsWith('.woff2'))
if (latin) {
  const fontPath = new URL(`../dist/assets/${latin}`, import.meta.url)
  const tempPath = new URL(`../dist/assets/.${latin}.subset`, import.meta.url)
  const subset = spawnSync('pyftsubset', [
    fontPath.pathname,
    '--text-file=src/font-chars.txt',
    '--flavor=woff2',
    `--output-file=${tempPath.pathname}`,
  ], { encoding: 'utf8' })
  if (subset.status === 0) {
    await writeFile(fontPath, await readFile(tempPath))
    await rm(tempPath, { force: true })
  } else {
    throw new Error(`prerender: font subset failed (${(subset.stderr ?? '').slice(0, 200)})`)
  }
}

// 3. Inject the server-rendered content into the shell.
const rendered = render()
if (!rendered.includes('<main id="content">')) {
  throw new Error('prerender: server render did not produce landing-page content')
}

let finalHtml = html.replace(root, `<div id="root">${rendered}</div>`)
if (cssLink && cssText !== null) {
  finalHtml = finalHtml.replace(cssLink[0], `<style>${cssText}</style>`)
  // The stylesheet is now inlined; the asset is dead weight on the host.
  await rm(cssPath, { force: true })
}
await writeFile(indexPath, finalHtml)
// The SSR bundle is build-time machinery, not an asset for the static host.
await rm(new URL('../dist/server/', import.meta.url), { recursive: true, force: true })
