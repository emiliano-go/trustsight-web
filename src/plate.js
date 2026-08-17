// Current renderer excerpts from the TrustSight quickstart: default review
// output has no score column, and the dependency panel is shown separately.
// Captured from the current docs/source renderer with ANSI codes stripped.

export const plateExample = `╭───────────────────────────── some-app-bin ─────────────────────────────╮
│  Version  3.1.0-1 → 3.1.1-2                                            │
│  Status   Only pkgver and sha256sums changed. Review the diff before   │
│           building.                                                    │
│  Changed  pkgver 3.1.0-1 -> 3.1.1-2                                    │
│           checksums added or changed                                   │
╰────────────────────────────────────────────────────────────────────────╯`

export const plateFlagged = `╭─────────────────────────── sketchy-package ────────────────────────────╮
│  Version  0.9.2-1 → 1.0.0-2                                            │
│  Status   The update is not trivial. Review it.                        │
│           PKGBUILD line 12  Checksum Disabled: sha256sums=('SKIP')     │
│           [R004]                                                       │
│           Source URL classified as unknown                             │
│           (https://sketchy-cdn.example.com/p.tar.gz) [SOURCE_BUCKET]   │
│  Changed  pkgver 0.9.2-1 -> 1.0.0-2                                    │
│           source host added: sketchy-cdn.example.com                   │
╰────────────────────────────────────────────────────────────────────────╯`

export const plateDeps = `╭──────────────────── some-trusted-tool ─────────────────────╮
│  Version       2.4.1-1 → 2.4.2-2                           │
│  Status        The update is not trivial. Review it.       │
│                PKGBUILD line 17  Install hook performs a   │
│                privileged operation [R062]                 │
│  Changed       pkgver 2.4.1-1 -> 2.4.2-2                   │
│                                                            │
│  Dependencies                                              │
│                ╭──────────── L1  libhelper ─────────────╮  │
│                │ Findings 2                             │  │
│                ╰────────────────────────────────────────╯  │
╰────────────────────────────────────────────────────────────╯
1 package(s) needing update and reviewed out of 1 installed
Tip: those dependencies are summarised, not reviewed.
\`trustsight review --deps\` reviews each as a package in its
own right and names what requires it; add \`--depth n\` for
deeper levels.`
