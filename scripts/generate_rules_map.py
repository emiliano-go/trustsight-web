"""Generate ``src/rules.js``: the rule id to docs-anchor map the site links by.

Every rule id the site prints is a link into the rules reference, which
means this map has to agree with the catalog that reference is built from.
It was maintained by hand behind a comment claiming it was generated, and
it drifted: 33 of 184 ids were missing, so the whole W series, sixteen
crossfire rules and eight R-series rules rendered without a link.

The catalog is `trustsight.categories.RULE_CATEGORIES` plus the
declared-practice ids in `trustsight.scoring.DECLARED_REASONS`, and a
rule's page is its category's `doc_page`, so the map is derivable and
nothing here needs to be remembered.

Two shapes are not a plain `<page>/#<id>` anchor and are declared below:
the declared-practice series shares one section, and a few rules are
documented under a `-rule` suffix on their own page.

    python scripts/generate_rules_map.py            # write if changed
    python scripts/generate_rules_map.py --check    # exit 1 on drift

Needs the trustsight package importable: it is found beside this checkout
(../trustsight/src) or through TRUSTSIGHT_SRC.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "rules.js"
FIGS_OUT = ROOT / "src" / "figures.generated.json"

#: Ids documented under a `<id>-rule` anchor rather than a bare `<id>`,
#: because `system.md` already owns the bare anchor as a cross-reference
#: stub. Only the fragment is special: the *page* always comes from the
#: catalog, because hardcoding it here is how this map gets a rule's page
#: wrong when the rule is recategorised. R075 moved to `count-based` and a
#: hand-written page would still be pointing at `naming-and-dependency`.
_RULE_SUFFIX_ANCHORS = {"r074", "r075"}
_DECLARED_ANCHOR = "system/#declared-practice"


def _import_trustsight():
    candidates = [os.environ.get("TRUSTSIGHT_SRC"), ROOT.parent / "trustsight" / "src"]
    for candidate in candidates:
        if candidate and Path(candidate).is_dir():
            sys.path.insert(0, str(candidate))
            break
    try:
        from trustsight.categories import RULE_CATEGORIES, category_of
        from trustsight.scoring import DECLARED_REASONS
    except ImportError as exc:  # pragma: no cover - environment problem
        raise SystemExit(
            "cannot import trustsight; put the checkout beside this one or "
            f"set TRUSTSIGHT_SRC to its src/ directory ({exc})"
        ) from exc
    return RULE_CATEGORIES, category_of, DECLARED_REASONS


MARK_START = "/* rules-map:start */"
MARK_END = "/* rules-map:end */"


def build_block() -> str:
    """The generated map, without the hand-written helpers around it."""
    rule_categories, category_of, declared = _import_trustsight()

    anchors: dict[str, str] = {}
    for rule_id in rule_categories:
        key = rule_id.lower()
        page = category_of(rule_id).doc_page.removesuffix(".md")
        fragment = f"{key}-rule" if key in _RULE_SUFFIX_ANCHORS else key
        anchors[key] = f"{page}/#{fragment}"
    for rule_id in declared:
        anchors[rule_id.lower()] = _DECLARED_ANCHOR

    body = "\n".join(f"  {key}: '{anchors[key]}'," for key in sorted(anchors))
    return f"export const RULE_PAGES = {{\n{body}\n}}"


def render(current: str) -> str:
    """*current* with the generated block substituted in place.

    Only the marked region is rewritten. `ruleHref`, `rangeIds` and
    `linkRules` are hand-written and live outside it; an earlier version of
    this script emitted the whole file and silently dropped them, which the
    bundler caught as a missing export.
    """
    if MARK_START not in current or MARK_END not in current:
        raise SystemExit(
            f"{OUT.relative_to(ROOT)} has no rules-map markers; add\n"
            f"  {MARK_START}\n  {MARK_END}\n"
            "around the generated map."
        )
    head, _, rest = current.partition(MARK_START)
    _, _, tail = rest.partition(MARK_END)
    return f"{head}{MARK_START}\n{build_block()}\n{MARK_END}{tail}"


def build_figures() -> dict:
    """Every published number the site shows, derived from the catalog.

    Rule and category counts come from ``trustsight.categories``; the seed,
    suite and calibration figures come from the trustSight repository's
    ``tests/fixtures/published-figures.json``, which its own tests keep
    measured.  Nothing here is hand-typed, so the site cannot quote a number
    the tool does not hold.
    """
    rule_categories, category_of, declared = _import_trustsight()
    import trustsight

    repo_root = Path(trustsight.__file__).resolve().parents[2]
    published = json.loads(
        (repo_root / "tests" / "fixtures" / "published-figures.json").read_text()
    )

    titles = {category.value: category.title for category in set(rule_categories.values())}

    def _by_slug(letters: str) -> dict[str, int]:
        counts: dict[str, int] = {}
        for rule_id in rule_categories:
            if rule_id[0].upper() in letters:
                slug = category_of(rule_id).doc_page.removesuffix(".md")
                counts[slug] = counts.get(slug, 0) + 1
        return counts

    def _namespace(letters: str, unit: str = "rules") -> dict:
        counts = _by_slug(letters)
        total = sum(counts.values())
        return {
            "count_label": f"{total} {unit}",
            "total": total,
            "categories": [
                [titles[slug], slug, count]
                for slug, count in sorted(counts.items(), key=lambda kv: -kv[1])
            ],
        }

    namespaces = {
        "detection": _namespace("HR"),
        "structural": _namespace("C"),
        "dependency_graph": _namespace("D"),
        "sabotage": _namespace("S"),
        "crossfire": _namespace("X"),
        "unverifiable": _namespace("W", unit="findings, weight 0"),
    }
    namespaces["declared_practice"] = {
        "count_label": f"{len(declared)} findings, weight 0",
        "total": len(declared),
        "categories": [],
    }

    return {
        "namespaces": namespaces,
        "total_rules": len(rule_categories) + len(declared),
        "category_pages": len(
            {category.doc_page for category in rule_categories.values()}
        ),
        "tests": published["tests"],
        "seed": published["seed"],
        "calibration": published["calibration"],
    }


def _render_figures() -> str:
    return json.dumps(build_figures(), indent=2) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true",
                        help="fail when the committed file is stale")
    args = parser.parse_args(argv)

    current = OUT.read_text() if OUT.exists() else ""
    generated = render(current)
    figures = _render_figures()

    if args.check:
        rules_stale = current != generated
        figures_stale = not FIGS_OUT.exists() or FIGS_OUT.read_text() != figures
        if rules_stale:
            have = set(re.findall(r"^\s*([a-z]\d{3}):", current, re.M))
            want = set(re.findall(r"^\s*([a-z]\d{3}):", generated, re.M))
            missing = sorted(want - have)
            stale = sorted(have - want)
            print(f"{OUT.relative_to(ROOT)} is out of date.", file=sys.stderr)
            if missing:
                print(f"  missing rules: {', '.join(missing)}", file=sys.stderr)
            if stale:
                print(f"  no longer shipped: {', '.join(stale)}", file=sys.stderr)
        if figures_stale:
            print(f"{FIGS_OUT.relative_to(ROOT)} is out of date.", file=sys.stderr)
        if rules_stale or figures_stale:
            print("  run: python scripts/generate_rules_map.py", file=sys.stderr)
            return 1
        count = len(re.findall(r"^\s*[a-z]\d{3}:", generated, re.M))
        print(f"rules.js and figures.generated.json are current ({count} rules)")
        return 0

    changed = []
    if current != generated:
        OUT.write_text(generated)
        changed.append(OUT.relative_to(ROOT))
    if not FIGS_OUT.exists() or FIGS_OUT.read_text() != figures:
        FIGS_OUT.write_text(figures)
        changed.append(FIGS_OUT.relative_to(ROOT))
    if not changed:
        print("rules.js and figures.generated.json already current")
        return 0
    count = len(re.findall(r"^\s*[a-z]\d{3}:", generated, re.M))
    print(f"wrote {', '.join(str(p) for p in changed)} ({count} rules)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
