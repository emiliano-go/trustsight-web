// The Markdown representation served for `Accept: text/markdown`.
//
// It is derived from the same server render as the HTML, so the two cannot
// disagree about what the page says. Only the content region is converted:
// the masthead controls, theme switch and inline icons are page chrome, not
// content, and agents should not have to read them.

import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const ORIGIN = 'https://trustsight.org'

const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
})

turndown.use(gfm)
turndown.remove(['svg', 'button', 'script', 'style', 'noscript'])

// Root-relative links are only usable from the page itself; make them absolute
// so the Markdown stands on its own wherever an agent stores it.
turndown.addRule('absolute-links', {
  filter: (node) => node.nodeName === 'A' && node.getAttribute('href')?.startsWith('/'),
  replacement: (content, node) => {
    const href = node.getAttribute('href')
    const text = content.trim() || href
    return `[${text}](${ORIGIN}${href})`
  },
})

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

/**
 * Convert the server-rendered page to its Markdown representation.
 * @param {string} rendered server render output (the same string the HTML uses)
 * @returns {string}
 */
export function pageToMarkdown(rendered) {
  const main = rendered.match(/<main id="content">([\s\S]*)<\/main>/)
  if (!main) throw new Error('markdown: no <main id="content"> in the server render')

  // The colophon and source list live in the footer but are content, not
  // chrome; the masthead controls are the only part that is skipped.
  const footer = rendered.match(/<footer\b[^>]*>([\s\S]*)<\/footer>/)
  const content = [main[1], footer?.[1]].filter(Boolean).join('\n')

  const title = rendered.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
  if (!title) throw new Error('markdown: no <h1> in the server render')

  const body = turndown
    .turndown(content)
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const heading = `# ${decode(title[1].replace(/<[^>]+>/g, '')).trim()}`

  return `${heading}

TrustSight audits Arch User Repository package updates before you install them.

> Markdown representation of <${ORIGIN}/>. The HTML page is canonical; request
> it with \`Accept: text/markdown\` to get this document instead.

${body}
`
}
