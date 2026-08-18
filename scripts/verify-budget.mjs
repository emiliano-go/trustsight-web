import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, constants } from 'node:zlib'

const limits = [
  ['JavaScript', 'assets', '.js', 8 * 1024],
  ['total artifact', '.', '', 350 * 1024],
]
const compressedLimits = [
  // HTML carries the inlined stylesheet (CSS asset is inlined at prerender,
  // so nothing render-blocks first paint); ~10.9 kB page + ~4.2 kB CSS.
  ['HTML', ['index.html'], 18 * 1024],
  ['JavaScript', ['assets', '.js'], 2 * 1024],
  ['font', ['fonts', '.woff2'], 35 * 1024],
  ['critical path', ['index.html', 'assets', '.js', 'fonts', '.woff2'], 70 * 1024],
]

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(path) : [path]
  }))
  return files.flat()
}

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const files = await filesIn(dist)
const failures = []

for (const [name, directory, extension, limit] of limits) {
  const prefix = join(dist, directory)
  const selected = files.filter((file) => file.startsWith(prefix) && file.endsWith(extension))
  const size = (await Promise.all(selected.map((file) => stat(file)))).reduce((total, file) => total + file.size, 0)
  console.log(`${name}: ${size} B / ${limit} B`)
  if (size > limit) failures.push(`${name} exceeds its ${limit} B budget`)
}

function matches(file, selectors) {
  return selectors.some((selector) => file.endsWith(selector))
}

for (const [name, selectors, limit] of compressedLimits) {
  const selected = files.filter((file) => matches(file, selectors))
  const size = (await Promise.all(selected.map(async (file) => {
    const data = await readFile(file)
    return brotliCompressSync(data, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length
  }))).reduce((total, bytes) => total + bytes, 0)
  console.log(`${name} Brotli: ${size} B / ${limit} B`)
  if (size > limit) failures.push(`${name} Brotli exceeds its ${limit} B budget`)
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`)
  process.exitCode = 1
}
