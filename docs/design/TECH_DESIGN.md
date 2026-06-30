# Tech Design

> Build it right from day zero. Small pieces, loosely joined, easy to change.

---

## Stack Decision

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js (App Router) | SSR for SEO, file-based routing, React ecosystem, easy iteration, great DX |
| **Backend** | Fastify | Fast, schema-first, plugin architecture, TypeScript native |
| **State** | Zustand | Minimal, no boilerplate, works with React, easy to test |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, design tokens in one place, theme switching trivial |
| **i18n** | next-intl | Lightweight, works with App Router, easy to add languages later |
| **Testing** | Vitest + React Testing Library + Playwright (e2e) | Fast, modern, co-located tests |
| **Linting** | ESLint + Prettier + Husky + lint-staged | Pre-commit enforcement |
| **API Client** | Centralized fetch wrapper (typed) | One place to change auth, logging, error handling |
| **Logging** | Centralized logger (pino for BE, console wrapper for FE) | Swap implementations without touching callers |
| **Language** | TypeScript (strict mode) everywhere | Type safety, self-documenting |
| **Monorepo** | Turborepo | FE + BE + shared types in one repo, fast builds |

---

## Architecture Principles

1. **Functional over OOP** — Pure functions, composition, no class hierarchies
2. **Co-located tests** — `__tests__/` inside each module, not a separate tree
3. **Small units** — Components < 100 lines, functions < 30 lines, files < 200 lines
4. **Module isolation** — Changing the map module doesn't touch story, quiz, or game
5. **12-factor** — Config from env, stateless processes, disposable instances
6. **DDD-lite** — Domains own their logic, shared kernel for cross-cutting concerns
7. **Extensible by design** — Auth, paywall, API integrations are pluggable layers
8. **Tests as docs** — Test names describe behavior, not implementation

---

## Project Structure

```
field-guide/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── (game)/              # Game entry point (Mario runner)
│   │   │   │   ├── page.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── (map)/               # Map entry point (direct navigation)
│   │   │   │   ├── page.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── chapter/[id]/        # Chapter page (story + audio)
│   │   │   │   ├── page.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── quiz/[id]/           # Quiz page (templated)
│   │   │   │   ├── page.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── result/[id]/         # Result/completion page
│   │   │   │   ├── page.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── modules/
│   │   │   ├── game/                 # Mario runner game logic
│   │   │   │   ├── components/
│   │   │   │   │   ├── Canvas.tsx
│   │   │   │   │   ├── Player.ts
│   │   │   │   │   ├── Obstacle.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useGameLoop.ts
│   │   │   │   │   ├── useCollision.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   └── index.ts
│   │   │   ├── map/                  # World map module
│   │   │   │   ├── components/
│   │   │   │   │   ├── WorldMap.tsx
│   │   │   │   │   ├── MapNode.tsx
│   │   │   │   │   ├── MapPath.tsx
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useProgress.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   └── index.ts
│   │   │   ├── story/                # Story/chapter module
│   │   │   │   ├── components/
│   │   │   │   │   ├── StoryView.tsx
│   │   │   │   │   ├── AudioPlayer.tsx
│   │   │   │   │   ├── ChapterVisual.tsx
│   │   │   │   │   ├── StorySection.tsx
│   │   │   │   │   └── __tests__/
│   │   │   │   └── index.ts
│   │   │   ├── quiz/                 # Quiz module (multiple templates)
│   │   │   │   ├── components/
│   │   │   │   │   ├── QuizShell.tsx        # Shared wrapper
│   │   │   │   │   ├── ScenarioChoice.tsx   # Template: pick the right answer
│   │   │   │   │   ├── SpotTheForce.tsx     # Template: identify the force
│   │   │   │   │   ├── CardFlip.tsx         # Template: flip to reveal
│   │   │   │   │   ├── DragMatch.tsx        # Template: drag to match
│   │   │   │   │   ├── SequenceOrder.tsx    # Template: put in order
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useQuizState.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   └── index.ts
│   │   │   └── result/               # Completion/result module
│   │   │       ├── components/
│   │   │       │   ├── ResultCard.tsx
│   │   │       │   ├── PrincipleReveal.tsx
│   │   │       │   ├── ReflectionPrompt.tsx
│   │   │       │   └── __tests__/
│   │   │       └── index.ts
│   │   ├── shared/                   # Cross-cutting shared code
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── ProgressDots.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── __tests__/
│   │   │   ├── hooks/
│   │   │   │   ├── useTheme.ts
│   │   │   │   └── useLocalStorage.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts            # Centralized API client
│   │   │   │   ├── logger.ts         # Centralized logging
│   │   │   │   └── constants.ts
│   │   │   ├── styles/
│   │   │   │   └── tokens.css        # Design tokens (colors, spacing, fonts)
│   │   │   └── i18n/
│   │   │       ├── en.json
│   │   │       └── index.ts
│   │   ├── store/                    # Zustand stores
│   │   │   ├── progressStore.ts      # User progress (chapters done, score)
│   │   │   ├── themeStore.ts         # Light/dark
│   │   │   └── __tests__/
│   │   └── types/                    # Shared TypeScript types
│   │       ├── chapter.ts
│   │       ├── quiz.ts
│   │       └── progress.ts
│   └── api/                          # Fastify backend
│       ├── src/
│       │   ├── domains/
│       │   │   ├── chapters/
│       │   │   │   ├── chapter.routes.ts
│       │   │   │   ├── chapter.service.ts
│       │   │   │   ├── chapter.schema.ts
│       │   │   │   └── __tests__/
│       │   │   ├── progress/
│       │   │   │   ├── progress.routes.ts
│       │   │   │   ├── progress.service.ts
│       │   │   │   ├── progress.schema.ts
│       │   │   │   └── __tests__/
│       │   │   └── quiz/
│       │   │       ├── quiz.routes.ts
│       │   │       ├── quiz.service.ts
│       │   │       ├── quiz.schema.ts
│       │   │       └── __tests__/
│       │   ├── shared/
│       │   │   ├── plugins/
│       │   │   │   ├── cors.ts
│       │   │   │   ├── auth.ts       # Future: auth plugin
│       │   │   │   └── logger.ts
│       │   │   ├── errors/
│       │   │   │   └── AppError.ts
│       │   │   └── config/
│       │   │       └── env.ts         # 12-factor env config
│       │   ├── app.ts
│       │   └── server.ts
│       └── package.json
├── packages/
│   └── shared-types/                 # Types shared between FE and BE
│       ├── chapter.ts
│       ├── quiz.ts
│       └── progress.ts
├── content/                          # Chapter content (markdown + assets)
│   ├── chapters/
│   │   └── part-02-other-people/
│   │       ├── 31-why-do-people-resist-change.md
│   │       ├── 31-why-do-people-resist-change.mp3
│   │       ├── 31-why-do-people-resist-change.svg
│   │       └── 31-why-do-people-resist-change.game.json
│   └── outline.json                  # Machine-readable chapter metadata
├── tools/                            # Build-time tools
│   ├── chapter-to-podcast.py
│   └── visuals/
│       └── generate-31.mjs
├── turbo.json
├── package.json
├── .eslintrc.js
├── .prettierrc
├── .husky/
│   ├── pre-commit                    # lint-staged
│   └── pre-push                      # tests
└── README.md
```

---

## Key Design Decisions

### 1. Module Isolation

Each module (game, map, story, quiz, result) is **self-contained**:
- Own components, hooks, tests
- Communicates with other modules ONLY through:
  - Shared types (from `types/`)
  - Store (Zustand)
  - Router (URL navigation)
- No direct imports between modules

```
✅ import { Chapter } from '@/types/chapter'
✅ import { useProgressStore } from '@/store/progressStore'
❌ import { MapNode } from '@/modules/map/components/MapNode'  (from quiz module)
```

### 2. Quiz Templates

Quiz is NOT one component. It's a **template system**:

```typescript
// quiz/components/QuizShell.tsx — shared wrapper (progress dots, navigation)
// Each template is a separate component:

type QuizTemplate = 
  | 'scenario-choice'   // Pick correct answer from 3
  | 'spot-the-force'    // Identify which force drives behavior
  | 'card-flip'         // Flip to reveal principle
  | 'drag-match'        // Drag situations to moves
  | 'sequence-order'    // Put steps in right order

// Template selection is data-driven:
// chapter.game.json → { challenges: [{ type: "scenario-choice", ... }] }
```

### 3. Centralized API Client

```typescript
// shared/lib/api.ts
const api = createClient({
  baseUrl: env.API_URL,
  onRequest: (req) => logger.debug('API call', req),
  onError: (err) => logger.error('API error', err),
  // Future: auth headers injected here
});

export const chapters = {
  getAll: () => api.get('/chapters'),
  getById: (id: string) => api.get(`/chapters/${id}`),
};
```

One place to add auth tokens, retry logic, error handling. Callers never know the details.

### 4. Centralized Logging

```typescript
// shared/lib/logger.ts
export const logger = {
  debug: (msg: string, data?: unknown) => { /* impl */ },
  info: (msg: string, data?: unknown) => { /* impl */ },
  error: (msg: string, data?: unknown) => { /* impl */ },
};
// Swap console → Sentry → DataDog without touching callers
```

### 5. Design Tokens (Single Source of Truth)

```css
/* shared/styles/tokens.css */
:root {
  --color-bg: #FAFAFA;
  --color-text: #1A1A1A;
  --color-gold: #DAA520;
  --color-correct: #2E7D32;
  --color-wrong: #C62828;
  --font-primary: 'IBM Plex Sans', sans-serif;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --radius: 3px;
}
[data-theme="dark"] {
  --color-bg: #0D0D0D;
  --color-text: #E8E8E8;
}
```

Change once, applies everywhere.

### 6. i18n Foundation

```json
// shared/i18n/en.json
{
  "game.start": "Tap to Start",
  "game.hit": "Read & Solve →",
  "quiz.next": "Next →",
  "quiz.correct": "Correct!",
  "result.continue_game": "Continue Running →",
  "result.back_to_map": "Back to Map"
}
```

All user-facing text from one file. Adding a language = adding one JSON file.

### 7. State Management (Zustand)

```typescript
// store/progressStore.ts
interface ProgressState {
  completedChapters: string[];
  score: number;
  currentChapter: string | null;
  completeChapter: (id: string) => void;
  reset: () => void;
}
```

Simple, testable, no providers/context wrapping. Persists to localStorage.

### 8. Error Boundaries

Each module has its own error boundary. Map crashes? Story still works.

```typescript
// Per-module error handling
<ModuleErrorBoundary module="quiz" fallback={<QuizError />}>
  <QuizShell />
</ModuleErrorBoundary>
```

---

## Hooks & Pre-commit

```json
// .husky/pre-commit
lint-staged

// .husky/pre-push  
vitest run

// lint-staged config
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["prettier --write"]
}
```

---

## Testing Strategy

| Level | Tool | What it tests | Where |
|-------|------|---------------|-------|
| Unit | Vitest | Functions, hooks, stores | `__tests__/` co-located |
| Component | React Testing Library | UI behavior (not implementation) | `__tests__/` co-located |
| Integration | Vitest | Module interactions | `__tests__/` at module root |
| E2E | Playwright | Full user flows (game → chapter → quiz → result) | `e2e/` at repo root |

**Test naming convention:**
```typescript
describe('AudioPlayer', () => {
  it('shows play button when audio is paused', () => {});
  it('shows pause button when audio is playing', () => {});
  it('updates progress bar as audio plays', () => {});
});
```
Tests read like documentation.

---

## Data Flow

```
Content (JSON with strict schema — validated at build time)
    ↓ build-time validation (Zod schemas)
Static assets (mp3, svg) + typed JSON
    ↓ served by
Next.js (SSG for content pages, CSR for game)
    ↓ client-side
Zustand store (progress, theme)
    ↓ synced to
MongoDB (user progress, scores, analytics)
    ↓ served by
Fastify API (auth, sync, progress)
```

### Database: MongoDB

- **Why:** Flexible schema for evolving chapter/quiz structure, natural fit for JSON-shaped content, easy to query nested quiz data, good for user progress documents
- **Collections:**
  - `users` — auth, profile
  - `progress` — per-user chapter completion, scores, streaks
  - `analytics` — events (chapter_started, quiz_completed, game_obstacle_hit)
- **ODM:** Mongoose (schema validation + TypeScript types)

### Content Pipeline: JSON with Strict Schema

Content lives as **JSON files validated by Zod schemas at build time**. This gives:
- Git-versioned content (PRs for new chapters)
- Type safety (schema violations caught before deploy)
- Easy to migrate to a CMS later (same schema, different source)
- No database dependency for content (static, fast, cacheable)

```
content/
├── schema/
│   ├── chapter.schema.ts    # Zod schema for chapter content
│   ├── quiz.schema.ts       # Zod schema for quiz data
│   └── validate.ts          # Build-time validation script
├── chapters/
│   └── part-02/
│       ├── 31.json          # Chapter content (story, sections)
│       ├── 31.quiz.json     # Quiz data (challenges, options)
│       ├── 31.meta.json     # Metadata (connections, forces, tags)
│       ├── 31.mp3           # Audio asset
│       └── 31.svg           # Visual asset
└── outline.json             # Full chapter index
```

**Migration path:**
1. **Now:** JSON in repo, validated at build time
2. **Later:** Same JSON served from a headless CMS (Strapi, Sanity) or MongoDB content collection
3. **Schema stays the same** — consumers don't care where JSON comes from

### Hosting (deferred)

Will sort later. Options when ready:
- Vercel (easiest for Next.js)
- Railway / Render (FE + BE + Mongo together)
- Self-hosted (Docker compose)

---

## Future Extension Points

| Feature | Where it plugs in |
|---------|------------------|
| Auth/Login | `api/shared/plugins/auth.ts` + FE `shared/lib/api.ts` header injection |
| Paywall | Middleware in Next.js `layout.tsx` + progress store check |
| Analytics | `shared/lib/logger.ts` → pipe to analytics service |
| New quiz template | Add component in `modules/quiz/components/` + type in schema |
| New language | Add JSON in `shared/i18n/` |
| Mobile app (React Native) | Share `packages/shared-types`, `store/`, rewrite UI layer |

---

## Commands

```bash
# Dev
turbo dev                    # Start FE + BE

# Test
turbo test                   # All tests
turbo test --filter=web      # FE only
turbo test --filter=api      # BE only

# Lint
turbo lint                   # ESLint + Prettier check

# Build
turbo build                  # Production build

# Content tools
python tools/chapter-to-podcast.py content/chapters/...
node tools/visuals/generate-31.mjs
```

---

## Next Steps

1. Initialize Turborepo with Next.js + Fastify
2. Set up ESLint, Prettier, Husky, lint-staged
3. Create design tokens + theme toggle
4. Build shared components (Button, ProgressDots)
5. Build first module (Story page) with tests
6. Build Quiz module with ScenarioChoice template
7. Build Map module
8. Build Game module
9. Wire navigation between all modules
10. Add remaining quiz templates one by one

---

## Backlog (not needed now, tackle when relevant)

- [ ] Asset management — CDN for audio/SVG, preloading strategy
- [ ] Caching — aggressive headers for static content, service worker for offline
- [ ] Performance budget — FCP < 1.5s, 60fps game, bundle splitting per module
- [ ] SEO & social sharing — OG images from SVGs, structured data, meta descriptions
- [ ] Analytics events — chapter_opened, quiz_correct, game_distance, funnel tracking
- [ ] Accessibility audit — keyboard controls, ARIA, focus management, color contrast
- [ ] Content versioning — schema version field, migration handling for edited chapters
- [ ] Rate limiting — server-side quiz validation, abuse prevention
- [ ] Feature flags — env-based toggles for game/paywall/new templates
- [ ] Monitoring — Sentry (FE), healthcheck (BE), canvas failure detection
- [ ] Responsive breakpoints — define once, mobile-first approach
- [ ] Data export — user progress as JSON download
- [ ] CI/CD pipeline — PR: lint+test+build, merge: deploy, content schema validation
- [ ] MongoDB backups — automated schedule
