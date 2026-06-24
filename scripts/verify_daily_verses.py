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
    {"book": "Matthew", "chapter": "5", "verse": "8", "theme": "purity", "display": "Matthew 5:8"},
    {"book": "John", "chapter": "3", "verse": "16", "theme": "love", "display": "John 3:16"},
    {"book": "Psalms", "chapter": "22", "verse": "1", "theme": "trust", "display": "Psalm 23:1"},
    {"book": "Romans", "chapter": "8", "verse": "28", "theme": "providence", "display": "Romans 8:28"},
    {"book": "1 John", "chapter": "4", "verse": "8", "theme": "love", "display": "1 John 4:8"},
    {"book": "Philippians", "chapter": "4", "verse": "13", "theme": "strength", "display": "Philippians 4:13"},
    {"book": "Isaias", "chapter": "40", "verse": "31", "theme": "hope", "display": "Isaiah 40:31"},
    {"book": "Proverbs", "chapter": "3", "verse": "5", "theme": "trust", "display": "Proverbs 3:5"},
    {"book": "Matthew", "chapter": "6", "verse": "33", "theme": "priorities", "display": "Matthew 6:33"},
    {"book": "James", "chapter": "1", "verse": "6", "theme": "wisdom", "display": "James 1:5"},
    {"book": "Ephesians", "chapter": "2", "verse": "8", "theme": "grace", "display": "Ephesians 2:8"},
    {"book": "Hebrews", "chapter": "11", "verse": "1", "theme": "faith", "display": "Hebrews 11:1"},
    {"book": "Jeremias", "chapter": "29", "verse": "11", "theme": "hope", "display": "Jeremiah 29:11"},
    {"book": "Matthew", "chapter": "11", "verse": "28", "theme": "rest", "display": "Matthew 11:28"},
    {"book": "John", "chapter": "14", "verse": "6", "theme": "truth", "display": "John 14:6"},
]


def main() -> int:
    with open(ROOT / "EntireBible-DR.json", encoding="utf-8") as f:
        bible = json.load(f)

    failures = 0
    for v in MEANINGFUL_VERSES:
        text = bible.get(v["book"], {}).get(v["chapter"], {}).get(v["verse"])
        # DR coordinates used to look up text vs. the modern label shown to users.
        lookup = f'{v["book"]} {v["chapter"]}:{v["verse"]}'
        display = v.get("display", lookup)
        if not text:
            print(f"MISSING  {lookup}  ({v['theme']})")
            failures += 1
        else:
            clean = text.replace("*", "").strip()
            print(f"OK  {display:16} <- {lookup:18} ({v['theme']:11}) {clean[:50]}")

    print()
    if failures:
        print(f"FAILED: {failures} verse(s) do not resolve.")
        return 1
    print(f"All {len(MEANINGFUL_VERSES)} daily verses resolve correctly.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
