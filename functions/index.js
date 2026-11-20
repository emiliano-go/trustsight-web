// Markdown for Agents: when a client explicitly asks for `text/markdown`,
// answer with the prebuilt Markdown representation of the landing page.
//
// HTML stays the default. Anything that does not prefer markdown — browsers,
// `curl` with `Accept: */*`, crawlers that only send `text/html` — falls
// through to the static asset, so this adds no new content surface and cannot
// change what a browser receives.

const MARKDOWN_TYPES = new Set(['text/markdown', 'text/x-markdown'])
const HTML_TYPES = new Set(['text/html', 'application/xhtml+xml'])

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // The document is plain text; nothing in it may load or run.
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
}

/**
 * Whether the Accept header prefers markdown over HTML.
 * @param {string | null} accept
 * @returns {boolean}
 */
export function prefersMarkdown(accept) {
  if (!accept) return false
  let markdown = -1
  let html = -1
  for (const part of accept.split(',')) {
    const [rawType, ...params] = part.trim().toLowerCase().split(';')
    const type = rawType.trim()
    let quality = 1
    for (const param of params) {
      const match = param.trim().match(/^q=([0-9]*\.?[0-9]+)$/)
      if (match) quality = Number(match[1])
    }
    if (MARKDOWN_TYPES.has(type)) markdown = Math.max(markdown, quality)
    else if (HTML_TYPES.has(type) || type === 'application/xml' || type === 'text/xml') {
      html = Math.max(html, quality)
    }
  }
  if (markdown <= 0) return false
  return html < 0 || markdown >= html
}

export async function onRequest(context) {
  const { request, next, env } = context
  if (request.method !== 'GET' && request.method !== 'HEAD') return next()
  if (!prefersMarkdown(request.headers.get('Accept'))) return next()

  try {
    const asset = await env.ASSETS.fetch(new Request(new URL('/index.md', request.url)))
    if (!asset.ok) return next()
    const body = await asset.text()
    return new Response(request.method === 'HEAD' ? null : body, {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        Vary: 'Accept',
        // The Markdown for Agents convention; a rough but stable estimate.
        'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
      },
    })
  } catch {
    // A missing or unreadable artifact must never take the homepage down.
    return next()
  }
}
