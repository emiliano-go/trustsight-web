import { useEffect, useRef, useState } from 'react'
import { plateExample, plateFlagged, plateDeps } from './plate.js'
import { linkRules } from './rules.js'

const DOCS = 'https://docs.trustsight.org'
const GITHUB = 'https://github.com/emiliano-go/trustsight'
const SECURITY = `${DOCS}/security/`
const RULES = `${DOCS}/reference/rules/`

/* One focusable, labelled graphic. The box-drawing characters are read aloud
   one by one by screen readers, so the scroll region is role="img" with a
   prose aria-label and the <pre> is aria-hidden. */
function Plate({ label, lines, caption }) {
  return (
    <figure className="plate">
      <div className="plate__scroll" tabIndex="0" role="img" aria-label={label}>
        <pre className="term" aria-hidden="true"><code>{lines.map((line, i) => <span key={i}>{renderLine(line)}{'\n'}</span>)}</code></pre>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

const TAG_RE = /\[(?:[RCDSX]\d{3}|SOURCE_BUCKET)\]/g

/* A dependency mini-card sits inside its parent panel: outer border, then an
   indent, then the card's box border. The card is flagged, so its border
   renders red; the outer panel border stays plain. */
const CARD_RE = /│\s+[╭│╰]/

function renderLine(line) {
  const isCard = CARD_RE.test(line)
  const cls = isCard ? 't-red' : 't-blue'
  const re = isCard ? /[╭─╮╰╯│]/g : TAG_RE
  const parts = []
  let last = 0
  let match
  re.lastIndex = 0
  while ((match = re.exec(line)) !== null) {
    if (isCard && (match.index === 0 || match.index === line.length - 1)) continue
    if (match.index > last) parts.push(line.slice(last, match.index))
    parts.push(<span className={cls} key={match.index}>{match[0]}</span>)
    last = match.index + match[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return parts.length ? parts : line
}

/* The hero and install-section command block. The copy control copies the
   selected clone command without prompts. */
const INSTALL = {
  https: [
    'git clone https://github.com/emiliano-go/trustsight.git',
    'cd trustsight/packaging/aur && makepkg -si',
    'trustsight review',
  ].join('\n'),
  ssh: [
    'git clone git@github.com:emiliano-go/trustsight.git',
    'cd trustsight/packaging/aur && makepkg -si',
    'trustsight review',
  ].join('\n'),
}

function fallbackCopy(text, done) {
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  try { document.execCommand('copy') } catch (e) {}
  document.body.removeChild(el)
  done()
}

/* The same switch the dbwarden site ships: a sun/moon pill that writes
   data-theme on <html> and persists the choice. React controls the toggle;
   the head script only sets the initial value, so there is no flash and no
   double-toggle. */
function ThemeSwitch({ dark, toggleTheme }) {
  return (
    <button className={dark ? 'theme-switch is-dark' : 'theme-switch'} type="button" onClick={toggleTheme} role="switch" aria-checked={dark} aria-label="Toggle color theme">
      <span className={dark ? 'theme-option theme-sun' : 'theme-option theme-sun is-active'} aria-hidden="true"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg></span>
      <span className={dark ? 'theme-option theme-moon is-active' : 'theme-option theme-moon'} aria-hidden="true"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg></span>
    </button>
  )
}

/* Accessibility settings: font size and high contrast, persisted. Same
   behaviour as the dbwarden site's menu. */
function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('ts-font-size') === 'large' ? 'large' : 'normal')
  const [contrast, setContrast] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('ts-contrast') === 'high')
  const wrapRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize
    try { localStorage.setItem('ts-font-size', fontSize) } catch (e) {}
  }, [fontSize])

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast ? 'high' : 'normal'
    try { localStorage.setItem('ts-contrast', contrast ? 'high' : 'normal') } catch (e) {}
  }, [contrast])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="a11y-wrap" ref={wrapRef}>
      <button className={open ? 'a11y-button is-open' : 'a11y-button'} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog" aria-label="Accessibility settings">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="1.6" /><path d="M12 9.8v4.4" /><path d="M12 11.5 7.8 8.5" /><path d="M12 11.5l4.2-3" /><path d="M12 14.2 9.2 18.2" /><path d="M12 14.2l2.8 4" /></svg>
      </button>
      {open ? (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility settings">
          <div className="a11y-row"><span className="a11y-label">Font size</span><div className="a11y-seg" role="group" aria-label="Font size"><button type="button" className={fontSize === 'normal' ? 'is-on' : ''} onClick={() => setFontSize('normal')} aria-pressed={fontSize === 'normal'}>A</button><button type="button" className={fontSize === 'large' ? 'is-on' : ''} onClick={() => setFontSize('large')} aria-pressed={fontSize === 'large'}><span className="a11y-big">A</span></button></div></div>
          <div className="a11y-row"><span className="a11y-label">High contrast</span><div className="a11y-seg" role="group" aria-label="High contrast"><button type="button" className={!contrast ? 'is-on' : ''} onClick={() => setContrast(false)} aria-pressed={!contrast}>Off</button><button type="button" className={contrast ? 'is-on' : ''} onClick={() => setContrast(true)} aria-pressed={contrast}>On</button></div></div>
        </div>
      ) : null}
    </div>
  )
}

function InstallCommand({ className }) {
  const [copied, setCopied] = useState(false)
  const [protocol, setProtocol] = useState('https')
  const install = INSTALL[protocol]

  const copy = () => {
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(install).then(done).catch(() => fallbackCopy(install, done))
    } else {
      done()
    }
  }

  return (
    <div className={className ? `install-command ${className}` : 'install-command'}>
      <div className="install-command__header">
        <span className="install-command__title">Install from source</span>
        <div className="install-command__actions">
          <button
            type="button"
            className={protocol === 'ssh' ? 'install-command__protocol is-ssh' : 'install-command__protocol'}
            onClick={() => setProtocol((value) => value === 'https' ? 'ssh' : 'https')}
            aria-label={`Switch to ${protocol === 'https' ? 'SSH' : 'HTTPS'} clone URL`}
            role="switch"
            aria-checked={protocol === 'ssh'}
          >
            <span className={protocol === 'https' ? 'install-command__protocol-option is-active' : 'install-command__protocol-option'} aria-hidden="true">HTTPS</span>
            <span className="install-command__protocol-track" aria-hidden="true"><span /></span>
            <span className={protocol === 'ssh' ? 'install-command__protocol-option is-active' : 'install-command__protocol-option'} aria-hidden="true">SSH</span>
          </button>
          <button type="button" className="install-command__copy" onClick={copy} aria-label="Copy the install commands">
            {copied ? 'copied ✓' : 'copy'}
          </button>
        </div>
      </div>
      <span className="install-command__body">
        <span className="visually-hidden">Install using {protocol}: </span>
        <span className="cmd-line"><span className="dollar" aria-hidden="true">$</span> {install.split('\n')[0]}</span>
        <span className="cmd-line"><span className="dollar" aria-hidden="true">$</span> cd trustsight/packaging/aur &amp;&amp; makepkg -si</span>
        <span className="cmd-line"><span className="dollar" aria-hidden="true">$</span> trustsight review</span>
      </span>
    </div>
  )
}

/* One link to the docs at the end of every section, pointing at the page
   that covers the section's topic. */
function DocsLink({ href, children }) {
  return (
    <p className="section-docs">
      <a href={href} target="_blank" rel="noreferrer">Documentation · {children} ↗</a>
    </p>
  )
}

/* The config.toml example. Rows are rendered inside a <pre>, so newlines are
   explicit children; trailing comments align at column 22 like the real file. */
const CONFIG = [
  { line: '# ~/.config/trustsight/config.toml', comment: true },
  { line: '[depth]', comment: true },
  { line: 'levels = 1', tail: '# 0 off, 1 direct deps, n levels, -1 all' },
  { line: '' },
  { line: '[rules]', comment: true },
  { line: 'experimental = false', tail: '# rules whose fire rate is not yet measured' },
  { line: '' },
  { line: '[seed]', comment: true },
  { line: 'auto_import = true', tail: '# fetch the signed novelty seed on first run' },
]

function renderConfigRow(row) {
  if (row.comment) return <span className="comment">{row.line}</span>
  if (row.tail) {
    const pad = 22
    return (
      <>
        {row.line}
        {' '.repeat(pad - row.line.length)}
        <span className="comment">{row.tail}</span>
      </>
    )
  }
  return row.line
}

const principles = [
  {
    strong: 'It reports evidence, and the absence of evidence.',
    text: 'Every finding is traceable to a diff line, a URL, or a novelty record, and anything the run could not examine is stated in the report.',
  },
  {
    strong: 'Absence is not proof of safety.',
    text: 'An UNFLAGGED verdict means no published rule matched what was examined. It does not mean the package is safe, that the ruleset is complete, or that anything was executed.',
  },
  {
    strong: 'The report is input to a decision, not the decision.',
    text: 'TrustSight does not authorize an update. You do.',
  },
  {
    strong: 'Unknowns surface.',
    text: 'Errors, truncated diffs, and unexamined content are part of the report, never hidden by default.',
  },
]

const detects = [
  { attack: 'Piped shell scripts (<code>curl | bash</code>, <code>base64 | sh</code>)', how: 'Scans every new or changed line for command-to-shell pipelines (R001).' },
  { attack: 'Obfuscated commands (encoded strings, <code>LD_PRELOAD</code> environment subversion)', how: 'Resolves variables, decodes known encodings, and flags build-environment tampering (R003, R070).' },
  { attack: 'Checksum disabled or removed', how: 'Compares the old and new <code>sha256sums</code> / <code>md5sums</code> arrays (R004, R005).' },
  { attack: 'Source URL typosquatting (<code>githab.com</code> for <code>github.com</code>)', how: 'The source-bucket prior classifies every new URL; a domain written with confusable characters is labelled <code>homograph_attack</code> (+30). A prior, not a rule.' },
  { attack: 'Package-name typosquatting (<code>libuvc</code> resembling <code>libuv</code>)', how: 'Edit-distance comparison against more popular packages in the seed database (R074).' },
  { attack: 'A risky AUR dependency (novel, typosquatted, or hijacked)', how: 'Walks AUR dependencies to a configurable depth (default: direct ones; <code>--depth</code> to go further) and analyses each as a package in its own right: novel (D001), typosquatted (D002), network-using makedepends (D003), and provides hijacks (D004).' },
  { attack: 'Source URL swapped without a version bump', how: 'Tracks source URL changes that do not come with a new version (C003).' },
  { attack: 'Novel, never-before-seen URLs or maintainers', how: 'Compares against the signed release seed: about 180,000 known source URLs and 35,587 hashed maintainer identities, in the novelty tier.' },
  { attack: 'Known-bad indicators', how: 'Matches package URLs and strings against signed, federated IOC baselines; reported outside the heuristic score (IOC tier).' },
  { attack: 'Unicode bidi override attacks (invisible characters that change how text displays)', how: 'Detects directionality overrides and homoglyph codepoints in PKGBUILD content (R013, FATAL).' },
  { attack: 'Prompt injection in package metadata', how: 'Pattern-matches common injection templates; the primary defence is structural (R012).' },
  { attack: 'GPG verification removed', how: 'Detects when <code>validpgpkeys</code> was populated and is now empty (R069).' },
  { attack: 'Untrusted maintainer takeover', how: 'A maintainer change to someone never seen before (R071).' },
  { attack: 'A stale package suddenly revived', how: 'A package with no updates for over a year suddenly gets one (R067).' },
  { attack: 'Sabotage payloads (fork bombs, <code>rm -rf /</code>, disk wiping, coin miners)', how: 'Command-position matching separates build-sandbox housekeeping (<code>rm -rf "$srcdir/x"</code>) from system damage (S001–S008).' },
  { attack: 'Orphan hijacking (adopted from orphan, then rewritten with no upstream change)', how: 'The maintainer field against its last recorded state, plus a recipe-only-change signature (R141–R143).' },
  { attack: 'Build steps that fetch unpinned code (<code>npm install</code> in a build function)', how: 'Not scored. Reported as the <code>unpinned_build_deps</code> coverage gap, because what the build will run is not in the analysed text and no checksum covers it.' },
]

const tiers = [
  { tier: 'A: Structural', what: 'Direct structural facts from the diff.', example: '<code>curl | bash</code> (R001); checksum set to SKIP (R004)', weight: 'The strongest evidence' },
  { tier: 'B: Priors / Context', what: 'Source-bucket classification of every new URL.', example: 'an unknown domain adds weight', weight: 'Moderate: a prior, not proof' },
  { tier: 'C: History / Novelty', what: 'First-seen history for URLs and maintainers, maturity-gated.', example: 'URL first seen globally; maintainer first seen', weight: 'Scales with observation history' },
  { tier: 'D: Verification', what: 'What the recipe declares: checksums, PGP keys, pins.', example: 'P001–P007', weight: '0: reported, never scored' },
]

const nsCategories = {
  r: [
    ['Fetch and Execution', 'fetch-and-execution', 33],
    ['Integrity and Verification', 'integrity', 17],
    ['Install and Persistence', 'install-and-persist', 13],
    ['Maintainer and Metadata', 'maintainer-and-metadata', 12],
    ['Obfuscation', 'obfuscation', 8],
    ['Staging and Reconnaissance', 'staging-and-recon', 8],
    ['Corpus Behavioral', 'corpus-behavioral', 7],
    ['Naming and Dependencies', 'naming-and-dependency', 6],
    ['Deception and Anti-Analysis', 'deception', 5],
    ['Count-Based', 'count-based', 5],
    ['Temporal Context', 'temporal', 3],
    ['Composition', 'composition', 2],
  ],
  c: [
    ['Integrity and Verification', 'integrity', 5],
    ['Maintainer and Metadata', 'maintainer-and-metadata', 1],
    ['Fetch and Execution', 'fetch-and-execution', 1],
  ],
  d: [
    ['Naming and Dependencies', 'naming-and-dependency', 4],
  ],
  s: [
    ['Sabotage', 'sabotage', 8],
  ],
  x: [
    ['Crossfire', 'crossfire', 7],
  ],
}

const namespaces = [
  {
    letter: 'R',
    name: 'Detection rules',
    count: '119 rules',
    blurb: '119 pattern rules read the diff and the variable-resolved command text. Each is a published pattern with a severity from INFO to FATAL, and a FATAL finding pins the verdict to 100: a bidi-override attack cannot be weighted away. The rules group by the kind of claim they make, from fetch and execution and integrity through obfuscation, deception, and temporal context, and every match is reported with the line or URL it fired on.',
    cats: nsCategories.r,
  },
  {
    letter: 'C',
    name: 'Structural rules',
    count: '7 rules',
    blurb: 'Seven context rules reason about the diff as a whole rather than any single line, comparing the old and new states of the same field: a source URL that changed without a version bump, a checksum list that shrank, metadata that contradicts itself. Where the pattern rules ask what a line does, the structural rules ask whether the change is internally consistent, across integrity, metadata, and fetch facts.',
    cats: nsCategories.c,
  },
  {
    letter: 'D',
    name: 'Dependency-graph rules',
    count: '4 rules',
    blurb: 'Four rules treat the dependency graph as first-class evidence. A review walks a package\'s AUR dependencies, direct ones by default and deeper with --depth, analysing each as a package in its own right: has it been seen before, does its name resemble a more popular package, does it fetch over the network during build, does it hijack a provides others rely on. Novelty is judged against the same signed seed the URL rules use.',
    cats: nsCategories.d,
  },
  {
    letter: 'S',
    name: 'Sabotage rules',
    count: '8 rules',
    blurb: 'Eight rules look for payloads aimed at the operator\'s machine rather than at getting something out of it: resource exhaustion, deletion, permission sabotage, service disruption, and resource theft. What unites them is that the machine running the build is the target. Each rule is written against a distinction, not a command: rm -rf inside the sandbox is housekeeping, rm -rf / is an attack, and a mention is not an invocation.',
    cats: nsCategories.s,
  },
  {
    letter: 'X',
    name: 'Crossfire rules',
    count: '7 rules',
    blurb: 'The evasion technique, not the payload it hides. Every other family fires on what a diff does; these fire on how it was written. Partial quoting, array routing, and command substitution assemble an executable name no pattern ever sees, so a word the tokenizer could not reduce to a literal is itself the signal. One rule covers the evasion surface of every payload rule at once, and a defeated tokenizer produces a CRITICAL finding rather than silence.',
    cats: nsCategories.x,
  },
  {
    letter: 'P',
    name: 'Declared practice',
    count: 'weight 0',
    blurb: 'What the recipe declares, not what the analysis found. These findings read the claims a PKGBUILD makes about itself: checksums declared for every non-VCS source, validpgpkeys present, signatures sourced, sources pinned to a commit hash or tag, downloads over HTTPS. Every one is INFO and checkable by the reader against the file itself. They are reported, never credited: a signal an attacker can assert for free must not move a score.',
    cats: [
      ['Checksums declared for all non-VCS sources (P001)', 'system/#declared-practice', null],
      ['validpgpkeys declared (P002)', 'system/#declared-practice', null],
      ['Signature source with PGP keys declared (P003)', 'system/#declared-practice', null],
      ['Source pinned to a full commit hash (P005)', 'system/#declared-practice', null],
      ['Source pinned to a tag (P006)', 'system/#declared-practice', null],
      ['Source on a trusted forge over HTTPS (P007)', 'system/#declared-practice', null],
    ],
  },
]

const limits = [
  { strong: 'Malicious upstream tarballs.', text: 'TrustSight audits the PKGBUILD, not the binaries it downloads. A clean build file can point to a compromised tarball.' },
  { strong: 'Deliberately unremarkable attacks.', text: 'With no commands added, no URLs changed, and no checksums disabled, there is no diff signal. The rules detect patterns associated with compromise, not compromise itself.' },
  { strong: 'Dependencies past the configured depth.', text: 'Past <code>--depth</code>, and past the hard ceilings on an exhaustive walk, the closure is unread, and the report says so with a <code>deps_not_scanned</code> coverage gap.' },
  { strong: 'Runtime behaviour.', text: 'Nothing is executed, sandboxed or otherwise, because executing a PKGBUILD would let hostile input detect the review and change its behaviour. Static analysis by design.' },
  { strong: 'Zero-day structural attacks.', text: 'The rules are pattern-based. A novel attack that leaves no matching pattern will not fire.' },
]

const faqs = [
  {
    q: 'Does this replace reading the PKGBUILD?',
    a: <>No. TrustSight is a second pair of eyes, not a substitute for reading the diff. Every finding points at the line or URL it fired on, so the report tells you where to look, and you still do the looking. The tool&rsquo;s own principle is that the report is input to a decision, not the decision: it does not authorize an update, you do.</>,
  },
  {
    q: 'Is installing TrustSight safe?',
    a: <>The tool never runs the PKGBUILD, never executes extracted commands, and never installs or modifies anything it reviews; it reads diffs and runs pattern rules over the text. The package itself is MIT licensed and open source, and the PKGBUILD in the repository runs the test suite during build. Reviewing a package is not the same as trusting it, and the same applies to the reviewer.</>,
  },
  {
    q: 'What does an UNFLAGGED verdict mean?',
    a: <>It means the score stayed at or below 20: no published rule matched the evidence that was examined. It does not mean the package is safe, that the ruleset is complete, or that anything was executed. Absence of signals is a statement about detection, not about the update.</>,
  },
  {
    q: 'Why does the tool never run the PKGBUILD?',
    a: <>Executing a recipe written by the party under review would let hostile input detect the review and change its behaviour. Static analysis is a deliberate boundary: the tool reads what the diff says, not what a sandbox would run. Runtime behaviour is listed as a structural limitation, not an accident.</>,
  },
  {
    q: 'Why is my package flagged when the update looks normal?',
    a: <>About 13% of benign diffs score above the threshold. The tool reports evidence first and the score on request, so a flag is a reason to look, not a verdict to accept. Open the report, check which rules fired and where, and decide from the diff. That is the intended workflow, not a false-positive problem.</>,
  },
  {
    q: 'How does novelty detection work before I have any history?',
    a: <>The first run imports a signed seed of about 180,000 normalised source URLs and 35,587 hashed maintainer identities, verified against a key pinned in the package. Novelty signals are maturity-gated: they scale with your own observation count (<code>observation_count / 50</code>), so a cold database contributes nothing and your own reviews take over as history accumulates.</>,
  },
  {
    q: 'Does TrustSight phone home?',
    a: <>The analysis is local. The only two declared network hosts are <code>aur.archlinux.org</code> (the RPC, the metadata dump, the git clone, and cgit) and the GitHub releases channel, used only for verified baseline assets such as the seed and the IOC lists, on explicit commands or first-run auto-import. The tool never connects to a host named by the package under review.</>,
  },
  {
    q: 'Why does it review my AUR dependencies too?',
    a: <>makepkg builds a package&rsquo;s depends on your machine in the same run, so a dependency is part of what actually executes. A default review analyses direct AUR dependencies and summarises them; <code>trustsight review --deps</code> reviews each as a package in its own right, and <code>--depth n</code> walks deeper. The walk is bounded, and a closure cut short is reported, never hidden.</>,
  },
  {
    q: 'Can it stop a malicious package from being installed?',
    a: <>No. TrustSight is a review tool, not an execution gate. It produces evidence about a diff and a verdict in plain English; you decide whether to build and install. Nothing the tool does blocks makepkg, and nothing it says is permission.</>,
  },
  {
    q: 'Why is there no score in the default output?',
    a: <>The default output is findings, the change summary, and the verdict, because a number invites a decision the tool is not entitled to make. The score exists, is deterministic, and is available with <code>--score</code> (and in JSON with <code>--score</code> or <code>--risk</code>). The evidence is the product; the score is a summary of it.</>,
  },
  {
    q: 'What happens when the tool cannot see everything?',
    a: <>It says so. Coverage gaps such as <code>deps_not_scanned</code> (dependencies past the configured depth) and <code>unpinned_build_deps</code> (build steps that fetch unpinned code) are part of the report, and an analysis with a coverage gap is never issued as UNFLAGGED. A report that hid what it could not look at would be indistinguishable from one that was switched off.</>,
  },
]

export function App() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try { localStorage.setItem('ts-theme', dark ? 'dark' : 'light') } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = dark ? '#0D1117' : '#FBFBF9'
  }, [dark])

  const toggleTheme = () => setDark((value) => !value)

  return (
    <div className="page" id="top">
      <a className="skip-link" href="#content">Skip to content</a>

      {/* 1 · Masthead */}
      <header className="masthead">
        <div className="masthead-top">
          <a className="wordmark" href="/" aria-label="TrustSight">TRUST<span>SIGHT</span></a>
          <div className="masthead-actions">
            <AccessibilityMenu />
            <ThemeSwitch dark={dark} toggleTheme={toggleTheme} />
          </div>
        </div>
        <h1>TRUST<span>SIGHT</span></h1>
        <p className="masthead-definition">
          Audits AUR PKGBUILDs before you update: catches careless malice and structural risk,
          and tells you what it can&rsquo;t verify.
        </p>
        <p className="masthead-note">
          Fully open source under MIT. The report points at where to look; it does not replace
          reading the PKGBUILD.
        </p>
        <div className="masthead-install">
          <InstallCommand />
        </div>
        <nav className="masthead-links" aria-label="Primary">
          <a href={DOCS} target="_blank" rel="noreferrer">Docs ↗</a>
          <a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href={SECURITY} target="_blank" rel="noreferrer">Security model ↗</a>
        </nav>
      </header>

      <main id="content">

        {/* 2 · What it is */}
        <section className="section" aria-labelledby="what">
          <div className="section-label">What it is</div>
          <h2 id="what">TrustSight audits AUR package updates before you install them.</h2>
          <div className="prose">
            <p>
              Whenever an installed AUR package has a newer version available, TrustSight clones the
              repository, diffs the new PKGBUILD against the one you have, and runs a published set of
              rules over the change. The output is a report: what changed, which rules fired, and what
              the analysis could not see. The report does not replace reading the diff: every finding
              names the line or URL it fired on, so you know exactly where to look, and you do the
              looking.
            </p>
            <p className="more-bottom">
              Everything runs locally. Nothing is executed (no PKGBUILD, no extracted command) and
              nothing is installed or modified. The report is deterministic: the same diff, the same
              configuration, and the same database produce the same verdict, so re-running a review
              gives the same answer. Verdicts are template-based plain English, e.g.{' '}
              <code>Version bump. modified PKGBUILD. Signals: checksum set to SKIP; novel dependency 'pyfoo' added in depends.</code>
            </p>
          </div>
          <ol className="principle-list">
            {principles.map((item) => (
              <li key={item.strong}><strong>{item.strong}</strong><p>{item.text}</p></li>
            ))}
          </ol>
          <DocsLink href={`${DOCS}/getting-started/quickstart/`}>the quickstart</DocsLink>
        </section>

        {/* 3 · Example output */}
        <section className="section" aria-labelledby="example">
          <div className="section-label">Example output</div>
          <h2 id="example">What a review looks like</h2>
          <div className="prose">
            <p>
              Default output from <code>trustsight review</code> for two outdated packages. The first
              is a routine version bump with updated checksums; the second is a change worth a look
              before you build it. The dependency example shows the mini-cards nested in the output.
              Without flags the report shows the findings and the verdict, no score column.
            </p>
          </div>
          <Plate
             label="Terminal transcript of trustsight review, showing two packages and a dependency summary. some-app-bin, version 3.1.0-1 to 3.1.1-2: only pkgver and sha256sums changed, review the diff before building. sketchy-package, version 0.9.2-1 to 1.0.0-2: the update is not trivial, checksum disabled and source URL classified as unknown."
             lines={[...plateExample.split('\n'), ...plateFlagged.split('\n'), ...plateDeps.split('\n')]}
             caption={<>Current renderer excerpts from <code>trustsight review</code>. A clean verdict means no known signal fired, not that the package is safe.</>}
          />
          <DocsLink href={`${DOCS}/getting-started/reading-a-report/`}>reading a report</DocsLink>
        </section>

        {/* 4 · What it detects */}
        <section className="section" aria-labelledby="detects">
          <div className="section-label">Detection</div>
          <h2 id="detects">What it detects</h2>
          <div className="prose">
            <p>
              The rules are pattern-based and published in full, so the precise statement of what the
              tool catches is the rules reference. The short version, from the README:
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table detects-table">
              <thead><tr><th>Attack / risk</th><th>How TrustSight catches it</th></tr></thead>
              <tbody>
                {detects.map((row) => (
                  <tr key={row.attack}>
                    <th dangerouslySetInnerHTML={{ __html: linkRules(row.attack, RULES) }} />
                    <td dangerouslySetInnerHTML={{ __html: linkRules(row.how, RULES) }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="prose push">
            <p>
              Every finding is reported with the rule that fired and the line or URL it matched, so
              nothing on this page has to be taken on faith. The full catalogue (pattern, severity,
              and measured fire rate for each rule) is in the <a href={RULES} target="_blank" rel="noreferrer">rules reference</a>.
            </p>
          </div>
          <DocsLink href={RULES}>the rules reference</DocsLink>
        </section>

        {/* 5 · Evidence tiers */}
        <section className="section" aria-labelledby="tiers">
          <div className="section-label">Evidence</div>
          <h2 id="tiers">Four kinds of evidence</h2>
          <div className="prose">
            <p>
              Every result reduces to one of four tiers, which says what kind of information a signal
              is. Nothing subtracts: no signal ever lowers a score.
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table tiers-table">
              <thead><tr><th>Tier</th><th>What it is</th><th>Example</th><th>Weight</th></tr></thead>
              <tbody>
                {tiers.map((row) => (
                  <tr key={row.tier}>
                    <th>{row.tier}</th>
                    <td data-label="What it is">{row.what}</td>
                    <td data-label="Example" dangerouslySetInnerHTML={{ __html: linkRules(row.example, RULES) }} />
                    <td data-label="Weight">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="prose push">
            <p>
              A declared checksum or PGP key costs an attacker nothing to claim, so tier D is reported
              at weight zero, for you to check against the file. TrustSight does not verify these
              claims; it reports that the recipe makes them.
            </p>
          </div>
          <DocsLink href={`${DOCS}/reference/evidence-tiers/`}>evidence tiers</DocsLink>
        </section>

        {/* 6 · Calibration */}
        <section className="section" aria-labelledby="calibration">
          <div className="section-label">Calibration</div>
          <h2 id="calibration">The weights are measured, not asserted</h2>
          <div className="prose">
            <p>
              Against the locked 3,739-diff benign corpus, <strong>68.3%</strong> of benign diffs score 0.
              Benign diffs reach a 95th percentile of <strong>35</strong>; the CRITICAL-class corpus has a
              5th percentile of <strong>60</strong>. The 20-point threshold is not the benign p95; it sits
              at the 86.9th percentile, so about 13% of benign diffs land above it. What matters is that
              the two distributions do not overlap.
            </p>
          </div>            <div className="gauge" role="img" aria-label="A score scale from 0 to 100. The threshold sits at 20. Benign diffs reach a 95th percentile of 35. Malicious diffs start at a 5th percentile of 60. The 25-point margin between them is enforced by CI.">
            <div className="gauge__inner">
              <div className="gauge__track">
                <span className="gauge__mark gauge__mark--threshold">
                  <span className="gauge__tick" />
                  <span className="gauge__label">threshold · 20</span>
                </span>
                <span className="gauge__mark gauge__mark--benign">
                  <span className="gauge__tick" />
                  <span className="gauge__label">benign p95 · 35</span>
                </span>
                <span className="gauge__mark gauge__mark--malicious">
                  <span className="gauge__tick" />
                  <span className="gauge__label gauge__label--above">malicious p5 · 60</span>
                </span>
              </div>
              <div className="gauge__ends"><span>0</span><span>100</span></div>
              <div className="gauge__sep">25-point margin, gated</div>
            </div>
          </div>
          <div className="prose push">
            <p>
              The separation is enforced, not described. CI re-measures both distributions against the
              shipped configuration on every push and fails the build if benign p95 is no longer below
              malicious p5. A change that narrows the gap is rejected.
            </p>
          </div>
          <DocsLink href={`${DOCS}/explanation/fire-rates/`}>measured fire rates</DocsLink>
        </section>

        {/* 7 · Testing and configuration */}
        <section className="section" aria-labelledby="testconfig">
          <div className="section-label">Testing and configuration</div>
          <h2 id="testconfig">How the claims are tested, and how you change them</h2>
          <div className="prose">
            <p>
              <strong>Testing.</strong> The test suite covers <strong>1,535 tests across 43 files</strong>.
              CI enforces separate security and calibration gate suites on every push and pull request.
              Among them: CRITICAL recall stays at 100% (every labelled malicious sample must fire the rules
              it is labelled for); the separation gate requires benign p95 to stay below malicious p5; and
              any scoring rule that fires on more than 30% of the benign corpus is demoted to INFO, because
              a rule that fires on a third of ordinary updates is not a signal. The rules are checked
              against their documentation on every test run, so a documented pattern cannot drift from the
              one that runs.
            </p>
            <p>
              <strong>Configuration.</strong> The rules live in <code>~/.config/trustsight/rules.toml</code> and
              are loaded at runtime, so you can change a severity, disable a rule, or add your own pattern.{' '}
              <code>config.toml</code> controls review behaviour:
            </p>
          </div>
          <div className="install-block">
            <pre><code>{CONFIG.map((row, i) => <span key={i}>{renderConfigRow(row)}{'\n'}</span>)}</code></pre>
          </div>
          <DocsLink href={`${DOCS}/reference/configuration/`}>the configuration reference</DocsLink>
        </section>

        {/* 8 · What it cannot see */}
        <section className="section" aria-labelledby="limits">
          <div className="section-label">Limits</div>
          <h2 id="limits">What it cannot see</h2>
          <div className="prose">
            <p>
              A PKGBUILD is a recipe, not a meal. A signed, version-bumped PKGBUILD whose checksum
              matches a backdoored tarball is invisible to this tool. The reasons are structural, and
              they are documented rather than hidden:
            </p>
            {limits.map((item) => (
              <p key={item.strong}><strong dangerouslySetInnerHTML={{ __html: item.strong }} />{' '}<span dangerouslySetInnerHTML={{ __html: item.text }} /></p>
            ))}
          </div>
          <DocsLink href={`${DOCS}/explanation/what-trustsight-cannot-see/`}>what TrustSight cannot see</DocsLink>
        </section>

        {/* 9 · The rules */}
        <section className="section" aria-labelledby="rules">
          <div className="section-label">The rules</div>
          <h2 id="rules">145 documented rules, in six namespaces</h2>
          <div className="prose">
            <p>
              Every shipped rule (its pattern, its severity, and its measured fire rate) is published
              in the <a href={RULES} target="_blank" rel="noreferrer">rules reference</a>. Rules are grouped
              into six namespaces; the categories under each namespace are the kinds of claims its rules make.
            </p>
          </div>
          <div className="ns-list">
            {namespaces.map((ns) => (
              <article className="ns" key={ns.letter}>
                <header className="ns-head">
                  <span className="ns-letter" aria-hidden="true">{ns.letter}</span>
                  <h3>{ns.name}</h3>
                  <span className="ns-count">{ns.count}</span>
                </header>
                <p className="ns-blurb">{ns.blurb}</p>
                <ul className="ns-cats">
                  {ns.cats.map(([name, slug, count]) => (
                    <li key={`${ns.letter}-${name}`}>
                      <a href={`${RULES}${slug.includes('#') ? slug : `${slug}/`}`} target="_blank" rel="noreferrer">{name}{count != null ? <span className="ns-n">{count}</span> : null}</a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="prose push">
            <p>
              Counts are per the generated rules index; the 14 category pages are closed, so every rule
              has exactly one page. <code>trustsight lint-rules</code> checks the shipped rules against
              their documentation on every test run. The rule files themselves are part of the open
              source repository: read a pattern, change a severity, or rebuild the tool, and nothing
              hides behind a binary.
            </p>
          </div>
          <DocsLink href={`${DOCS}/reference/rules/system/`}>the rule system</DocsLink>
        </section>

        {/* 10 · Installation */}
        <section className="section" aria-labelledby="install">
          <div className="section-label">Installation</div>
          <h2 id="install">Install once, review every update after</h2>
          <div className="install-block">
            <InstallCommand />
          </div>
          <ul className="caveats">
            <li><strong>Not on the AUR yet.</strong> <code>aur.archlinux.org/trustsight.git</code> does not exist; build from the PKGBUILD in the repository, which is MIT licensed and fully open source. The PKGBUILD runs the test suite during build, and <code>makepkg -si</code> pulls the dependencies in as proper pacman packages.</li>
            <li>Requires <strong>Python 3.11+</strong> and <strong>Arch Linux</strong>; packages are discovered via <code>pacman</code>.</li>
          </ul>
          <h3 className="sub-heading">The first run: a seed, then your own baseline</h3>
          <div className="prose">
            <p>
              Novelty detection needs a baseline of what is normal in the AUR. On an empty database
              every URL looks first-seen and every maintainer looks new, which turns the novelty signal
              into noise. So the tool ships a seed of prior knowledge built from the AUR git mirror:
              about 180,000 normalised source URLs and salted hashes of maintainer identities. It is
              published as a signed release asset rather than shipped inside the package, because the
              AUR is exactly the channel under review. The first time you run{' '}
              <code>trustsight review</code>, the tool downloads the seed and imports it only after its
              ed25519 signature verifies against a key pinned in the package. Offline, the attempt is
              skipped and the run starts cold: the honest fallback for a tool that refuses unverified data.
            </p>
            <p>
              Installing now is what makes the seed useful. Every review you run records observations in
              your local database, and novelty signals scale with that history: the maturity factor is{' '}
              <code>observation_count / 50</code>, so a package reaches full novelty weight after about 50
              analyses. The seed supplies the bootstrap: it recognises about 86% of the source URLs in a
              package&rsquo;s most recent update, and your own runs take over as soon as they outnumber it.
              Install today, review the next update, and by the time a real anomaly shows up the tool has
              already seen what normal looks like for your package set.
            </p>
          </div>
          <DocsLink href={`${DOCS}/getting-started/installation/`}>installing TrustSight</DocsLink>
        </section>

        {/* 11 · FAQ */}
        <section className="section" aria-labelledby="faq">
          <div className="section-label">FAQ</div>
          <h2 id="faq">Frequently asked questions</h2>
          <div className="faq-list">
            {faqs.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
          <DocsLink href={SECURITY}>the security model</DocsLink>
        </section>

      </main>

      {/* 12 · Colophon */}
      <footer className="colophon" aria-label="Colophon">
        <div>
          <h2>Colophon</h2>
          <p><a href={GITHUB} target="_blank" rel="noreferrer">MIT licensed</a>, fully open source. Built by <strong>Emiliano Gandini</strong>.</p>
          <p>Every rule pattern, default, and the seed&rsquo;s verification key are published in the repository. There is no closed component; the reviewer can be audited the same way it audits packages.</p>
          <p>Security contact: <a href="mailto:emiliano.gandini@protonmail.com">emiliano.gandini@protonmail.com</a></p>
          <p className="pgp">PGP&nbsp;F759D6D4 9B0A395A B922414A 5CC3B4C5 0D37E793</p>
        </div>
        <div>
          <h2>Sources</h2>
          <ul>
            <li><a href={DOCS} target="_blank" rel="noreferrer">Documentation ↗</a></li>
            <li><a href={SECURITY} target="_blank" rel="noreferrer">Security model ↗</a></li>
            <li><a href={RULES} target="_blank" rel="noreferrer">Rules reference ↗</a></li>
            <li><a href={`${DOCS}/changelog/`} target="_blank" rel="noreferrer">Changelog ↗</a></li>
            <li><a href={GITHUB} target="_blank" rel="noreferrer">Source on GitHub ↗</a></li>
          </ul>
        </div>
        <p className="colophon-note">
          TrustSight reports what changed, what fired, and what it could not see, and it never calls an
          incomplete analysis clean.
        </p>
      </footer>
    </div>
  )
}
