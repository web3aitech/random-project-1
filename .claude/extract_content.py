#!/usr/bin/env python3
"""Extract main visible content from SingleFile source exports."""
import re, sys, os

SRC = "source/official-current-website"

def extract(path):
    h = open(path, encoding="utf-8", errors="ignore").read()
    title = re.search(r"<title>(.*?)</title>", h, re.S)
    # drop scripts/styles/svg
    h = re.sub(r"<script.*?</script>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<style.*?</style>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<svg.*?</svg>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<!--.*?-->", " ", h, flags=re.S)
    # tags -> newlines so list items / headings break
    h = re.sub(r"<br\s*/?>", "\n", h, flags=re.I)
    h = re.sub(r"</(p|div|li|h[1-6]|span|tr)>", "\n", h, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", h)
    text = (text.replace("&nbsp;", " ").replace("&amp;", "&")
            .replace("&rsquo;", "’").replace("&ldquo;", "“")
            .replace("&rdquo;", "”").replace("&reg;", "®")
            .replace("&trade;", "™").replace("&#39;", "'"))
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    lines = [l.strip() for l in text.split("\n")]
    lines = [l for l in lines if l and len(l) > 1]
    return (title.group(1).strip() if title else ""), lines

# Map: page slug -> source filename (one chosen per page)
MAP = {
    "carpet-cleaning": "CARPET CLEANING ｜ Renue Home Site (6_30_2026 1：38：28 AM).html",
    "tile-grout-restoration": "TILE & GROUT RESTORATION ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "commercial-kitchen-cleaning-services": "KITCHEN CLEANING ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "marble-natural-stone-restoration": "MARBLE & STONE RESTORATION. ｜ Renue Home Site (6_30_2026 1：38：28 AM).html",
    "professional-chandelier-cleaning-services": "CHANDELIER CLEANING ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "mattress-tv-appliance-recycling-replacement": "MATTRESS, TV & SMALL APPLIANCES REPLACEM ｜ Renue Home Site (6_30_2026 1：39：20 AM).html",
    "hospitality-exterior-power-washing": "POWER WASHING ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "ptac-vtac-cleaning-services": "PTAC & VTAC CLEANING SERVICES ｜ Renue Home Site (6_30_2026 1：39：04 AM).html",
    "advanced-odor-removal-services": "STAIN & ODOR REMOVAL ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "otel-hygiene-upholstery-cleaning": "DRAPES & UPHOLSTERY DEEP CLEANING SERVIC ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "vinyl-tile-restoration-services": "VINYL TILE RESTORATION ｜ Renue Home Site (6_30_2026 1：39：08 AM).html",
    "advanced-electrostatic-disinfection": "DISINFECTING ELECTROSTATIC SPRAYING ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "trash-laundry-chute-cleaning": "LAUNDRY AND TRASH CHUTE CLEANING ｜ Renue Home Site (6_30_2026 1：38：49 AM).html",
    "escalator-cleaning-services": "ESCALATOR CLEANING ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
    "hospitality-room-treatment-solutions": "SMOKING, PET & COOKING ROOM TREATMENT ｜ Renue Home Site (6_30_2026 1：38：41 AM).html",
    "flood-clean-up-services": "Flood Clean-Up ｜ Renue Home Site (6_30_2026 1：39：22 AM).html",
    "light-fixture-cleaning-services": "Light Fixtures Cleaning ｜ Renue Home Site (6_30_2026 1：38：29 AM).html",
}

def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    if slug:
        slug = sys.argv[1]
        path = os.path.join(SRC, MAP[slug])
        _, lines = extract(path)
        for l in lines:
            print(l)
        return
    for slug, fn in MAP.items():
        path = os.path.join(SRC, fn)
        title, lines = extract(path)
        print("\n" + "=" * 80)
        print(f"## SLUG: {slug}  | TITLE: {title}")
        print("=" * 80)
        for l in lines:
            print(l)

if __name__ == "__main__":
    main()
