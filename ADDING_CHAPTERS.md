# Adding New Chapters — Content Guide

> How to add a new lesson/chapter from idea to playable in the app.

---

## Hierarchy

```
Book
└── Part (10 total)                    ← A major theme (Self, Others, Teams...)
    └── Section (2-4 per Part)         ← A sub-theme (Identity, Ego, Motivation...)
        └── Chapter (5-12 per Section) ← One problem, one story, one principle
            ├── chapter JSON            ← The story content
            ├── quiz JSON               ← The interactive challenge
            ├── audio MP3               ← Podcast version (generated)
            └── visual SVG              ← Illustration (generated)
```

### Parts Overview

| Part | Theme                      | Sections                                         |
| ---- | -------------------------- | ------------------------------------------------ |
| I    | Understanding Yourself     | Identity, Ego, Motivation, Emotions              |
| II   | Understanding Other People | Incentives, Trust, Status, Difficult People      |
| III  | Teams & Collaboration      | Alignment, Conflict, Decision Making             |
| IV   | Leadership                 | Vision, Influence, Hard Parts                    |
| V    | Organizations & Systems    | Bureaucracy, Silos, Change, Innovation           |
| VI   | Decision Making            | Biases, Thinking Tools                           |
| VII  | Communication              | Persuasion, Negotiation, Storytelling            |
| VIII | Conflict & Power           | Boundaries, Fairness, Forgiveness                |
| IX   | Ethics & Judgment          | Tensions (loyalty vs truth, justice vs mercy...) |
| X    | Career & Life              | When to stay/leave, ambition, legacy             |

Full chapter list: see `OUTLINE.md`

---

## Step-by-Step: Adding a New Chapter

### 1. Pick a chapter from OUTLINE.md

Each chapter has: number, question, core force, suggested story source.

Example: Chapter 44 — "How do I handle manipulation?" (Power force, Shakuni's dice game)

### 2. Create the chapter JSON

Create: `content/chapters/part-{XX}/{ID}.json`

```json
{
  "id": "44",
  "part": 2,
  "section": "D",
  "title": "How Do I Handle Manipulation?",
  "forces": ["power", "trust"],
  "connections": ["43", "45", "93"],
  "audio": "44.mp3",
  "visual": "44.svg",
  "sections": [
    {
      "type": "situation",
      "content": "Someone at work is playing you. They smile in meetings, agree to everything, then quietly undermine you. You can feel it but can't prove it."
    },
    {
      "type": "story",
      "title": "The Story",
      "content": "In the Indian epic Mahabharata, there's a character named Shakuni — the uncle who orchestrated the downfall of an entire kingdom through a single game of dice...\n\n[Full story here — 300-500 words, focused on the moment of decision]"
    },
    {
      "type": "contrast",
      "title": "The Contrast",
      "content": "A shorter second story (100-150 words) from a different tradition that shows the same principle from another angle."
    },
    {
      "type": "principle",
      "content": "Manipulators rely on your assumptions. The moment you watch actions instead of words, the game is visible."
    },
    {
      "type": "psychology",
      "title": "Why It Happens",
      "content": "The psychology — what's happening in the brain/social dynamics (150-250 words)."
    },
    {
      "type": "trap",
      "title": "The Trap",
      "content": "What goes wrong if you overreact vs. underreact (100-150 words)."
    },
    {
      "type": "move",
      "title": "The Move",
      "content": "1. Watch actions, not words.\n2. Document patterns.\n3. Name the behavior privately.\n4. Remove the audience.\n5. Set a boundary."
    }
  ]
}
```

### 3. Create the quiz JSON

Create: `content/chapters/part-{XX}/{ID}.quiz.json`

```json
{
  "chapterId": "44",
  "challenges": [
    {
      "type": "scenario-choice",
      "situation": "Your coworker agrees to help in meetings but never follows through. This is the third time.",
      "options": [
        {
          "text": "Confront them publicly in the next meeting",
          "correct": false,
          "feedback": "Public confrontation triggers ego defense. They'll deny and become your enemy."
        },
        {
          "text": "Watch their actions for a pattern, then address it privately",
          "correct": true,
          "feedback": "Patterns are undeniable. Private conversations remove the audience manipulators need."
        },
        {
          "text": "Do their work for them to avoid conflict",
          "correct": false,
          "feedback": "You're rewarding the behavior. It will escalate."
        }
      ]
    },
    {
      "type": "spot-the-force",
      "situation": "A manager always credits themselves for team wins but blames individuals for failures.",
      "question": "Which force drives this pattern?",
      "options": [
        {
          "text": "Fear",
          "correct": false,
          "feedback": "There may be some fear, but the primary driver is maintaining power through narrative control."
        },
        {
          "text": "Power",
          "correct": true,
          "feedback": "This is power maintenance — controlling the story of who succeeds and who fails keeps others dependent."
        },
        {
          "text": "Status",
          "correct": false,
          "feedback": "Status is a symptom here, not the driver. The behavior is about control, not just looking good."
        }
      ]
    },
    {
      "type": "card-flip",
      "front": "A skilled manipulator agreed to everything you asked, then did the opposite. Why didn't direct communication work?",
      "back": "Manipulators rely on your trust in words. They exploit the gap between what's said and what's done. The fix isn't better conversations — it's watching actions, not promises."
    }
  ],
  "principle": {
    "text": "Manipulators rely on your assumptions. Watch actions, not words.",
    "subtext": "The gap between what someone says and what they do is where manipulation lives."
  },
  "reflection": "Where in my life am I trusting words over actions right now?"
}
```

### 4. Validate the content

```bash
cd content/schema
npm run validate
```

This runs Zod validation against your JSON files. It will tell you if anything is missing or wrong.

### 5. Generate the audio (optional)

```bash
cd tools/
python chapter_to_podcast.py ../chapters/part-02-other-people/44-how-do-i-handle-manipulation.md
```

Note: The podcast script currently reads markdown. You may need to write the markdown version first, or adapt the script to read from JSON.

### 6. Generate the visual (optional)

Create a new generator in `tools/visuals/` following the style rules in `VISUAL_STYLE.md`:

- Stick figures
- White + black + one gold accent
- Scene depicts the story moment
- One quote at bottom

### 7. Copy assets to public/

```bash
cp content/chapters/part-XX/44.svg apps/web/public/content/44.svg
cp content/chapters/part-XX/44.mp3 apps/web/public/content/44.mp3
```

### 8. Wire into the app (for now — until multi-chapter routing is built)

Currently the app is hardcoded to chapter 31. To add a new chapter you'd need to:

- Add it to `apps/web/lib/content.ts` as another export
- Update page routes to accept dynamic `[id]` params (future work)

---

## Quiz Template Reference

### Template: `scenario-choice`

The primary template. Present a situation, 3 options, feedback on each.

```json
{
  "type": "scenario-choice",
  "situation": "The problem the user faces",
  "options": [
    { "text": "Option A", "correct": false, "feedback": "Why this is wrong" },
    { "text": "Option B", "correct": true, "feedback": "Why this is right" },
    { "text": "Option C", "correct": false, "feedback": "Why this is wrong" }
  ]
}
```

**When to use:** Most chapters. "What would you do?" situations.

### Template: `spot-the-force`

Identify which human force (ego, fear, identity, power, etc.) is driving a behavior.

```json
{
  "type": "spot-the-force",
  "situation": "A scenario or real-world example",
  "question": "Which force is driving this?",
  "options": [
    { "text": "Force A", "correct": false, "feedback": "Why not" },
    { "text": "Force B", "correct": true, "feedback": "Why this one" },
    { "text": "Force C", "correct": false, "feedback": "Why not" }
  ]
}
```

**When to use:** When the lesson is about recognizing patterns/dynamics.

### Template: `card-flip`

A belief on the front, the corrected principle on the back. User flips to reveal.

```json
{
  "type": "card-flip",
  "front": "A common belief or question that sounds reasonable",
  "back": "The actual principle — the insight that corrects or deepens the belief"
}
```

**When to use:** For principle reveals, myth-busting, reframing common assumptions.

### Mixing templates in one quiz

Each quiz has a `challenges` array. You can mix ANY templates in any order:

```json
{
  "challenges": [
    { "type": "scenario-choice", ... },
    { "type": "card-flip", ... },
    { "type": "spot-the-force", ... },
    { "type": "scenario-choice", ... }
  ]
}
```

The QuizShell renders them in sequence. Swap order, swap types — it just works.

---

## File Naming Convention

```
content/chapters/part-{NN}/{ID}.json         ← chapter content
content/chapters/part-{NN}/{ID}.quiz.json    ← quiz data
apps/web/public/content/{ID}.svg             ← visual (served by Next.js)
apps/web/public/content/{ID}.mp3             ← audio (served by Next.js)
```

Where:

- `{NN}` = part number with leading zero: `01`, `02`, `03`...
- `{ID}` = chapter number from OUTLINE.md: `31`, `44`, `5`...

---

## Section Types (for chapter JSON)

| Type         | Purpose                           | Required fields    |
| ------------ | --------------------------------- | ------------------ |
| `situation`  | The opening "you're facing X"     | `content`          |
| `story`      | Primary anchor story              | `title`, `content` |
| `contrast`   | Shorter second story              | `title`, `content` |
| `principle`  | The named concept                 | `content`          |
| `psychology` | Why it happens (biases, dynamics) | `title`, `content` |
| `trap`       | What goes wrong if overdo/ignore  | `title`, `content` |
| `move`       | Practical steps                   | `title`, `content` |

Order matters — this is the reading order.

---

## Story Quality Rules (from CHAPTER_TEMPLATE.md)

1. **No logic gaps** — every cause→effect must be obvious
2. **Simple beats clever** — instant visual, no abstraction needed
3. **Visceral over intellectual** — gut before head
4. **No translation needed** — introduce all characters/sources, no local currency, no culture-specific idioms
5. **The lesson is obvious** — if you need to explain the moral, the story failed
6. **One clear moment** — zoom into the frame that matters

---

## Quick Checklist

- [ ] Chapter picked from OUTLINE.md
- [ ] `{ID}.json` created with all 7 section types
- [ ] `{ID}.quiz.json` created with 2-4 challenges (mixed templates)
- [ ] `npm run validate` passes in `content/schema/`
- [ ] Audio generated (optional for now)
- [ ] Visual generated (optional for now)
- [ ] Assets copied to `apps/web/public/content/`
