# Audio Approach

> Every chapter = a readable article + a listenable podcast. Same source, two formats.

## How It Works

```
chapter.md → chapter_to_podcast.py → chapter.mp3
```

One markdown file is the single source of truth. The script reads it, assigns voices by section type, and produces a podcast-style MP3. No rewriting, no AI summarizing — just the chapter read aloud with two voices.

## Voice Design

| Role | Voice | Used For |
|------|-------|----------|
| Narrator | `af_bella` | Situation, Principle, Psychology, Traps, Moves, Reflection |
| Storyteller | `am_adam` | The Story, The Contrast |

**Why two voices:**
- Creates natural rhythm — the listener's brain distinguishes "lesson" from "narrative"
- Feels like a podcast with a host and a storyteller, not a monotone audiobook
- Signals section transitions without needing "and now, the principle is..."

**Voice selection criteria:**
- Neutral, clear English — easy to follow for Indian, Asian, European, US listeners
- No strong regional accent
- Conversational pace, not robotic or overly dramatic

## Structure of the Audio

1. **Title** — chapter question read aloud (sets context)
2. **The Situation** — narrator, conversational
3. **The Story** — storyteller, slightly slower, narrative mode
4. **The Contrast** — storyteller, brief
5. **The Principle** — narrator, punchy
6. **Why It Happens** — narrator, explanatory
7. **The Trap** — narrator, cautionary
8. **The Move** — narrator, actionable
9. **Reflection** — narrator, ends on open questions

**Pauses:**
- 1 second between paragraphs
- 1.5 seconds between sections

## Duration Target

- ~5-7 minutes per chapter (1200-1500 words at natural speaking pace)
- Short enough for a commute segment or a walk break

## Tech Stack

- **Kokoro-82M** — local TTS model, 82M parameters
- Runs on Mac without GPU, no API calls, no cost
- First run downloads model weights from HuggingFace (~300MB), then fully offline

## Usage

```bash
# Single chapter
python chapter_to_podcast.py chapters/part-02-other-people/31-why-do-people-resist-change.md

# Custom output path
python chapter_to_podcast.py chapter.md -o output/my-podcast.mp3

# Different voices
python chapter_to_podcast.py chapter.md --narrator af_heart --storyteller am_michael

# List available voices
python chapter_to_podcast.py --list-voices
```

## Writing for Audio

When writing chapters, keep in mind they'll be read aloud:

- **Short sentences land better** — long compound sentences lose the listener
- **No visual-only formatting** — don't rely on bold/italic for emphasis; the words themselves should carry weight
- **Avoid symbols** — use "100 dollars" not "$100" or "₹100"
- **Section headers aren't read** — the voice change signals the transition
- **Quotable lines** — these become the moments the listener remembers

## Future Possibilities

- **Batch generation** — script all chapters in a part into a playlist
- **Intro/outro music** — short ambient pad to open and close
- **Instagram swipes** — same content, different format (card per section)
- **Web player** — embed MP3s alongside the written chapter on a site
