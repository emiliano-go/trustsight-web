import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

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
      const html = readFileSync(file, 'utf8')
      if (html.includes(tag)) return
      if (!html.includes('</head>')) throw new Error('preload-font: </head> not found in built index.html')
      writeFileSync(file, html.replace('</head>', `    ${tag}\n  </head>`))
    },
  }
}

// Preact renders the static artifact at build time; the browser entry point is
// dependency-free progressive enhancement for the handful of controls.
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
