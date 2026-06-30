#!/usr/bin/env python3
"""Convert a chapter JSON to markdown format suitable for chapter_to_podcast.py."""
import json, sys
from pathlib import Path

def convert(json_path: str) -> str:
    data = json.loads(Path(json_path).read_text())
    lines = [f"# {data['title']}\n", f"> Part {data['part']} — Section {data['section']}\n", "---\n"]
    section_titles = {
        'situation': 'The Situation', 'story': 'The Story', 'contrast': 'The Contrast',
        'principle': 'The Principle', 'psychology': 'Why It Happens',
        'trap': 'The Trap', 'move': 'The Move'
    }
    for sec in data['sections']:
        title = sec.get('title', section_titles.get(sec['type'], sec['type'].title()))
        lines.append(f"\n## {title}\n\n{sec['content']}\n")
    return "\n".join(lines)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python json_to_md.py <chapter.json> [output.md]")
        sys.exit(1)
    md = convert(sys.argv[1])
    out = sys.argv[2] if len(sys.argv) > 2 else sys.argv[1].replace('.json', '.md')
    Path(out).write_text(md)
    print(f"✓ {out}")
