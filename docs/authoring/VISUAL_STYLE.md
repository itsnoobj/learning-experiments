# Visual Style

> Every chapter gets one image. The image IS the story — not a decoration beside it.

## Core Principles

### 1. Scene depicts the story
The illustration shows the key moment from the chapter's story. Not an abstract concept, not a metaphor-of-a-metaphor — the actual scene. If the story is about monkeys pulling one down from a ladder, you draw monkeys pulling one down from a ladder.

### 2. Objects must be recognizable
If a viewer asks "what's that?" — it failed. Every object should be identifiable in under a second. When in doubt, simplify or remove.

### 3. Action must be clear
You should see WHO is doing WHAT to WHOM instantly. Body posture tells the story — arms up = reaching, arms toward someone = pulling, arms crossed = refusing. If the action isn't obvious from posture alone, rethink the composition.

### 4. Stick figures
Simple, universal. No race, gender, age, or culture encoded. Circle head, line body, V-legs. Everyone sees themselves in a stick figure.

### 5. White + Black + One accent color
- Background: white
- Lines and figures: black
- One accent color (gold, muted red, blue) on the KEY object only — the goal, the prize, the threat
- Color budget: less than 5-10% of the image
- The colored object is what the viewer's eye goes to first

### 6. Hand-drawn wobble
Slight roughness on all lines (Rough.js, roughness ~0.8-1.5). Makes it approachable and human, not clinical or corporate. Not so rough that it looks messy.

### 7. One quote at bottom
The principle or punchline — italic, centered below the scene. This is the line the viewer remembers. Not a title, not a description — the takeaway.

### 8. No clutter
If an element doesn't help tell the story, remove it. Whitespace is good. Every line earns its place.

### 9. Scale matters
Characters big enough that their body language is readable. Arms, posture, and position relative to each other carry the meaning.

### 10. Direction and position
- **Top** = goal, aspiration, what's being reached for
- **Bottom** = ground, status quo, gravity
- **Movement left-to-right** = progress, forward motion
- **Pulling down** = resistance, opposition

## Format

| Property | Value |
|----------|-------|
| Dimensions | 800 × 600 (landscape, web/podcast cover) |
| Square variant | 600 × 600 (Instagram posts) |
| Story variant | 600 × 1067 (Instagram stories, 9:16) |
| File format | SVG (source) → PNG for distribution |
| Font | Sans-serif for quote text |

## What NOT to include

- No speech bubbles or dialogue
- No labels on objects (if you need a label, the object isn't clear enough)
- No borders or frames around the image
- No gradients or shadows
- No detailed faces or expressions — posture carries emotion
- No text inside the scene — only the quote below

## Color Palette (accent options)

Use ONE per image, for the key object only:

| Color | Hex | Use for |
|-------|-----|---------|
| Gold | `#DAA520` | Goals, prizes, aspirations |
| Muted red | `#CC3333` | Threats, danger, warnings |
| Soft blue | `#4A90D9` | Clarity, insight, truth |
| Green | `#5B8C5A` | Growth, safety, trust |

## Tech Stack

- **Rough.js** — hand-drawn SVG rendering
- **JSDOM** — server-side DOM for Node.js
- **Node.js** — script execution
- Code-generated = version-controlled, reproducible, consistent

## Generating

```bash
cd visuals/
node generate-31.mjs
# Outputs: chapters/part-02-other-people/31-why-do-people-resist-change.svg
```

Each chapter gets its own generate script, or we build a single parameterized generator as patterns emerge.
