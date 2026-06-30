# Hierarchy & Navigation

> How the content is organized and how the user navigates through it.

---

## Hierarchy

```
Book
└── Part (10)          ← A world/continent. Big theme.
    └── Section (2-4)  ← A region within the world. Sub-theme.
        └── Chapter    ← A single node/lesson. One problem, one story.
```

| Level       | Content                              | Map Visual                                    | Game Visual                    |
| ----------- | ------------------------------------ | --------------------------------------------- | ------------------------------ |
| **Part**    | Major theme (Self, Others, Teams...) | A distinct world/landscape you enter          | A new terrain/backdrop         |
| **Section** | Sub-theme (Identity, Ego, Trust...)  | A cluster of connected nodes within the world | A stretch of related obstacles |
| **Chapter** | One problem + story + principle      | One clickable node                            | One obstacle hit               |

---

## Map Navigation: Drill-down

The user drills from big to small:

```
WORLD SELECT (all 10 Parts)
       │
       │  click a world
       ▼
WORLD MAP (sections + chapter nodes within that Part)
       │
       │  click a node
       ▼
CHAPTER PAGE (story + audio + quiz)
```

### Screen 1: World Select

Shows all 10 Parts as distinct landscapes. Each has a visual identity:

| Part | World Name     | Landscape Metaphor                     | Accent     |
| ---- | -------------- | -------------------------------------- | ---------- |
| I    | The Mirror     | Still lake with reflection             | Blue       |
| II   | The Crowd      | Marketplace, many paths crossing       | Warm amber |
| III  | The Campfire   | Mountain campsite, figures around fire | Orange     |
| IV   | The Summit     | Mountain peak, steep climb             | Silver     |
| V    | The Maze       | Walled labyrinth from above            | Grey       |
| VI   | The Crossroads | Forking paths in a forest              | Green      |
| VII  | The Bridge     | Two cliffs with a bridge between       | Teal       |
| VIII | The Arena      | Colosseum/ring, two sides facing       | Red        |
| IX   | The Scale      | Balanced scale, two weights            | Purple     |
| X    | The Horizon    | Open road disappearing into distance   | Gold       |

**Visual style:** Each world is a simple illustration (stick-figure style, same as chapters). Dark background. The landscape is drawn in white/grey lines. The accent color marks the world's "glow" or highlight.

**Interaction:** Tap a world → enter it → see its section map.

### Screen 2: World Map (per Part)

Inside a Part, you see sections as CLUSTERS of nodes connected by paths.

Example — Part II "The Crowd":

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  SECTION A: Incentives          SECTION B: Trust│
│                                                 │
│     ★──★──●──●                    ○──○──○       │
│        │                          │             │
│        ★──●                       ○──○          │
│                                                 │
│  SECTION C: Status         SECTION D: Difficult │
│                                                 │
│     ○──○──○──○                    ○──○──○       │
│                                   │             │
│                                   ○──○──○       │
│                                                 │
└─────────────────────────────────────────────────┘

★ = done    ● = available    ○ = locked
```

**Sections unlock sequentially** (finish Section A to unlock B) but **chapters within a section can be done in any order** (like Mario World — you can skip around within a world).

**Between sections:** A larger "gate" or "boss node" that requires completing most of the section's chapters before opening.

### Screen 3: Chapter

Same as current — visual, audio, story, quiz.

---

## Landscape Visuals per Section

Within each world, sections have distinct terrain metaphors (all drawn in our stick-figure, minimal style):

### Part II "The Crowd" example:

| Section             | Terrain            | Visual elements on map                                    |
| ------------------- | ------------------ | --------------------------------------------------------- |
| A: Incentives       | Marketplace stalls | Nodes look like market stands, paths are cobblestone dots |
| B: Trust            | Bridge over water  | Nodes are posts on a bridge, path is the bridge itself    |
| C: Status           | Steps/staircase    | Nodes are steps going up, path is the stair rail          |
| D: Difficult People | Thorny path        | Nodes in a winding route with thorn-like decorations      |

All drawn with: white lines on dark bg, one accent color per section (subtle), stick-figure-style simplicity.

---

## Game: How Terrain Maps to Content

In the Mario runner game, the world changes as you progress:

| Distance   | Part                 | Terrain Visual                       |
| ---------- | -------------------- | ------------------------------------ |
| 0-500m     | Part I (Self)        | Clean flat ground, simple obstacles  |
| 500-1000m  | Part II (Others)     | Market-like structures, pipes/stalls |
| 1000-1500m | Part III (Teams)     | Campfire elements, grouped obstacles |
| 1500-2000m | Part IV (Leadership) | Uphill slope, harder jumps           |
| 2000m+     | Parts V-X            | Mixed, increasing difficulty         |

The obstacles themselves are themed:

- **Part I:** Walls (internal blocks)
- **Part II:** Pipes and market stalls (other people)
- **Part III:** Grouped obstacles (team dynamics)
- **Part IV+:** Moving/complex obstacles

---

## Config Structure

```
content/
├── hierarchy.json              ← Master config: parts, sections, chapter order
├── chapters/
│   ├── part-01/
│   │   ├── 1.json
│   │   ├── 1.quiz.json
│   │   ├── 2.json
│   │   └── ...
│   ├── part-02/
│   └── ...
└── schema/
    ├── chapter.schema.ts
    ├── quiz.schema.ts
    └── hierarchy.schema.ts     ← Validates hierarchy.json
```

### hierarchy.json (master config)

```json
{
  "parts": [
    {
      "id": 1,
      "title": "Understanding Yourself",
      "worldName": "The Mirror",
      "landscape": "lake",
      "accent": "#4A90D9",
      "sections": [
        {
          "id": "A",
          "title": "Identity",
          "terrain": "reflection-pools",
          "chapters": ["1", "2", "3", "4", "5", "6", "7", "8"]
        },
        {
          "id": "B",
          "title": "Ego",
          "terrain": "cracked-mirrors",
          "chapters": ["9", "10", "11", "12", "13"]
        },
        {
          "id": "C",
          "title": "Motivation",
          "terrain": "uphill-paths",
          "chapters": ["14", "15", "16", "17", "18", "19"]
        },
        {
          "id": "D",
          "title": "Emotions",
          "terrain": "weather-zones",
          "chapters": ["20", "21", "22", "23", "24", "25"]
        }
      ]
    },
    {
      "id": 2,
      "title": "Understanding Other People",
      "worldName": "The Crowd",
      "landscape": "marketplace",
      "accent": "#DAA520",
      "sections": [
        {
          "id": "A",
          "title": "Incentives & Hidden Motives",
          "terrain": "market-stalls",
          "chapters": ["26", "27", "28", "29", "30", "31", "32", "33"]
        },
        {
          "id": "B",
          "title": "Trust",
          "terrain": "bridge",
          "chapters": ["34", "35", "36", "37", "38"]
        },
        {
          "id": "C",
          "title": "Status & Recognition",
          "terrain": "staircase",
          "chapters": ["39", "40", "41", "42"]
        },
        {
          "id": "D",
          "title": "Difficult People",
          "terrain": "thorny-path",
          "chapters": ["43", "44", "45", "46", "47", "48"]
        }
      ]
    }
  ]
}
```

---

## Unlock Logic

```
Part 1 → unlocked by default (starting world)
Part N → unlocked when Part N-1 has ≥70% chapters complete

Section A → unlocked when entering the Part
Section B → unlocked when Section A has ≥80% chapters complete
Section C → unlocked when Section B has ≥80% chapters complete

Chapter → unlocked when it's in an unlocked section
           AND at least one connected chapter is done (or it's the first)
```

This means:

- You can't skip whole Parts
- Within a Part, you progress section by section
- Within a section, you have freedom to pick order
- Connections between chapters create natural "recommended next" paths

---

## Code Mapping

```
apps/web/
├── app/
│   ├── worlds/page.tsx           ← World Select (all 10 Parts)
│   ├── worlds/[partId]/page.tsx  ← World Map (sections + nodes for one Part)
│   ├── chapter/[id]/page.tsx     ← Chapter page
│   ├── quiz/[id]/page.tsx        ← Quiz page
│   ├── result/[id]/page.tsx      ← Result page
│   └── game/page.tsx             ← Mario runner
├── modules/
│   ├── worlds/                   ← World select screen
│   │   ├── components/
│   │   │   ├── WorldCard.tsx     ← One Part as a landscape card
│   │   │   └── WorldGrid.tsx     ← Grid of all 10 worlds
│   │   └── data/
│   │       └── hierarchy.ts      ← Loads hierarchy.json
│   ├── map/                      ← World Map (current, evolves to per-Part)
│   ├── game/                     ← Mario runner
│   ├── story/                    ← Chapter content
│   ├── quiz/                     ← Quiz templates
│   └── result/                   ← Completion
└── store/
    └── progressStore.ts          ← Tracks: completedChapters, currentPart, currentSection
```

---

## Summary

| User action            | What they see                                                 |
| ---------------------- | ------------------------------------------------------------- |
| Opens app              | World Select — 10 landscapes (Parts)                          |
| Taps "The Crowd"       | World Map for Part II — 4 section clusters with chapter nodes |
| Taps node "31"         | Chapter page — story, audio, visual                           |
| Finishes quiz          | Result — obstacle cleared / path unlocked                     |
| Returns to world map   | Next node unlocked, path animated                             |
| Completes a section    | Gate opens to next section                                    |
| Completes ~70% of Part | Next Part (world) unlocks on World Select                     |
| Plays game             | All of the above but randomized/discovery-based               |
