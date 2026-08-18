import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end regression suite for the "Field Guide to Being Human" app.
 *
 * Covers navigation/locking, the chapter reader, the quiz flow (including the
 * matching challenge), the result screen, the canvas game, audio rendering, and
 * cross-navigation. The app is served by a Next.js dev server already running
 * on http://localhost:3000.
 *
 * Current content facts the suite relies on (post world-reorder + renumber,
 * with all authored chapters 1-61 unlocked):
 *   - Worlds 0 "The Game Board", 1 "The Mirror", 2 "The Crowd" are unlocked;
 *     worlds 3-10 have no authored regions and render as "coming soon" (8).
 *   - World 0 has 4 regions (A-D), all unlocked. Region A "The Rules of the
 *     Game" holds missions 1-4.
 *   - Mission/chapter 1 is "Why Does Cooperation Collapse Even When Everyone
 *     Benefits?" and its quiz has 5 challenges: scenario-choice, spot-the-force,
 *     card-flip, matching, before-after.
 *   - Chapters 62+ are in the hierarchy but not yet authored, so they render a
 *     locked "coming soon" page.
 */

const CH1_TITLE = 'Why Does Cooperation Collapse Even When Everyone Benefits?';
const CH1_SCENARIO = /Two competing SaaS companies are locked in a pricing war/;
const CH1_PRINCIPLE = /The prisoner's dilemma isn't a puzzle to solve/;
const CH1_REFLECTION = /Think of a situation where you and someone else/;

/** Concept -> description pairs for mission 1's matching challenge. */
const CH1_MATCH_PAIRS: [string, string][] = [
  ['Kennedy-Dobrynin back-channel', 'Communication in a non-cooperative game'],
  [
    "WWI trench soldiers seeing each other's faces",
    'Making identities visible to enable cooperation',
  ],
  ['Military rotating units to prevent truces', 'Preventing repeated-game conditions from forming'],
  [
    'Both sides secretly wanting the same outcome but not acting',
    "The structure of the prisoner's dilemma",
  ],
  [
    'Public removal of Cuban missiles, quiet removal of Turkish ones',
    "Removing audience cost so cooperation doesn't look like weakness",
  ],
];

/**
 * Drive the full chapter-1 quiz to completion by answering each of its five
 * challenges correctly. Leaves the browser navigating to the result page.
 */
async function completeChapter1Quiz(page: Page): Promise<void> {
  // 1) scenario-choice — the pricing war is a prisoner's dilemma.
  await page.getByRole('button', { name: /It's a prisoner's dilemma/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();

  // 2) spot-the-force — fear of the sucker's payoff drives defection.
  await page.getByRole('button', { name: /Fear — being the one who cooperates/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();

  // 3) card-flip — flip the card, then acknowledge.
  await page.getByRole('button', { name: 'Flip card' }).click();
  await page.getByRole('button', { name: /Got it/ }).click();

  // 4) matching — tap each concept, then its description.
  for (const [concept, description] of CH1_MATCH_PAIRS) {
    await page.getByRole('button', { name: concept }).click();
    await page.getByRole('button', { name: description }).click();
  }
  await page.getByRole('button', { name: 'Next →' }).click();

  // 5) before-after — "Breaking the structure" is the stronger response.
  await page.getByRole('button', { name: /Breaking the structure/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();
}

test.describe('1. Navigation & Locking', () => {
  test('landing page loads with Map and Game CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Explore the Map/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Play the Game/ })).toBeVisible();
  });

  test('worlds page: Worlds 0-2 clickable, worlds 3-10 coming soon', async ({ page }) => {
    await page.goto('/worlds');

    // Unlocked worlds are interactive (role=button).
    await expect(page.getByRole('button', { name: /The Game Board/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Mirror/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Crowd/ })).toBeVisible();

    // Worlds 3-10 have no authored regions: role=img with "coming soon".
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(8);
  });

  test('clicking a locked world does not navigate', async ({ page }) => {
    await page.goto('/worlds');
    const lockedWorld = page.getByRole('img', { name: /The Campfire — coming soon/ });
    await expect(lockedWorld).toBeVisible();
    await lockedWorld.click({ force: true });
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/worlds');
  });

  test('World 0 shows all four regions unlocked', async ({ page }) => {
    await page.goto('/worlds/0');
    // Regions A-D are all authored/unlocked → four region buttons, none locked.
    await expect(page.getByRole('button', { name: /missions complete/ })).toHaveCount(4);
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(0);
  });

  test('Region A shows missions 1-4 clickable', async ({ page }) => {
    await page.goto('/worlds/0/region/A');
    // Four unlocked mission nodes (role=button, "... (chapter N)"), none locked.
    await expect(page.getByRole('button', { name: /chapter \d+/ })).toHaveCount(4);
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(0);
  });

  test('direct /chapter/62 shows a locked "coming soon" page (not a 404)', async ({ page }) => {
    await page.goto('/chapter/62');
    await expect(page.getByText('🔒')).toBeVisible();
    await expect(page.getByText(/being written/)).toBeVisible();
  });
});

test.describe('2. Chapter Page', () => {
  test('/chapter/1 renders title, illustration, audio, sections and links', async ({ page }) => {
    await page.goto('/chapter/1');

    await expect(page.getByRole('heading', { name: CH1_TITLE })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Chapter illustration' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

    // Expanded sections render as headings.
    for (const header of ['The Situation', 'The Story', 'The Principle']) {
      await expect(page.getByRole('heading', { name: header, exact: true })).toBeVisible();
    }
    // Collapsible sections render their labels.
    await expect(page.getByText('The Contrast', { exact: true })).toBeVisible();
    await expect(page.getByText('The Move', { exact: true })).toBeVisible();

    // Quiz link points to the hierarchical quiz route for mission 1.
    const quizLink = page.getByRole('link', { name: /Test Your Understanding/ });
    await expect(quizLink).toHaveAttribute('href', '/worlds/0/region/A/mission/1/quiz');

    // Back link to the region map.
    await expect(page.getByRole('link', { name: '← Map' })).toBeVisible();
  });

  test('audio Play button toggles to Pause on click', async ({ page }) => {
    await page.goto('/chapter/1');
    const playBtn = page.getByRole('button', { name: 'Play' });
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });
});

test.describe('3. Quiz Flow', () => {
  test('first challenge is a scenario-choice with situation text', async ({ page }) => {
    await page.goto('/quiz/1');
    await expect(page.getByText(CH1_SCENARIO)).toBeVisible();
    await expect(page.getByRole('button', { name: /It's a prisoner's dilemma/ })).toBeVisible();
  });

  test('selecting the wrong answer shows feedback and does not advance', async ({ page }) => {
    await page.goto('/quiz/1');
    await page.getByRole('button', { name: /The market is truly zero-sum/ }).click();
    // Feedback panel (role=status) appears...
    await expect(page.getByRole('status').filter({ hasText: /Not quite/ })).toBeVisible();
    // ...and the challenge is not solved (no Next button yet).
    await expect(page.getByRole('button', { name: 'Next →' })).toHaveCount(0);
  });

  test('selecting the correct answer reveals a Next button', async ({ page }) => {
    await page.goto('/quiz/1');
    await page.getByRole('button', { name: /It's a prisoner's dilemma/ }).click();
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
  });

  test('completing all challenges navigates to the result page', async ({ page }) => {
    await page.goto('/quiz/1');
    await completeChapter1Quiz(page);
    await page.waitForURL(/\/result/);
    expect(page.url()).toMatch(/mission\/1\/result/);
  });
});

test.describe('4. Result Page', () => {
  test('result page shows principle, reflection and a continue CTA', async ({ page }) => {
    await page.goto('/worlds/0/region/A/mission/1/result?score=5');
    await expect(page.getByText(CH1_PRINCIPLE)).toBeVisible();
    await expect(page.getByText(CH1_REFLECTION)).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Map/ })).toBeVisible();
  });
});

test.describe('5. Game Flow', () => {
  test('/game loads a start screen', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByText('Tap to Run')).toBeVisible();
  });

  test('pressing Space starts the run (start screen disappears, HUD appears)', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByText('Tap to Run')).toBeVisible();
    await page.locator('body').click();
    await page.keyboard.press('Space');
    await expect(page.getByText('Tap to Run')).toHaveCount(0);
    await expect(page.getByRole('status', { name: /Score:/ })).toBeVisible();
  });

  test('/chapter/31?from=game shows a "← Game" back link (not "← Map")', async ({ page }) => {
    await page.goto('/chapter/31?from=game');
    await expect(page.getByRole('link', { name: '← Game' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← Map' })).toHaveCount(0);
  });
});

test.describe('6. Audio Graceful Degradation', () => {
  test('/chapter/31 renders the audio player (MP3 exists)', async ({ page }) => {
    await page.goto('/chapter/31');
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  });
});

test.describe('7. Cross-navigation', () => {
  test('chapter quiz link navigates to the quiz', async ({ page }) => {
    await page.goto('/chapter/1');
    await page.getByRole('link', { name: /Test Your Understanding/ }).click();
    await page.waitForURL(/mission\/1\/quiz/);
    await expect(page.getByText(CH1_SCENARIO)).toBeVisible();
  });

  test('quiz completion surfaces the correct principle on the result page', async ({ page }) => {
    await page.goto('/quiz/1');
    await completeChapter1Quiz(page);
    await page.waitForURL(/\/result/);
    await expect(page.getByText(CH1_PRINCIPLE)).toBeVisible();
  });

  test('chapter "← Map" back link returns to the region map', async ({ page }) => {
    await page.goto('/chapter/1');
    await page.getByRole('link', { name: '← Map' }).click();
    await page.waitForURL(/\/worlds\/0\/region\/A/);
    await expect(page.getByRole('heading', { name: 'The Rules of the Game' })).toBeVisible();
  });

  test('game chapter "← Game" back link returns to the game', async ({ page }) => {
    await page.goto('/chapter/31?from=game');
    await page.getByRole('link', { name: '← Game' }).click();
    await page.waitForURL(/\/game/);
  });
});
