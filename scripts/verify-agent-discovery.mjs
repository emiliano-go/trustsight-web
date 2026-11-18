#!/usr/bin/env node
// Validate the static agent-discovery surface and the read-only MCP bridge.
//
// The files are boring; the failure mode is not. A moved skill without its
// digest, a header file that stops advertising the catalog, or an MCP handler
// that cannot answer initialize all fail here rather than after deploy.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const publicDir = join(root, 'public')
const distDir = join(root, 'dist')
const checkDist = process.argv.includes('--dist')
const failures = []

function read(rel) {
  const path = join(publicDir, rel)
  if (!existsSync(path)) {
    failures.push(`missing ${rel}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function json(rel) {
  try {
    return JSON.parse(read(rel))
  } catch (error) {
    failures.push(`${rel}: ${error.message}`)
    return null
  }
}

// --- robots.txt ------------------------------------------------------------
const robots = read('robots.txt')
for (const needle of [
  'User-agent: *',
  'Content-Signal: ai-train=no, search=yes, ai-input=yes',
  'User-agent: OAI-SearchBot',
  'User-agent: GPTBot',
  'Agentmap: https://trustsight.org/.well-known/ai-catalog.json',
  'Sitemap: https://trustsight.org/sitemap.xml',
]) {
  if (!robots.includes(needle)) failures.push(`robots.txt lost ${needle}`)
}

// --- headers ---------------------------------------------------------------
const headers = read('_headers')
for (const needle of [
  'rel="api-catalog"',
  'rel="ai-catalog"',
  'rel="service-doc"',
  'Vary: Accept',
  'connect-src \'self\' https://watcher.trustsight.org',
]) {
  if (!headers.includes(needle)) failures.push(`_headers lost ${needle}`)
}

// --- API catalog -----------------------------------------------------------
const apiCatalog = json('.well-known/api-catalog')
if (apiCatalog) {
  const entry = apiCatalog.linkset?.[0]
  if (!entry?.anchor) failures.push('api-catalog: no anchor')
  for (const rel of ['service-desc', 'service-doc', 'status']) {
    if (!entry?.[rel]?.[0]?.href) failures.push(`api-catalog: no ${rel}`)
  }
}

// --- ARD catalog -----------------------------------------------------------
const aiCatalog = json('.well-known/ai-catalog.json')
if (aiCatalog) {
  if (aiCatalog.specVersion !== '1.0') failures.push('ai-catalog: bad specVersion')
  if (!aiCatalog.host?.identifier) failures.push('ai-catalog: no host identifier')
  if (!Array.isArray(aiCatalog.entries) || aiCatalog.entries.length < 2) {
    failures.push('ai-catalog: too few entries')
  }
  for (const entry of aiCatalog.entries || []) {
    if (!entry.identifier?.startsWith('urn:air:')) {
      failures.push(`ai-catalog: bad identifier ${entry.identifier}`)
    }
    if (!entry.displayName || !entry.type) {
      failures.push(`ai-catalog: incomplete entry ${entry.identifier}`)
    }
    if ((entry.url ? 1 : 0) + (entry.data ? 1 : 0) !== 1) {
      failures.push(`ai-catalog: exactly one of url/data for ${entry.identifier}`)
    }
    if (!Array.isArray(entry.representativeQueries) || entry.representativeQueries.length < 2) {
      failures.push(`ai-catalog: representativeQueries for ${entry.identifier}`)
    }
  }
}

// --- protected resource ----------------------------------------------------
const resource = json('.well-known/oauth-protected-resource')
if (resource) {
  if (resource.resource !== 'https://trustsight.org/') {
    failures.push('oauth-protected-resource: wrong resource')
  }
  if (!Array.isArray(resource.authorization_servers)) {
    failures.push('oauth-protected-resource: authorization_servers must be an array')
  }
}

// --- MCP server card -------------------------------------------------------
const card = json('.well-known/mcp/server-card.json')
if (card) {
  if (!card.name || !card.version || !card.description) {
    failures.push('server-card: missing identity')
  }
  if (!card.remotes?.[0]?.url) failures.push('server-card: missing remote')
  if (!card.capabilities?.tools) failures.push('server-card: missing tools capability')
}

// --- agent skill digest ----------------------------------------------------
const index = json('.well-known/agent-skills/index.json')
if (index) {
  if (!index.$schema) failures.push('agent-skills: missing $schema')
  for (const skill of index.skills || []) {
    if (!skill.name || !skill.type || !skill.url || !skill.digest) {
      failures.push(`agent-skills: incomplete ${skill.name}`)
      continue
    }
    const rel = skill.url.replace('https://trustsight.org/', '')
    const body = read(rel)
    const digest = `sha256:${createHash('sha256').update(body).digest('hex')}`
    if (digest !== skill.digest) {
      failures.push(`${skill.name}: digest is stale (${digest})`)
    }
  }
}

// --- MCP handler -----------------------------------------------------------
const mcp = await import(join(root, 'functions/mcp.js'))
const originalFetch = globalThis.fetch
globalThis.fetch = async (url) =>
  new Response(JSON.stringify({ url: String(url), items: [] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

async function rpc(payload) {
  const request = new Request('https://trustsight.org/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const response = await mcp.onRequestPost({ request })
  return { status: response.status, body: await response.json() }
}

try {
  const init = await rpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-06-18' },
  })
  if (init.body.result?.protocolVersion !== '2025-06-18') {
    failures.push('mcp: initialize did not negotiate a protocol')
  }
  const list = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
  if (list.body.result?.tools?.length !== 4) {
    failures.push('mcp: tools/list did not return four tools')
  }
  const call = await rpc({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'search-alerts', arguments: { q: 'yay', limit: 2 } },
  })
  if (call.body.result?.isError) failures.push('mcp: search-alerts failed')
} catch (error) {
  failures.push(`mcp: ${error.message}`)
} finally {
  globalThis.fetch = originalFetch
}

// --- built output ----------------------------------------------------------
if (checkDist) {
  for (const rel of [
    '.well-known/api-catalog',
    '.well-known/ai-catalog.json',
    '.well-known/agent-skills/index.json',
    '.well-known/agent-skills/trustsight-audit/SKILL.md',
    '.well-known/mcp/server-card.json',
    '.well-known/oauth-protected-resource',
    'auth.md',
    'mcp/server-card',
    'robots.txt',
  ]) {
    if (!existsSync(join(distDir, rel))) failures.push(`dist: missing ${rel}`)
  }
}

if (failures.length) {
  console.error(`verify-agent-discovery: ${failures.length} problem(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(`verify-agent-discovery: OK${checkDist ? ' (source + dist)' : ''}`)
