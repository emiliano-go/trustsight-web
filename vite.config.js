import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Inter is the page's only font and the masthead H1 is the LCP element, so
// the latin woff2 is preloaded straight from the HTML. Without this it waits
// for the CSS + JS to load before the browser even learns the font exists.
// Only the latin subset is preloaded: the other subsets carry unicode-ranges
// the browser would not use on this page.
function preloadFont() {
  return {
    name: 'preload-inter-font',
    closeBundle() {
      const outDir = 'dist'
      const latin = readdirSync(join(outDir, 'assets')).find(
        (file) => file.startsWith('inter-latin-wght-normal-') && file.endsWith('.woff2')
      )
      if (!latin) throw new Error('preload-font: latin Inter woff2 not found in dist/assets')
      const tag = `<link rel="preload" href="/assets/${latin}" as="font" type="font/woff2" crossorigin />`
      const file = join(outDir, 'index.html')
      let html = readFileSync(file, 'utf8')
      if (html.includes(tag)) return
      if (!html.includes('</head>')) throw new Error('preload-font: </head> not found in built index.html')
      writeFileSync(file, html.replace('</head>', `    ${tag}\n  </head>`))
    },
  }
}

// Single-page landing. One route, no code splitting needed: the entire page
// ships as one small JS bundle and one CSS file. oxc + lightningcss match the
// dbwarden site's aggressive-minification baseline.
export default defineConfig({
  plugins: [react(), preloadFont()],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    cssMinify: 'lightningcss',
    minify: 'oxc',
    assetsInlineLimit: 0,
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
})
