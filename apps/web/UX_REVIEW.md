# Devil's Advocate UX Review — A Field Guide to Being Human

A brutally honest pass over every screen and component in `apps/web/`. The goal
is to be useful, not kind. Issues are ranked **P0 (broken/blocking)**, **P1
(serious)**, **P2 (polish)**.

Reviewed at commit state after `176ae0f`. Files read: every page in `app/`,
every component in `modules/{game,map,story,quiz,result}`, both stores, theme
plumbing, `lib/content.ts`, the four game SVG assets, and `content/chapters/part-02/31.json`.

---

## Cross-Cutting Issues (affect multiple screens)

These are the things that will hurt the demo most, regardless of which screen
you land on.

### P0 — The whole "dark/light mode" claim is not real

- There is **no theme toggle anywhere in the UI**. `store/themeStore.ts:16` and
  `shared/hooks/useTheme.ts:23` both define a `toggle()`, but `grep` confirms
  **nothing ever calls it**. The app is permanently stuck on the default
  `data-theme="light"` set in `app/layout.tsx:23`.
- Worse, theming is **inconsistent by construction**. `/map`
  (`app/map/page.tsx:5`) hardcodes `bg-[#1A1A1A] text-white` and the game
  (`GameCanvas.tsx:18` `BG = '#0D0D0D'`, `StartScreen.tsx` `#0D0D0D`) are
  _always dark_. But `/chapter`, `/quiz`, `/result` use the theme CSS variables,
  which default to **light**. So the real user flow is:
  **dark map → dark game → blinding light chapter/quiz/result**. That is a
  jarring full-screen luminance flip mid-flow.
- **Fix:** either commit to one theme, or (a) add a visible toggle in a
  persistent header, and (b) make the map and game read the same CSS variables
  as everything else instead of hardcoding hex.

### P0 — Chapter visual and audio are guaranteed 404s

- `app/chapter/page.tsx:18,22` build `src={`/content/${chapterData.visual}`}`
  and `/content/${chapterData.audio}`→`/content/31-why-do-people-resist-change.svg`and`...mp3`. **There is no `public/content/`directory** —`public/`contains
only`assets/game/`. So `ChapterVisual` renders a broken-image icon inside a
bordered frame (`story/components/ChapterVisual.tsx`), and `AudioPlayer`
(`story/components/AudioPlayer.tsx`) loads nothing: duration is `NaN`→ shows`0:00 / 0:00`, and pressing Play silently fails.
- The chapter page is _one of the five core screens_ and two of its three
  content blocks are dead on arrival.
- **Fix:** add the assets under `public/content/`, or point the paths at real
  files, or render a graceful placeholder when the asset is missing.

### P0 — Progression is fake; nothing the user does sticks

- `store/progressStore.ts` exposes `completeChapter` and `setCurrentChapter`,
  but `grep` confirms **neither is ever called** in app code. The quiz finishing
  (`QuizShell.onComplete`) only navigates; it never records completion.
- Therefore `useMapProgress.ts` always falls back to `FALLBACK_STATUS` (1–3
  done, 4 current, rest locked). **Nodes never unlock. Stars never increase.**
  Finish every quiz and the map looks identical.
- This silently breaks the central loop the app is built around. Users will
  notice "I completed it but nothing changed."

### P1 — The map's nodes all go to the same place

- `modules/map/components/WorldMap.tsx:78` wires **every** node to
  `onClick={() => router.push('/chapter')}` — with no chapter id. So clicking
  node 1 "Hidden Motives" (chapterId `26`) loads the exact same hardcoded
  chapter 31 content as node 4 "Resisting Change." The labels lie.
- **Fix:** route to `/chapter?id=${node.chapterId}` and have the chapter page
  load the matching content instead of the hardcoded `chapter31`.

### P1 — Gold buttons are barely legible in light mode

- `ScenarioChoice.tsx`, `SpotTheForce.tsx`, `CardFlip.tsx` all render their
  primary button as `background: var(--color-gold); color: var(--color-bg)`.
  In light theme that is gold `#c9a227` with **near-white** (`#faf8f3`) text.
  Measured contrast ≈ **2.3:1** — fails WCAG AA for both normal (4.5:1) and
  large (3:1) text.
- Contrast this with `HitInterstitial.tsx` which correctly uses **dark** text
  (`#0D0D0D`) on gold — readable. The quiz/result buttons should do the same.
- **Fix:** use a dark text token on gold surfaces regardless of theme.

### P1 — Score is collected, passed in the URL, then thrown away

- `app/quiz/page.tsx:16` sets `score` as a query param and pushes to `/result`.
  `app/result/page.tsx` reads only `from` — **`score` is never read or
  displayed.** The user grinds through 3 challenges and gets zero feedback on
  how they did.

---

## Screen: Game (`/game`)

`app/game/page.tsx` → `modules/game/components/GameCanvas.tsx` and friends.

### What works

- Solid engineering underneath: DPR-aware canvas sizing (`GameCanvas.tsx:46`),
  delta-time-normalised physics (`onFrame`, line ~118), refs-not-state for the
  hot loop, `prefers-reduced-motion` honored on the start pulse
  (`StartScreen.tsx`). Collision is a clean AABB (`lib/collision.ts`).
- Input is forgiving: space / ArrowUp / tap / click all jump, `touchAction:
manipulation` avoids double-tap-zoom. Good mobile instinct.
- HUD uses `pointerEvents: none` (`GameHUD.tsx:27`) so it never eats jump taps.

### Issues (ranked)

1. **P0 — The four game assets are completely unused.** `public/assets/game/`
   has `ground-tile.svg`, `pipe.svg`, `block.svg`, `cloud.svg`, but
   `GameCanvas.tsx` **never loads an Image, never references the files at all**.
   The ground is a single 2px grey line (`draw()`, line ~78: `strokeStyle =
'#3a3a3a'`), obstacles are white outlined rectangles with a grey X
   (`obstacle.ts` `draw()`), and there are **no clouds**. So the "Mario-style"
   game is a stick figure jumping over crossed-out boxes on a void. The
   previous stage created the assets but nothing wired them in.
2. **P1 — Game feel is extremely bare.** A stick figure (`player.ts:draw`)
   over wireframe rectangles reads as a placeholder, not a game. The obstacle
   "X" pattern actively signals "missing/error" to most users. There is no
   parallax, no horizon, no color — nothing that says "world."
3. **P1 — "Continue Running" silently restarts the game.** After a hit →
   chapter → quiz → result, `result/page.tsx:15` pushes `/game?resume=1`. But
   `GameCanvas` **never reads `resume`** (confirmed by grep). The component
   mounts fresh in `idle` phase and shows the Start screen again. Score and
   distance are gone. The label "Continue Running →" is a lie.
4. **P1 — No fail/restart loop and no pause UI.** `useGameState` has a `paused`
   phase and `pause/resume`, but nothing in the UI triggers them, and there's no
   "you hit something, try again" path that keeps you _in_ the game — every hit
   yanks you out to a chapter. A runner with no way to just keep running will
   frustrate.
5. **P2 — Hit transition is abrupt.** On collision the loop pauses and
   `HitInterstitial` appears the same frame (`GameCanvas.tsx` effect on
   `game.phase`). There is no hit flash, no freeze-frame, no fade. It's an
   instant hard cut from motion to a modal. The modal itself is fine; the
   _entry_ has no impact feedback.
6. **P2 — "gap" obstacle is a lie.** `obstacle.ts` `TYPE_DIMENSIONS.gap`
   renders a _low bar on the ground_, not a gap. Players will read it as just
   another low obstacle to jump, which it is — so the three types are visually
   near-identical (all outlined rects), differing only in proportion.
7. **P2 — Start screen secondary link contrast.** `StartScreen.tsx` "or Go to
   Map" is `#8c8c8c` on `#0D0D0D` (~5.6:1, passes) but visually it reads as
   disabled. Make the only escape hatch look tappable.

### Recommendations

- Actually load and `drawImage` the SVGs: tile `ground-tile.svg` along the
  ground line, draw `pipe.svg`/`block.svg` per obstacle `type`, scatter
  `cloud.svg` with slow parallax. This alone transforms the screen.
- Implement `resume`: read `searchParams.get('resume')`, and persist
  score/distance/obstacle state (e.g., in `useGameState` or a store) so
  returning continues mid-run.
- Add a 100–150ms hit flash (white or red overlay) before the interstitial.

---

## Screen: Map (`/map`)

`app/map/page.tsx` → `modules/map/components/*`.

### What works

- The Mario-overworld _concept_ is right: dotted segments (`MapPath.tsx`
  `strokeDasharray="2 12"` + round caps = real dots), round numbered nodes
  (`MapNode.tsx`), a bouncing gold triangle over the current node
  (`PlayerIndicator.tsx` with a 1s `animateTransform`).
- Status color system is sensible: gold+star = done, white+number = current,
  grey = locked (`styleFor`, `MapNode.tsx:38`).

### Issues (ranked)

1. **P0 — Labels are unreadable on mobile.** The SVG is a fixed `viewBox="0 0
700 500"` scaled to a `max-w-[700px]` container with `px-4`
   (`WorldMap.tsx:46`, `app/map/page.tsx:7`). On a 375px screen the container is
   ~343px, a **0.49× scale**. Node numbers (`fontSize={16}`) render at ~7.8px
   and titles (`fontSize={12}`) at **~5.9px**. That's sub-legible. The
   centerpiece navigation screen fails its own primary breakpoint.
2. **P1 — Nodes are not keyboard-accessible.** `MapNode.tsx` sets
   `role="button"` but there is **no `tabIndex` and no `onKeyDown`**. Keyboard
   and screen-reader users cannot focus or activate a level. (Compare
   `StartScreen.tsx` and `CardFlip.tsx`, which do this correctly.)
3. **P1 — No hover/focus affordance.** Nodes change `cursor` to pointer but have
   **no hover state** (no scale, glow, or stroke change). On a map that mixes
   clickable and locked nodes, there's nothing dynamic to confirm "this one is
   live." The current-node triangle helps, but only for one node.
4. **P1 — "Current" vs "done" can be ambiguous at a glance.** Done nodes are
   gold with a `★`; current is white with a number. On the dark bg the white
   node is high-contrast and prominent, which is good — but there is no textual
   "Start here" or pulsing emphasis beyond the small triangle. New users may not
   know the triangle marks _their_ position.
5. **P2 — Locked node numbers are very dim.** `#777` text on `#333` fill ≈
   2.7:1. Intentional (locked), but the numbers are essentially unreadable; if
   they're decoration, fine, but don't pretend they convey the chapter number.
6. **P2 — Map ignores theme** (see cross-cutting P0). Hardcoded `#1A1A1A`.
7. **P2 — Header title is undersized.** `MapHeader.tsx` h1 is `text-xl`
   (1.25rem) for the _app title_; the subtitle `#888` is ~4.5:1 (just passes).
   The title competes with nothing and feels timid for a landing screen.

### Does it actually look like Mario?

Partly. The dotted paths and numbered nodes land the _layout_ metaphor. But it's
a flat diagram, not an _overworld_: no terrain, no scenery, no tiles, no depth,
single line weight throughout. It reads more "subway map" than "Super Mario
World." The bouncing triangle is the most Mario-feeling element.

### Navigation clarity

Color coding (gold/white/grey) is the only signal for clickable-vs-locked, and
it's reasonable — but undermined by (a) no hover state, (b) every node going to
the same `/chapter` anyway, and (c) `cursor: not-allowed` being the only locked
feedback, which doesn't show on touch.

### Recommendations

- Bump font sizes inside the SVG (numbers ~22–24, titles ~16) or, better, render
  node _titles as HTML_ positioned over the SVG so they don't scale to mush.
- Add `tabIndex={0}` + `onKeyDown` to `MapNode`; add a hover/focus scale or glow.
- Wire `router.push('/chapter?id=${chapterId}')` and load per-node content.

---

## Screen: Chapter / Story (`/chapter`)

`app/chapter/page.tsx` → `modules/story/components/*`.

### What works

- Clean reading column: `max-w-[620px] mx-auto px-4`, sticky back-nav with a
  chapter counter (`page.tsx:9`). Good reading measure.
- Typographic hierarchy in `StorySection.tsx` is genuinely good: tiny uppercase
  letterspaced section labels, 1rem/1.7 body, principle bumped to 1.15rem/600.
  `StoryView.tsx` title at 2rem/1.2/700 is a clear H1.
- Paragraph splitting on blank lines (`StorySection.tsx:33`) handles the JSON
  content well.

### Issues (ranked)

1. **P0 — Hero visual is a broken image** (cross-cutting P0). The very first
   thing below the nav is a 404'd `<img>` in a bordered frame. Terrible first
   impression for the screen.
2. **P0 — Audio player is non-functional** (cross-cutting P0). Shows `0:00 /
0:00`, Play does nothing.
3. **P1 — Audio controls are tiny and unclear.** `AudioPlayer.tsx` uses a
   bare text button ("Play"/"Pause") with `background: none` and **no padding**
   (`btnStyle`). Tap target is just the glyph width — well under 44px. It also
   doesn't look like a control; it looks like a stray word. Use an icon button
   with ≥44px hit area.
4. **P2 — Sticky nav back-target.** "← Map" always goes to `/map` even when the
   user arrived from the game (`?from=game`). Minor, but the quiz page below it
   uses `router.back()` for the same arrow — inconsistent back semantics across
   two adjacent screens.
5. **P2 — "Test Your Understanding" button** (`page.tsx:34`) is fine
   (dark-on-light, full width, good target), but it's the _only_ themed-correct
   primary button while the gold quiz buttons below are not — inconsistent
   button language across the flow.

### Recommendations

- Ship the visual/audio assets or gracefully hide the blocks when missing
  (don't render a broken frame).
- Replace the text Play/Pause with a padded icon button (44×44 min).

---

## Screen: Quiz (`/quiz`)

`app/quiz/page.tsx` → `modules/quiz/components/*`.

### What works

- Three distinct templates is a nice variety: `ScenarioChoice`, `SpotTheForce`,
  `CardFlip`, dispatched cleanly in `QuizShell.tsx:48`.
- Progress dots (`QuizShell.tsx:80`) with done/current/upcoming states and a
  smooth color transition.
- Answer buttons are full-width, left-aligned, `padding: 1rem` → comfortably
  above 44px tap height. Correct/wrong border coloring + a `QuizFeedback` panel
  with a colored left border is clear.
- Card flip uses real 3D (`rotateY`, `backfaceVisibility`) and is keyboard
  operable.

### Issues (ranked)

1. **P1 — Primary "Next →" / "Got it →" buttons fail contrast** (cross-cutting
   P1): gold bg + near-white label in light theme.
2. **P1 — Wrong-answer feedback auto-erases mid-read.** `ScenarioChoice.tsx` /
   `SpotTheForce.tsx`: a wrong pick locks for `RETRY_DELAY_MS = 1500ms` then
   clears `selected`, which **removes the `QuizFeedback` panel**. 1.5s is not
   enough to read an explanation, and the feedback is the _teaching moment_. It
   vanishes before it's absorbed.
3. **P1 — Card flip is a one-way trip with no "wrong" path.** `CardFlip.tsx`
   sets `flipped=true` and can never flip back; there's no question, no choice —
   tapping always calls `onCorrect`. It's a flashcard masquerading as a graded
   challenge, so the "score" is meaningless for these (always counts as solved).
   At minimum let users flip back; ideally make it an actual recall check.
4. **P2 — No question counter text.** Dots show position but there's no "2 of 5"
   for users who don't parse the dot row. The dots are also only `0.625rem`.
5. **P2 — Retry has no visible affordance.** After a wrong answer the buttons
   just re-enable silently after 1.5s. There's no "Try again" cue; the screen
   looks frozen for a second and a half.
6. **P2 — Back arrow uses `router.back()`** (`page.tsx:30`), which can land
   anywhere depending on history (game, chapter, or a refresh dead-end), unlike
   the chapter page's explicit "← Map."

### Recommendations

- Keep wrong-answer feedback visible until the user acts (dismiss/retry button)
  instead of a timed auto-clear.
- Give `CardFlip` a back-flip and either drop it from scoring or make it a real
  question.
- Show "Question X of N" text alongside the dots.

---

## Screen: Result (`/result`)

`app/result/page.tsx` → `modules/result/components/*`.

### What works

- Focused, centered layout (`max-w-[480px] py-16 text-center`).
- `PrincipleReveal.tsx` has a genuinely nice spring scale-in on the star
  (`cubic-bezier(0.34,1.56,0.64,1)`), deferred a frame so it actually animates.
- `ReflectionPrompt.tsx` divider + uppercase label + italic question is a clean,
  calm close. Good hierarchy.

### Issues (ranked)

1. **P1 — The score is never shown** (cross-cutting). The user just answered
   3 challenges and the payoff screen says nothing about performance. The
   `score` param arrives and is dropped.
2. **P1 — "Continue Running →" leads to a restart, not a continue**
   (cross-cutting P0 of game). The CTA promises continuity it can't deliver.
3. **P2 — No transition into the screen.** Only the star animates; the
   principle text and CTA pop in instantly. Given how nicely the star is handled,
   the rest feels unfinished by comparison.
4. **P2 — CTA button style differs again.** `ResultCTA.tsx` uses dark-on-light
   (`bg: var(--color-text)`), which is _correct and readable_ — but it's a third
   distinct primary-button style after the chapter's dark button and the quiz's
   gold buttons. Pick one.
5. **P2 — Same principle/reflection regardless of path.** Always pulls
   `quiz31` (`page.tsx:6`), so every result — from any node or obstacle — shows
   the chapter-31 principle. Tied to the hardcoded-content problem.

### Recommendations

- Render the score ("You got 3 of 3") above or below the principle.
- Fix the resume flow so "Continue Running" is honest, or relabel it.
- Stagger-fade the principle and CTA in after the star.

---

## Summary — Fix in this order

| #   | Severity | Issue                                                             | Where                                          |
| --- | -------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| 1   | P0       | Game SVG assets never loaded/used                                 | `GameCanvas.tsx` draw/onFrame                  |
| 2   | P0       | Chapter visual + audio 404 (no `public/content/`)                 | `chapter/page.tsx:18,22`                       |
| 3   | P0       | Progress never recorded; nodes never unlock                       | `progressStore` unused, `useMapProgress.ts`    |
| 4   | P0       | Theme toggle doesn't exist; map/game hardcode dark vs light pages | `layout.tsx`, `map/page.tsx`, `GameCanvas.tsx` |
| 5   | P0       | Map labels unreadable at 375px (SVG scales text to ~6px)          | `WorldMap.tsx`, `MapNode.tsx`                  |
| 6   | P1       | "Continue Running" restarts the game (`resume` ignored)           | `GameCanvas.tsx`, `result/page.tsx:15`         |
| 7   | P1       | Gold buttons + near-white text fail WCAG AA in light mode         | quiz + result buttons                          |
| 8   | P1       | Score collected but never displayed                               | `quiz/page.tsx:16` → `result/page.tsx`         |
| 9   | P1       | Every map node routes to the same `/chapter`                      | `WorldMap.tsx:78`                              |
| 10  | P1       | Map nodes not keyboard-accessible; no hover state                 | `MapNode.tsx`                                  |
| 11  | P1       | Wrong-answer feedback auto-clears in 1.5s                         | `ScenarioChoice.tsx`, `SpotTheForce.tsx`       |
| 12  | P1       | Audio Play/Pause tap target far below 44px                        | `AudioPlayer.tsx`                              |

**Bottom line:** the architecture and component craft are good, but the _product
is hollow where it counts._ The game doesn't use its own art, the chapter's
media is broken, progression doesn't persist, "continue" doesn't continue, and
the one screen built for mobile (the map) is illegible on mobile. None of these
are deep — they're wiring gaps — but together they mean a first-time user hits a
broken image, plays a wireframe, and ends on a screen that misreports what
happens next. Fix the five P0s and this goes from "demo skeleton" to "real."
