#!/usr/bin/env python3
"""Verify that every Verse of the Day reference resolves against the bundled
Douay-Rheims dataset (EntireBible-DR.json).

The DR data uses Vulgate book names/numbering and has a couple of known
quirks (e.g. 1 Corinthians 13 is mis-keyed, James is off-by-one), so the
curated daily-verse list is hand-mapped to references that resolve correctly.
This script guards against regressions: it exits non-zero if any verse is
missing, so it can run in CI.

Usage:  python scripts/verify_daily_verses.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Keep in sync with MEANINGFUL_VERSES in app.py.
MEANINGFUL_VERSES = [
    {"book": "Matthew", "chapter": "5", "verse": "8", "theme": "purity"},
    {"book": "John", "chapter": "3", "verse": "16", "theme": "love"},
    {"book": "Psalms", "chapter": "22", "verse": "1", "theme": "trust"},
    {"book": "Romans", "chapter": "8", "verse": "28", "theme": "providence"},
    {"book": "1 John", "chapter": "4", "verse": "8", "theme": "love"},
    {"book": "Philippians", "chapter": "4", "verse": "13", "theme": "strength"},
    {"book": "Isaias", "chapter": "40", "verse": "31", "theme": "hope"},
    {"book": "Proverbs", "chapter": "3", "verse": "5", "theme": "trust"},
    {"book": "Matthew", "chapter": "6", "verse": "33", "theme": "priorities"},
    {"book": "James", "chapter": "1", "verse": "6", "theme": "wisdom"},
    {"book": "Ephesians", "chapter": "2", "verse": "8", "theme": "grace"},
    {"book": "Hebrews", "chapter": "11", "verse": "1", "theme": "faith"},
    {"book": "Jeremias", "chapter": "29", "verse": "11", "theme": "hope"},
    {"book": "Matthew", "chapter": "11", "verse": "28", "theme": "rest"},
    {"book": "John", "chapter": "14", "verse": "6", "theme": "truth"},
]


def main() -> int:
    with open(ROOT / "EntireBible-DR.json", encoding="utf-8") as f:
        bible = json.load(f)

    failures = 0
    for v in MEANINGFUL_VERSES:
        text = bible.get(v["book"], {}).get(v["chapter"], {}).get(v["verse"])
        ref = f'{v["book"]} {v["chapter"]}:{v["verse"]}'
        if not text:
            print(f"MISSING  {ref}  ({v['theme']})")
            failures += 1
        else:
            clean = text.replace("*", "").strip()
            print(f"OK       {ref:18} ({v['theme']:11}) {clean[:60]}")

    print()
    if failures:
        print(f"FAILED: {failures} verse(s) do not resolve.")
        return 1
    print(f"All {len(MEANINGFUL_VERSES)} daily verses resolve correctly.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
