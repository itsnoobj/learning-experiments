#!/usr/bin/env python3
"""Convert a chapter markdown to a podcast-style MP3 using Kokoro-82M TTS.

Uses a narrator voice for analysis/framework sections and a storyteller voice
for narrative sections (The Story, The Contrast), creating a natural podcast feel.
"""

import argparse
import re
import sys
from pathlib import Path

VOICES = {
    "narrator": "af_bella",      # Clear, neutral — easy to follow globally
    "storyteller": "am_adam",    # Calm, warm male — narrative sections
}
SAMPLE_RATE = 24000


def parse_chapter(md_path: str) -> list[dict]:
    """Parse chapter markdown into sections with roles."""
    text = Path(md_path).read_text()

    lines = text.split("\n")
    title = ""
    content_lines = []
    skip_header = True
    for line in lines:
        if skip_header and line.startswith("# "):
            title = line.lstrip("# ").strip()
            continue
        if skip_header and line.startswith("> Part"):
            continue
        skip_header = False
        content_lines.append(line)

    content = "\n".join(content_lines)

    # Split by ## sections
    sections = re.split(r"^## (.+)$", content, flags=re.MULTILINE)

    # sections[0] is content before first ##, then alternating title/content
    story_sections = {"The Story", "The Contrast"}
    parsed = []

    # Start with the chapter title as opener
    if title:
        parsed.append({"title": "Opening", "body": title, "role": "narrator"})

    for i in range(1, len(sections), 2):
        title = sections[i].strip()
        body = sections[i + 1].strip() if i + 1 < len(sections) else ""

        if not body:
            continue

        # Clean markdown formatting
        body = re.sub(r"\*\*(.+?)\*\*", r"\1", body)  # bold
        body = re.sub(r"\*(.+?)\*", r"\1", body)      # italic
        body = re.sub(r"^[-•] ", "", body, flags=re.MULTILINE)  # bullets
        body = re.sub(r"^\d+\. ", "", body, flags=re.MULTILINE)  # numbered
        body = re.sub(r"^→ .+$", "", body, flags=re.MULTILINE)  # connections links
        body = re.sub(r"---", "", body)  # hr
        body = re.sub(r"\n{3,}", "\n\n", body)  # excess newlines
        body = body.strip()

        if not body:
            continue

        role = "storyteller" if title in story_sections else "narrator"
        parsed.append({"title": title, "body": body, "role": role})

    return parsed


def generate_audio(sections: list[dict], pause_sec: float = 1.0):
    """Generate podcast audio from parsed sections."""
    import numpy as np
    from kokoro import KPipeline

    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    pause = np.zeros(int(SAMPLE_RATE * pause_sec), dtype=np.float32)
    section_pause = np.zeros(int(SAMPLE_RATE * 1.5), dtype=np.float32)
    segments = []

    for sec in sections:
        voice = VOICES[sec["role"]]
        paragraphs = [p.strip() for p in sec["body"].split("\n\n") if p.strip()]
        print(f"\n  [{sec['title']}] voice={voice}")

        for j, para in enumerate(paragraphs):
            print(f"    paragraph {j+1}/{len(paragraphs)}: {para[:50]}...")
            for _, _, audio in pipeline(para, voice=voice):
                segments.append(audio)
            segments.append(pause)

        segments.append(section_pause)

    return np.concatenate(segments)


def save_mp3(audio, output_path: str, bitrate: str = "192k"):
    """Save numpy audio array as MP3."""
    import soundfile as sf
    from pydub import AudioSegment

    tmp_wav = Path(output_path).with_suffix(".wav")
    sf.write(str(tmp_wav), audio, SAMPLE_RATE)
    AudioSegment.from_wav(str(tmp_wav)).export(output_path, format="mp3", bitrate=bitrate)
    tmp_wav.unlink()
    print(f"\nSaved: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Convert chapter markdown to podcast MP3")
    parser.add_argument("chapter", help="Path to chapter markdown file")
    parser.add_argument("-o", "--output", help="Output MP3 path (default: <chapter_name>.mp3)")
    parser.add_argument("--narrator", default=VOICES["narrator"], help=f"Narrator voice (default: {VOICES['narrator']})")
    parser.add_argument("--storyteller", default=VOICES["storyteller"], help=f"Storyteller voice (default: {VOICES['storyteller']})")
    parser.add_argument("--bitrate", default="192k", help="MP3 bitrate (default: 192k)")
    parser.add_argument("--pause", type=float, default=1.0, help="Pause between paragraphs in seconds")
    parser.add_argument("--list-voices", action="store_true", help="List available voices")
    args = parser.parse_args()

    if args.list_voices:
        print("Female: af_heart, af_bella, af_nicole, af_aoede, af_kore")
        print("Male:   am_adam, am_michael, am_fenrir, am_puck, am_echo")
        return

    chapter_path = Path(args.chapter)
    if not chapter_path.exists():
        sys.exit(f"File not found: {chapter_path}")

    VOICES["narrator"] = args.narrator
    VOICES["storyteller"] = args.storyteller
    output = args.output or str(chapter_path.with_suffix(".mp3"))

    print(f"Parsing: {chapter_path}")
    sections = parse_chapter(str(chapter_path))
    print(f"  {len(sections)} sections found")
    for s in sections:
        print(f"    • {s['title']} ({s['role']})")

    print(f"\nGenerating audio...")
    print(f"  Narrator:    {VOICES['narrator']}")
    print(f"  Storyteller: {VOICES['storyteller']}")
    audio = generate_audio(sections, pause_sec=args.pause)
    save_mp3(audio, output, bitrate=args.bitrate)


if __name__ == "__main__":
    main()
