import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const limits = [
  ['JavaScript', 'assets', '.js', 250 * 1024],
  ['CSS', 'assets', '.css', 30 * 1024],
  ['total artifact', '.', '', 1024 * 1024],
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

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`)
  process.exitCode = 1
}
