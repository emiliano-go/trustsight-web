// WebMCP tools for the marketing page. The page itself is a static artifact;
// these tools expose the public watcher API and the install command to a
// browser agent without adding any write surface.

import { INSTALL } from './install.js'

const WATCHER = 'https://watcher.trustsight.org'

async function getJson(path) {
  const response = await fetch(`${WATCHER}${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`watcher returned HTTP ${response.status}`)
  return response.json()
}

const tools = [
  {
    name: 'search-alerts',
    description: 'Search the public TrustSight watcher feed for AUR alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Package, rule, maintainer or free text.' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      required: ['q'],
      additionalProperties: false,
    },
    async execute({ q, limit = 10 }) {
      const query = String(q || '').trim()
      if (!query) throw new Error('q is required')
      return getJson(
        `/api/feed?q=${encodeURIComponent(query)}&limit=${Math.min(50, Math.max(1, limit))}`,
      )
    },
  },
  {
    name: 'latest-alerts',
    description: 'Return the most recent alerts from the TrustSight watcher.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
      },
      additionalProperties: false,
    },
    execute({ limit = 5 } = {}) {
      return getJson(`/api/latest/${Math.min(20, Math.max(1, limit))}`)
    },
  },
  {
    name: 'install-command',
    description:
      'Return the commands that install TrustSight from source. This does not run them.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute() {
      return {
        commands: INSTALL.https,
        docs: 'https://docs.trustsight.org/start-here/installation/',
      }
    },
  },
]

export function registerAgentTools() {
  const modelContext =
    (typeof document !== 'undefined' && document.modelContext) ||
    (typeof navigator !== 'undefined' && navigator.modelContext)
  if (!modelContext || typeof modelContext.registerTool !== 'function') return

  const controller = new AbortController()
  for (const tool of tools) {
    try {
      const result = modelContext.registerTool(tool, {
        signal: controller.signal,
      })
      if (result && typeof result.catch === 'function') result.catch(() => {})
    } catch {
      // A browser without the full WebMCP surface must not break the page.
    }
  }
}
