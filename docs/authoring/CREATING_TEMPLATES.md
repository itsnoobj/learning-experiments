# Creating Quiz Templates

A **quiz template** is a self-contained, interactive challenge component (pick an
answer, reorder items, flip a card, etc.). A chapter quiz is just an ordered list
of these challenges. This guide explains how the template system works and how to
add a new template type end-to-end.

## How Templates Work

- `QuizShell` reads the `challenges[]` array from a quiz JSON document.
- Each challenge object has a `type` field (the discriminator).
- `QuizShell` `switch`es on `challenge.type` and renders the matching component,
  passing the challenge's fields through as props.
- Each template owns its interaction (selection, reordering, flipping, choosing).
- Every template calls `onCorrect()` when the learner completes it successfully.
  `QuizShell` wires `onCorrect` to its internal `handleCorrect`, which records the
  answer and advances to the next challenge. After the last challenge, `QuizShell`
  calls `onComplete(score)`.

```
quiz JSON ──▶ QuizShell ──▶ switch(type) ──▶ <Template onCorrect={...} />
                  ▲                                     │
                  └──────────── onCorrect() ◀───────────┘
```

Key files:

| Concern               | File                                                    |
| --------------------- | ------------------------------------------------------- |
| Renderer / dispatcher | `apps/web/modules/quiz/components/QuizShell.tsx`        |
| Template components   | `apps/web/modules/quiz/components/*.tsx`                |
| Runtime type union    | `packages/shared-types/src/index.ts` (`QuizChallenge`)  |
| Validation (Zod)      | `content/schema/quiz.schema.ts` (`quizChallengeSchema`) |
| Dev gallery           | `apps/web/app/dev/quiz/page.tsx`                        |
| Tests                 | `apps/web/modules/quiz/components/__tests__/*.test.tsx` |

---

## Existing Templates (5)

### 1. `scenario-choice` — `ScenarioChoice.tsx`

- **Props received:** `situation: string`, `options: ChallengeOption[]`, `onCorrect: () => void`
- **When to use it:** "Pick the best response" to a workplace situation. The learner
  reads a situation and selects from 2+ options; exactly one is `correct`. A wrong
  pick shows feedback and stays selectable so the learner can try again; the correct
  pick reveals a **Next** button that calls `onCorrect`.
- **Example JSON:**

```json
{
  "type": "scenario-choice",
  "situation": "A teammate keeps taking credit for your work in meetings.",
  "options": [
    {
      "text": "Call them out publicly in the next meeting",
      "correct": false,
      "feedback": "Public confrontation triggers ego defense and escalates."
    },
    {
      "text": "Privately share a fact-based record and ask to co-present",
      "correct": true,
      "feedback": "Direct, low-status-threat, and creates a verifiable trail."
    },
    {
      "text": "Say nothing and hope it stops",
      "correct": false,
      "feedback": "Silence is read as consent; the pattern continues."
    }
  ]
}
```

### 2. `spot-the-force` — `SpotTheForce.tsx`

- **Props received:** `situation: string`, `question: string`, `options: ChallengeOption[]`, `onCorrect: () => void`
- **When to use it:** "Identify the driving force" behind a described behavior. Like
  `scenario-choice` but adds a `question` label (e.g. "Which force is at play?")
  between the situation and the options. A wrong answer locks input briefly
  (~1.5s) then resets so the learner can retry.
- **Example JSON:**

```json
{
  "type": "spot-the-force",
  "situation": "Your manager refuses to delegate a task they clearly have no time for.",
  "question": "Which force is at play?",
  "options": [
    {
      "text": "Ego",
      "correct": false,
      "feedback": "Close, but it's more about control than self-image."
    },
    {
      "text": "Fear",
      "correct": true,
      "feedback": "Letting go risks visible failure they can't control."
    },
    {
      "text": "Status",
      "correct": false,
      "feedback": "Status is a side effect, not the root driver here."
    }
  ]
}
```

### 3. `card-flip` — `CardFlip.tsx`

- **Props received:** `front: string`, `back: string`, `onCorrect: () => void`
- **When to use it:** Reveal a principle. The front states a common belief or prompt;
  the learner taps to flip (CSS `rotateY`) and reads the corrected principle on the
  back, where a **Got it** button calls `onCorrect`. Use for reinforcement rather
  than testing — there is no "wrong" path.
- **Example JSON:**

```json
{
  "type": "card-flip",
  "front": "If I just show enough data, people will change their minds.",
  "back": "People change behavior when the loss feels acknowledged — not when the logic is airtight."
}
```

### 4. `drag-match` — `DragMatch.tsx`

- **Props received:** `instruction: string`, `items: DragMatchItem[]`, `correctOrder: string[]`, `onCorrect: () => void`
- **When to use it:** "Put these in the right order." Items are shown shuffled (never
  pre-solved) with up/down arrows to reorder. A **Check Order** button validates:
  correct flashes green and reveals **Next** (`onCorrect`); wrong flashes red and
  lets the learner retry. `correctOrder` is the list of item `id`s in sequence.
- **Example JSON:**

```json
{
  "type": "drag-match",
  "instruction": "Order the steps for introducing change people resist.",
  "items": [
    { "id": "a", "text": "Name the loss out loud" },
    { "id": "b", "text": "Make the first step tiny" },
    { "id": "c", "text": "Let early adopters prove it" }
  ],
  "correctOrder": ["a", "b", "c"]
}
```

### 5. `before-after` — `BeforeAfter.tsx`

- **Props received:** `context: string`, `scenarioA: BeforeAfterScenario`, `scenarioB: BeforeAfterScenario`, `correctScenario: 'A' | 'B'`, `explanation: string`, `onCorrect: () => void`
- **When to use it:** "Which one got it right?" Show a shared `context`, then two
  labeled scenario cards. Picking the correct one marks it gold with a **Correct**
  badge, reveals the `explanation`, and shows **Next** (`onCorrect`). Picking the
  wrong one flags it red with "Not quite" and still reveals the explanation so the
  learner can choose again. A `BeforeAfterScenario` is `{ label, text }`.
- **Example JSON:**

```json
{
  "type": "before-after",
  "context": "Your team resists a new tool.",
  "scenarioA": {
    "label": "Manager A",
    "text": "Presents 50 slides of data proving the tool is better."
  },
  "scenarioB": {
    "label": "Manager B",
    "text": "Says 'I know this means relearning. Let's try it for one task.'"
  },
  "correctScenario": "B",
  "explanation": "Manager B acknowledged the loss first, which lowers resistance."
}
```

---

## How to Create a New Template

Suppose you want a new template type called `new-template`.

1. **Create the component** in `apps/web/modules/quiz/components/NewTemplate.tsx`.
   Start it with `'use client';`.
2. **Define a props interface** that includes every field the challenge needs plus
   `onCorrect: () => void`.
3. **Implement the interaction** (selection, input, drag, etc.) with local React
   state. Keep all visuals driven by CSS variables (`--color-*`) for theming.
4. **Call `onCorrect()`** only once the learner has demonstrably completed the task
   correctly (e.g. after they confirm via a Next/Got it button).
5. **Add the type to the `QuizShell` switch** in
   `apps/web/modules/quiz/components/QuizShell.tsx`: add a `case 'new-template':`
   that renders `<NewTemplate ... onCorrect={handleCorrect} />`, and import the
   component at the top. Also export it from `apps/web/modules/quiz/index.ts` if you
   want it available to the dev gallery.
6. **Add the type to the `QuizChallenge` union** in
   `packages/shared-types/src/index.ts`: add a `NewTemplateChallenge` interface with
   `type: 'new-template'` and its fields, then add it to the `QuizChallenge` union.
7. **Add the type to the Zod schema** in `content/schema/quiz.schema.ts`: create a
   `newTemplateSchema = z.object({ type: z.literal('new-template'), ... })` and add
   it to the `quizChallengeSchema` discriminated union.
8. **Add tests** in
   `apps/web/modules/quiz/components/__tests__/NewTemplate.test.tsx` (see the
   testing section below).
9. **Add sample data** to the dev gallery `apps/web/app/dev/quiz/page.tsx`: add a
   sample object and a `<Section label="NewTemplate">` rendering it with
   `onCorrect={noop}`.
10. **Use it in quiz JSON** by setting `"type": "new-template"` on a challenge in a
    chapter's `*.quiz.json` file.

> Keep the `type` string identical across the component switch, the shared-types
> union, and the Zod schema. A mismatch means valid JSON fails validation or
> validated JSON fails to render.

---

## Template Contract

Every template **MUST**:

- Accept an `onCorrect: () => void` prop.
- Call `onCorrect` **only after** the learner demonstrates understanding (typically
  via an explicit Next/Got it action), never automatically on mount.
- Handle wrong answers gracefully — show feedback and allow a retry. Never punish
  (no score loss, no lockout beyond a brief cooldown, no dead ends).
- Be a `'use client'` component (it is interactive and uses React state).
- Work in both light and dark themes — use CSS variables (`--color-bg`,
  `--color-text`, `--color-surface`, `--color-border`, `--color-gold`,
  `--color-correct`, `--color-wrong`, etc.) instead of hard-coded colors.
- Be keyboard accessible — interactive elements should be real `<button>`s or have
  `role`, `tabIndex`, and `onKeyDown` (Enter/Space) handlers, plus accessible
  labels (`aria-label`) where the visible text isn't descriptive.

---

## Testing a Template

- Run the dev gallery to see every template with sample data: start the dev server
  and visit **`/dev/quiz`** (the page renders only when `NODE_ENV === 'development'`).
- Each template should have tests in
  `apps/web/modules/quiz/components/__tests__/` covering at least:
  - **renders** — the prompt/instruction and interactive elements appear.
  - **correct interaction** — completing the task calls `onCorrect`.
  - **wrong interaction** — a wrong attempt shows feedback and does _not_ call
    `onCorrect`, and the learner can retry.
- Run the suite from `apps/web`:

```bash
npx vitest run
```

Tests use Vitest + Testing Library (`jsdom`), configured in
`apps/web/vitest.config.ts` with `apps/web/vitest.setup.ts`.

---

## JSON Schema for Each Template

Shared fields used below:

- `ChallengeOption` = `{ "text": string, "correct": boolean, "feedback": string }`
- `DragMatchItem` = `{ "id": string, "text": string }`
- `BeforeAfterScenario` = `{ "label": string, "text": string }`

### `scenario-choice`

```json
{
  "type": "scenario-choice",
  "situation": "string (required)",
  "options": [{ "text": "string", "correct": true, "feedback": "string" }]
}
```

`options` requires at least 2 entries; exactly one should be `correct: true`.

### `spot-the-force`

```json
{
  "type": "spot-the-force",
  "situation": "string (required)",
  "question": "string (required)",
  "options": [{ "text": "string", "correct": true, "feedback": "string" }]
}
```

`options` requires at least 2 entries; exactly one should be `correct: true`.

### `card-flip`

```json
{
  "type": "card-flip",
  "front": "string (required)",
  "back": "string (required)"
}
```

### `drag-match`

```json
{
  "type": "drag-match",
  "instruction": "string (required)",
  "items": [{ "id": "string", "text": "string" }],
  "correctOrder": ["id1", "id2"]
}
```

`items` and `correctOrder` each require at least 2 entries; every id in
`correctOrder` must match an item `id`.

### `before-after`

```json
{
  "type": "before-after",
  "context": "string (required)",
  "scenarioA": { "label": "string", "text": "string" },
  "scenarioB": { "label": "string", "text": "string" },
  "correctScenario": "A",
  "explanation": "string (required)"
}
```

`correctScenario` must be `"A"` or `"B"`.

### Full quiz document

A challenge never lives alone — it sits inside a quiz document:

```json
{
  "chapterId": "31",
  "challenges": [/* one or more challenge objects from above */],
  "principle": { "text": "string", "subtext": "string" },
  "reflection": "string"
}
```

The document is validated by `quizSchema` in `content/schema/quiz.schema.ts`
(`challenges` must be non-empty).
