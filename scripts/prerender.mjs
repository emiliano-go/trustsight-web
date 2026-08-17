import { readFile, rm, writeFile } from 'node:fs/promises'

const indexPath = new URL('../dist/index.html', import.meta.url)
const serverEntry = new URL('../dist/server/entry-server.js', import.meta.url)
const { render } = await import(serverEntry.href)
const html = await readFile(indexPath, 'utf8')
const root = '<div id="root"></div>'

if (!html.includes(root)) {
  throw new Error('prerender: expected an empty #root in dist/index.html')
}

const rendered = render()
if (!rendered.includes('<main id="content">')) {
  throw new Error('prerender: server render did not produce landing-page content')
}

await writeFile(indexPath, html.replace(root, `<div id="root">${rendered}</div>`))
// The SSR bundle is build-time machinery, not an asset for the static host.
await rm(new URL('../dist/server/', import.meta.url), { recursive: true, force: true })
