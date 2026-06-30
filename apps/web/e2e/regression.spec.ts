import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end regression suite for the "Field Guide to Being Human" app.
 *
 * Covers navigation/locking, the chapter reader, the quiz flow, the result
 * screen, the canvas game, audio rendering, and cross-navigation. The app is
 * served by a Next.js dev server already running on http://localhost:3000.
 *
 * Content facts the suite relies on (from content/available.json + hierarchy):
 *   - Available chapters: 1, 2, 3, 4, 5, 31
 *   - World 1 "The Mirror" and World 2 "The Crowd" are unlocked; worlds 3-10
 *     are locked ("coming soon").
 *   - In World 1: region A "Identity" is unlocked; B/C/D are locked.
 *   - In region A: missions 1-5 are unlocked, 6-8 are locked.
 *   - Chapter 1 quiz has 4 challenges: scenario-choice, spot-the-force,
 *     card-flip, before-after.
 */

const CHAPTER_1_TITLE = 'Why Do I Defend Decisions I Know Are Wrong?';
const CHAPTER_1_PRINCIPLE =
  "You don't defend the decision — you defend the self that made it.";

/**
 * Drive the full chapter-1 quiz to completion by answering each of its four
 * challenges correctly. Leaves the browser navigating to /result.
 */
async function completeChapter1Quiz(page: Page): Promise<void> {
  // 1) scenario-choice — pick the "reasonable call" response, then continue.
  await page.getByRole('button', { name: /I made a reasonable call/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();

  // 2) spot-the-force — the driving force is identity fused to the decision.
  await page.getByRole('button', { name: /Identity fused to the decision/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();

  // 3) card-flip — flip the card, then acknowledge.
  await page.getByRole('button', { name: 'Flip card' }).click();
  await page.getByRole('button', { name: /Got it/ }).click();

  // 4) before-after — Marcus Aurelius (scenario B) applied the principle.
  await page.getByRole('button', { name: /Marcus Aurelius/ }).click();
  await page.getByRole('button', { name: 'Next →' }).click();
}

test.describe('1. Navigation & Locking', () => {
  test('landing page loads with Map and Game CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Explore the Map/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Play the Game/ })).toBeVisible();
  });

  test('worlds page: World 1 & 2 clickable, others locked', async ({ page }) => {
    await page.goto('/worlds');

    // Unlocked worlds are interactive (role=button).
    await expect(page.getByRole('button', { name: /The Mirror/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Crowd/ })).toBeVisible();

    // Worlds 3-10 are locked: role=img with "coming soon" in the label.
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(8);
  });

  test('clicking a locked world does not navigate', async ({ page }) => {
    await page.goto('/worlds');
    const lockedWorld = page.getByRole('img', { name: /The Campfire — coming soon/ });
    await expect(lockedWorld).toBeVisible();
    await lockedWorld.click({ force: true });
    // No handler is attached to locked zones, so we stay on /worlds.
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/worlds');
  });

  test('World 1 shows Identity clickable, Ego/Motivation/Emotions locked', async ({
    page,
  }) => {
    await page.goto('/worlds/1');
    await expect(page.getByRole('button', { name: /Identity/ })).toBeVisible();
    // Ego, Motivation, Emotions regions are locked.
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(3);
  });

  test('Identity region shows missions 1-5 clickable, 6-8 locked', async ({ page }) => {
    await page.goto('/worlds/1/region/A');
    // Five unlocked mission nodes (role=button, "... (chapter N)").
    await expect(page.getByRole('button', { name: /chapter \d+/ })).toHaveCount(5);
    // Three locked mission nodes (6-8) render as role=img "coming soon".
    await expect(page.getByRole('img', { name: /coming soon/ })).toHaveCount(3);
  });

  test('direct /chapter/9 shows a locked "coming soon" page (not a 404)', async ({
    page,
  }) => {
    await page.goto('/chapter/9');
    await expect(page.getByText('🔒')).toBeVisible();
    await expect(page.getByText(/being written/)).toBeVisible();
  });
});

test.describe('2. Chapter Page', () => {
  test('/chapter/1 renders title, illustration, audio, sections and links', async ({
    page,
  }) => {
    await page.goto('/chapter/1');

    // Title.
    await expect(
      page.getByRole('heading', { name: CHAPTER_1_TITLE }),
    ).toBeVisible();

    // Illustration image.
    await expect(page.getByRole('img', { name: 'Chapter illustration' })).toBeVisible();

    // Audio player Play button.
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

    // All seven story sections are present (headers).
    for (const header of [
      'situation',
      'The Story',
      'The Contrast',
      'principle',
      'Why It Happens',
      'The Trap',
      'The Move',
    ]) {
      await expect(
        page.getByRole('heading', { name: header, exact: true }),
      ).toBeVisible();
    }

    // Quiz link points to /quiz/1.
    const quizLink = page.getByRole('link', { name: /Test Your Understanding/ });
    await expect(quizLink).toHaveAttribute('href', '/quiz/1');

    // Back link to the map is present.
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
    await expect(page.getByText(/You picked a vendor three months ago/)).toBeVisible();
    // The correct option is present as a button.
    await expect(
      page.getByRole('button', { name: /I made a reasonable call/ }),
    ).toBeVisible();
  });

  test('selecting the wrong answer shows feedback and does not advance', async ({
    page,
  }) => {
    await page.goto('/quiz/1');
    await page
      .getByRole('button', { name: /List every reason the choice was justified/ })
      .click();
    // Feedback panel (role=status) appears.
    await expect(page.getByText(/Winning the argument keeps a sinking choice/)).toBeVisible();
    // No "Next" button yet — the challenge is not solved.
    await expect(page.getByRole('button', { name: 'Next →' })).toHaveCount(0);
  });

  test('selecting the correct answer reveals a Next button', async ({ page }) => {
    await page.goto('/quiz/1');
    await page.getByRole('button', { name: /I made a reasonable call/ }).click();
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
  });

  test('completing all challenges navigates to /result?chapter=1', async ({ page }) => {
    await page.goto('/quiz/1');
    await completeChapter1Quiz(page);
    await page.waitForURL(/\/result\?.*chapter=1/);
    expect(new URL(page.url()).searchParams.get('chapter')).toBe('1');
  });
});

test.describe('4. Result Page', () => {
  test('/result?chapter=1 shows principle, reflection and a continue CTA', async ({
    page,
  }) => {
    await page.goto('/result?chapter=1');

    await expect(page.getByText(CHAPTER_1_PRINCIPLE)).toBeVisible();
    // Reflection question.
    await expect(page.getByText(/Think of a decision you're quietly over-defending/)).toBeVisible();
    // Primary CTA back to the map.
    await expect(page.getByRole('button', { name: /Back to Map/ })).toBeVisible();
  });
});

test.describe('5. Game Flow', () => {
  test('/game loads a start screen', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByText('Tap to Run')).toBeVisible();
  });

  test('pressing Space starts the run (start screen disappears, HUD appears)', async ({
    page,
  }) => {
    await page.goto('/game');
    await expect(page.getByText('Tap to Run')).toBeVisible();
    await page.locator('body').click(); // ensure the window has focus
    await page.keyboard.press('Space');
    // Start overlay is gone and the score HUD is shown.
    await expect(page.getByText('Tap to Run')).toHaveCount(0);
    await expect(page.getByRole('status', { name: /Score:/ })).toBeVisible();
  });

  test('/chapter/31?from=game shows a "← Game" back link (not "← Map")', async ({
    page,
  }) => {
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
  test('chapter quiz link navigates to the matching quiz', async ({ page }) => {
    await page.goto('/chapter/1');
    await page.getByRole('link', { name: /Test Your Understanding/ }).click();
    await page.waitForURL(/\/quiz\/1/);
    await expect(page.getByText(/You picked a vendor three months ago/)).toBeVisible();
  });

  test('quiz completion surfaces the correct principle on the result page', async ({
    page,
  }) => {
    await page.goto('/quiz/1');
    await completeChapter1Quiz(page);
    await page.waitForURL(/\/result/);
    await expect(page.getByText(CHAPTER_1_PRINCIPLE)).toBeVisible();
  });

  test('chapter "← Map" back link returns to the world map', async ({ page }) => {
    await page.goto('/chapter/1');
    await page.getByRole('link', { name: '← Map' }).click();
    // /map redirects to /worlds.
    await page.waitForURL(/\/(map|worlds)/);
    await expect(page.getByRole('img', { name: /choose a world/ })).toBeVisible();
  });

  test('game chapter "← Game" back link returns to the game', async ({ page }) => {
    await page.goto('/chapter/31?from=game');
    await page.getByRole('link', { name: '← Game' }).click();
    await page.waitForURL(/\/game/);
  });
});
