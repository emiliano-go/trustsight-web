"""Generate the SEO <head> block via seoslug and write it into index.html.

Ported from the dbwarden site's scripts/generate_seo.py: the SEO payload
(title, description, canonical, robots, Open Graph, Twitter Cards, and
JSON-LD) is produced deterministically by seoslug, so the committed head
always matches what CI regenerates.

Idempotent: the block between the seoslug markers in index.html is
rewritten only when the generated payload differs. `--check` fails when
the committed file is stale, which CI runs as a drift gate.

    python scripts/generate_seo.py            # write if changed
    python scripts/generate_seo.py --check    # exit 1 on drift

Requires seoslug (pip install "seoslug>=2.0.1").
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from seoslug import (
        SEOConfig,
        URLPolicy,
        SEOEntity,
        SEOOverrides,
        OGImage,
        Robots,
        build_seo_payload,
    )
    SEOSLUG_AVAILABLE = True
except ModuleNotFoundError:
    SEOSLUG_AVAILABLE = False

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

SITE_URL = "https://trustsight.org"
SITE_NAME = "TrustSight"
TITLE = "Audits AUR PKGBUILDs before you update"
DESCRIPTION = (
    "TrustSight audits AUR PKGBUILDs before you update; it reports structural "
    "risk, evidence, and incomplete analysis without claiming safety."
)
# The OG image is the repo's banner (docs/assets/images/trustsight-banner.png),
# served from /og-image.png; keep width/height in sync with that file.
OG_IMAGE_URL = f"{SITE_URL}/og-image.png"
OG_IMAGE_WIDTH = 2806
OG_IMAGE_HEIGHT = 1582
OG_IMAGE_ALT = "TrustSight | Audits AUR PKGBUILDs before you update"

# The page is a software product, so the JSON-LD is a SoftwareApplication
# rather than seoslug's default WebPage for entity_type "home".
SCHEMA_JSONLD = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_NAME,
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Arch Linux",
    "description": (
        "Audits AUR PKGBUILDs before you update: catches careless malice and "
        "structural risk, and tells you what it cannot verify."
    ),
    "url": SITE_URL,
    "image": OG_IMAGE_URL,
    "sameAs": ["https://github.com/emiliano-go/trustsight"],
    "isAccessibleForFree": True,
    "codeRepository": "https://github.com/emiliano-go/trustsight",
    "license": "https://github.com/emiliano-go/trustsight/blob/master/LICENSE",
    "author": {"@type": "Person", "name": "Emiliano Gandini"},
}

MARK_START = "<!-- seoslug:start -->"
MARK_END = "<!-- seoslug:end -->"


def build_block() -> str:
    og_image = OGImage(
        url=OG_IMAGE_URL,
        width=OG_IMAGE_WIDTH,
        height=OG_IMAGE_HEIGHT,
        alt=OG_IMAGE_ALT,
    )
    config = SEOConfig(
        canonical_host="trustsight.org",
        public_base_url=SITE_URL,
        url_policy=URLPolicy(
            enforce_https=True,
            lowercase_paths=True,
            trailing_slash="always",
        ),
        site_name=SITE_NAME,
        title_template=f"{SITE_NAME} | {{title}}",
        default_og_image=og_image,
        locale="en_US",
        publisher_name="Emiliano Gandini",
        publisher_logo=OG_IMAGE_URL,
        default_robots=Robots(index=True, follow=True, max_image_preview="large"),
        emit_warnings=True,
    )
    entity = SEOEntity(
        entity_type="home",
        title=TITLE,
        excerpt=DESCRIPTION,
        status="published",
    )
    overrides = SEOOverrides(
        robots=Robots(index=True, follow=True, max_image_preview="large"),
        schema_jsonld=SCHEMA_JSONLD,
    )
    payload = build_seo_payload(entity, "/", config, overrides)
    return payload.render_html().strip()


def indent_block(block: str, spaces: int = 4) -> str:
    pad = " " * spaces
    return "\n".join(pad + line if line else line for line in block.split("\n"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the SEO head block via seoslug")
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail (exit 1) if index.html is stale instead of writing",
    )
    args = parser.parse_args()

    # Cloudflare Pages' build sandbox has no seoslug and cannot pip install it
    # (PEP 668). CI installs seoslug and runs this script as the drift gate, so
    # on an environment without the module, --check degrades to a warning: the
    # committed head is still verified on every CI run.
    if not SEOSLUG_AVAILABLE:
        if args.check:
            print(
                "generate-seo: WARN - seoslug not installed; skipping drift check "
                "here (CI runs it with seoslug installed)."
            )
            return 0
        print("generate-seo: seoslug is required to regenerate the SEO block (pip install \"seoslug>=2.0.1\")")
        return 1

    html = INDEX.read_text(encoding="utf-8")
    if MARK_START not in html or MARK_END not in html:
        print(f"generate-seo: seoslug markers missing in {INDEX.relative_to(ROOT)}")
        return 1

    head, _, rest = html.partition(MARK_START)
    _, _, tail = rest.partition(MARK_END)
    block = indent_block(build_block())
    new_html = f"{head}{MARK_START}\n{block}\n    {MARK_END}{tail}"

    if new_html == html:
        print("generate-seo: OK (unchanged)")
        return 0

    if args.check:
        print(
            "generate-seo: DRIFT - index.html is stale. "
            "Run `python scripts/generate_seo.py` and commit the result."
        )
        return 1

    INDEX.write_text(new_html, encoding="utf-8")
    print(f"generate-seo: wrote {INDEX.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
