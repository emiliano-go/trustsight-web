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

from seoslug import (
    SEOConfig,
    URLPolicy,
    SEOEntity,
    SEOOverrides,
    OGImage,
    Robots,
    build_seo_payload,
)

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

SITE_URL = "https://trustsight.org"
SITE_NAME = "TrustSight"
TITLE = "Audits AUR PKGBUILDs before you update"
DESCRIPTION = (
    "TrustSight audits AUR PKGBUILDs before you update: it catches careless "
    "malice and structural risk, reports evidence, and never calls an "
    "incomplete analysis clean."
)
# The OG image is the repo's banner (docs/assets/images/trustsight-banner.png),
# served from /og-image.png; keep width/height in sync with that file.
OG_IMAGE = OGImage(
    url=f"{SITE_URL}/og-image.png",
    width=2806,
    height=1582,
    alt="TrustSight | Audits AUR PKGBUILDs before you update",
)

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
    "image": f"{SITE_URL}/og-image.png",
    "sameAs": ["https://github.com/emiliano-go/trustsight"],
    "isAccessibleForFree": True,
    "codeRepository": "https://github.com/emiliano-go/trustsight",
    "license": "https://github.com/emiliano-go/trustsight/blob/main/LICENSE",
    "author": {"@type": "Person", "name": "Emiliano Gandini"},
}

SEO_CONFIG = SEOConfig(
    canonical_host="trustsight.org",
    public_base_url=SITE_URL,
    url_policy=URLPolicy(
        enforce_https=True,
        lowercase_paths=True,
        trailing_slash="always",
    ),
    site_name=SITE_NAME,
    title_template=f"{SITE_NAME} | {{title}}",
    default_og_image=OG_IMAGE,
    locale="en_US",
    publisher_name="Emiliano Gandini",
    publisher_logo=f"{SITE_URL}/og-image.png",
    default_robots=Robots(index=True, follow=True, max_image_preview="large"),
    emit_warnings=True,
)

MARK_START = "<!-- seoslug:start -->"
MARK_END = "<!-- seoslug:end -->"


def build_block() -> str:
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
    payload = build_seo_payload(entity, "/", SEO_CONFIG, overrides)
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
