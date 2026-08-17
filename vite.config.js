import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// Inter is the page's only font and the masthead H1 is the LCP element, so
// the latin woff2 is preloaded straight from the HTML. Without this it waits
// for the CSS + JS to load before the browser even learns the font exists.
// Only the latin subset is preloaded: the other subsets carry unicode-ranges
// the browser would not use on this page.
function preloadFont() {
  return {
    name: 'preload-inter-font',
    writeBundle() {
      const outDir = 'dist'
      if (!existsSync(join(outDir, 'assets'))) return
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
// ships as one small JS bundle and one CSS file.
export default defineConfig({
  plugins: [preact(), preloadFont()],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    cssMinify: 'lightningcss',
    minify: 'terser',
    terserOptions: {
      compress: {
        defaults: true,
        drop_debugger: true,
        passes: 3,
        pure_getters: 'strict',
      },
      mangle: {
        toplevel: true,
      },
      module: true,
      format: {
        comments: false,
      },
    },
    assetsInlineLimit: 0,
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
})
