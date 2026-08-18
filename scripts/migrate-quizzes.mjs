#!/usr/bin/env node
/**
 * Migrate old-format quiz JSON files (missions 1-17) to the current schema.
 *
 * Old format: { id, title, challenges[...] }
 * New format: { chapterId, challenges[...], principle{text, subtext?}, reflection }
 *
 * Challenge transformations:
 * - scenario-choice: stem → situation, add per-option feedback from explanation
 * - spot-the-force: stem → situation, add 'question' field, add per-option feedback
 * - card-flip: { pairs: [{front, back}...] } → { front, back } (first pair only)
 * - drag-match: { pairs: [{left, right}...] } → { type: 'matching', instruction, pairs }
 * - before-after: { before, after } → { context, scenarioA, scenarioB, correctScenario, explanation }
 *
 * The drag-match → matching change replaces the confusing "join concept→description
 * into one row and reorder" interaction with a real tap-to-pair matching challenge.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = join(__dirname, '..', 'content', 'chapters');

// List of old-format quiz files (missions 1-17 in part-02)
const OLD_MISSIONS = Array.from({ length: 17 }, (_, i) => i + 1);

function migrateScenarioChoice(challenge) {
  const { type, stem, options, explanation } = challenge;
  return {
    type,
    situation: stem,
    options: options.map((opt) => ({
      text: opt.text,
      correct: opt.correct,
      feedback: opt.correct
        ? explanation
        : `Not quite. ${explanation.split('.').slice(0, 2).join('.')}.`,
    })),
  };
}

function migrateSpotTheForce(challenge) {
  const { type, stem, options, explanation } = challenge;
  const qMarkIdx = stem.lastIndexOf('?');
  let situation, question;
  if (qMarkIdx > 0) {
    const beforeQ = stem.substring(0, qMarkIdx + 1);
    const sentences = beforeQ.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      question = sentences.pop();
      situation = sentences.join(' ');
    } else {
      situation = stem;
      question = 'What force is at work here?';
    }
  } else {
    situation = stem;
    question = 'What force is at work here?';
  }

  return {
    type,
    situation,
    question,
    options: options.map((opt) => ({
      text: opt.text,
      correct: opt.correct,
      feedback: opt.correct
        ? explanation
        : `Not quite. ${explanation.split('.').slice(0, 2).join('.')}.`,
    })),
  };
}

function migrateCardFlip(challenge) {
  const { pairs } = challenge;
  // Preserve every pair as its own card-flip challenge instead of dropping all
  // but the first (the old migration kept only pairs[0], losing 3+ cards per
  // mission). Returns an array; the caller flattens it into the challenge list.
  return pairs.map((pair) => ({
    type: 'card-flip',
    front: pair.front,
    back: pair.back,
  }));
}

function migrateDragMatch(challenge) {
  const { pairs } = challenge;
  // New matching format: keep the concept/description pairs verbatim. The
  // Matching component shuffles the right column and checks tap-to-pair matches,
  // so no order/ids are needed.
  return {
    type: 'matching',
    instruction: 'Match each concept to its description:',
    pairs: pairs.map((p) => ({ left: p.left, right: p.right })),
  };
}

// Per-mission before-after explanations, grounded in each chapter's principle.
// Falls back to a generic line for any mission not listed.
const BEFORE_AFTER_EXPLANATIONS = {
  1: 'The stronger response changes the game’s structure — naming it, opening a back-channel, signaling repetition, and making a small testable first move — instead of staying trapped in mutual defection.',
  2: 'The stronger response reads the game as repeated and plays the winning pattern: cooperate first, retaliate against defection immediately, then forgive — rather than being unconditionally nice or tough.',
  3: 'The stronger response first asks whether the pie is truly fixed, then works to grow it — extending the horizon, restructuring, investing in the other side — instead of fighting over a slice.',
  4: 'The stronger response sends a signal expensive enough to be impossible to fake, because people don’t believe cheap claims — commitment is proven by cost, not words.',
  5: 'The stronger response optimizes for obviousness — making the option prominent, simple, and easy to converge on — because coordination is won by the most obvious choice, not the best one.',
  6: 'The stronger response builds a structural commitment that makes breaking the promise costlier than keeping it, because structure outlasts fluctuating motivation.',
  7: 'The stronger response diagnoses the game before acting — moving first when it rewards commitment, last when it rewards information — instead of assuming going first always wins.',
  8: 'The stronger response asks whether the convention is genuinely good or merely locked in, and looks for a moment of coordinated switching, instead of following it unquestioned.',
  9: 'The stronger response reads the signal’s economics — its cost, who can afford it, and its audience — recognizing that aggressive signaling betrays uncertain status.',
  10: 'The stronger response builds mechanisms that make hidden information visible — warranties, trials, reputation, verifiable history — instead of guessing across an information gap.',
  11: 'The stronger response tracks patterns and base rates rather than body language, judging credibility by whether the person has actually followed through before.',
  12: 'The stronger response sets a maximum in advance and walks away above it, recognizing that winning a contested auction is itself evidence of overpaying.',
  13: 'The stronger response treats every interaction as a permanent data point and protects reputation’s compound returns over any single transaction’s gain.',
  14: 'The stronger response punishes defection immediately, then offers a conditional path back to cooperation — because permanent punishment is the worst outcome in games that must continue.',
  15: 'The stronger response redesigns the game — making contributions visible, lowering cooperation costs, shrinking the group — because moral appeal alone cannot fix a collective-action problem.',
  16: 'The stronger response asks whether the spending improves its absolute position or only its relative one, and moves to escape or redefine the competition rather than feed the race.',
  17: 'The stronger response changes the game so that honest, long-term behavior is also the self-interested move — designing better rules instead of demanding better people.',
};

const GENERIC_BEFORE_AFTER_EXPLANATION =
  'The stronger response shows structural awareness — it recognizes the game and changes it, rather than just playing harder within the existing frame.';

function migrateBeforeAfter(challenge, id) {
  const { before, after } = challenge;
  // Old: { before: {label, text}, after: {label, text} }
  // New: { context, scenarioA, scenarioB, correctScenario, explanation }
  // 'after' is always the improved response. Placing it in slot B every time
  // makes the correct answer trivially guessable ("always B"), so we vary the
  // slot by mission-id parity and keep the explanation position-neutral.
  const correctInA = id % 2 === 1;
  const improved = { label: after.label, text: after.text };
  const trapped = { label: before.label, text: before.text };

  return {
    type: 'before-after',
    context: 'Which response shows better understanding of the underlying dynamics?',
    scenarioA: correctInA ? improved : trapped,
    scenarioB: correctInA ? trapped : improved,
    correctScenario: correctInA ? 'A' : 'B',
    explanation: BEFORE_AFTER_EXPLANATIONS[id] ?? GENERIC_BEFORE_AFTER_EXPLANATION,
  };
}

function migrateChallenge(challenge, id) {
  switch (challenge.type) {
    case 'scenario-choice':
      return migrateScenarioChoice(challenge);
    case 'spot-the-force':
      return migrateSpotTheForce(challenge);
    case 'card-flip':
      return migrateCardFlip(challenge);
    case 'drag-match':
      return migrateDragMatch(challenge);
    case 'before-after':
      return migrateBeforeAfter(challenge, id);
    default:
      console.warn(`  ⚠️  Unknown challenge type: ${challenge.type}`);
      return challenge;
  }
}

function extractPrinciple(chapterPath) {
  if (!existsSync(chapterPath))
    return { text: 'Understand the structure, not just the symptoms.' };
  const chapter = JSON.parse(readFileSync(chapterPath, 'utf-8'));
  const principleContent = chapter.sections?.principle?.content;
  if (!principleContent)
    return { text: chapter.title || 'Understand the structure, not just the symptoms.' };

  const paragraphs = principleContent.split('\n\n').filter((p) => p.trim());
  const text = paragraphs[0].replace(/\n/g, ' ').trim();
  const subtext =
    paragraphs.length > 1
      ? paragraphs[1].replace(/\n/g, ' ').replace(/- \*\*/g, '').replace(/\*\*/g, '').trim()
      : undefined;

  const result = { text };
  if (subtext && subtext.length < 300) result.subtext = subtext;
  return result;
}

function generateReflection(chapterPath) {
  if (!existsSync(chapterPath))
    return 'What game are you currently playing? Could you change its structure?';
  const chapter = JSON.parse(readFileSync(chapterPath, 'utf-8'));

  const reflections = {
    1: "Think of a situation where you and someone else are stuck in mutual defection. What structural change — not moral appeal — could make cooperation the rational choice for both of you?",
    2: "In your most important repeated relationship (work or personal), are you being 'nice, retaliating, and forgiving' — or are you holding grudges that block return to cooperation?",
    3: "Where in your life are you treating an expandable pie as fixed? What would it look like to grow it instead of fighting over slices?",
    4: "What costly signal could you send right now that would be impossible to fake — and would change how someone important sees your commitment?",
    5: "What's the focal point in your team or industry that everyone follows without questioning? Did someone design it, or did it emerge by accident?",
    6: "What commitment would you make today if you could burn the ships behind you? What future option are you keeping open that's actually keeping you stuck?",
    7: "In your current most important negotiation or decision, is it a first-mover or last-mover game? Are you playing the timing correctly?",
    8: "What convention in your work are you following just because 'that's how it's done'? Is it truly locked in, or merely assumed to be?",
    9: "Where are you signaling too hard — spending resources to prove something that secure people wouldn't need to prove?",
    10: "In your last major purchase or hire, what did the other side know that you didn't? What mechanism could have made that information visible?",
    11: "Think of someone whose threats or promises you're uncertain about. What pattern of their past behavior tells you whether they're bluffing?",
    12: "Where are you in a competitive bidding situation right now? Is winning actually evidence that you overvalued what you're fighting for?",
    13: "If someone investigated your last five decisions, would they find a consistent pattern — or would they see someone optimizing for short-term gains at reputation's expense?",
    14: "Is there someone you're permanently punishing — refusing to let back into cooperation — where the cost of the grudge now exceeds the original offense?",
    15: "What collective action problem is your team or organization stuck in? Which of the structural conditions for cooperation is missing?",
    16: "What arms race are you in — spending more and more just to stay in the same relative position? Could you compete on a different dimension instead?",
    17: "In a system that's producing bad outcomes around you, which of the four building blocks (visibility, memory, consequences, symmetry) is broken — and could you fix it?",
  };

  return reflections[chapter.id] || 'What game are you currently playing? Could you change its structure?';
}

// --- Main migration ---
let migrated = 0;
let errors = 0;

for (const id of OLD_MISSIONS) {
  const quizPath = join(CONTENT_ROOT, 'part-02', String(id), `${id}.quiz.json`);
  const chapterPath = join(CONTENT_ROOT, 'part-02', String(id), `${id}.json`);

  if (!existsSync(quizPath)) {
    console.log(`⏭️  Mission ${id}: quiz file not found, skipping`);
    continue;
  }

  const oldQuiz = JSON.parse(readFileSync(quizPath, 'utf-8'));

  if (oldQuiz.chapterId) {
    console.log(`✅ Mission ${id}: already in new format, skipping`);
    continue;
  }

  console.log(`🔄 Mission ${id}: migrating...`);

  try {
    const newChallenges = oldQuiz.challenges.flatMap((c) => migrateChallenge(c, id));
    const principle = extractPrinciple(chapterPath);
    const reflection = generateReflection(chapterPath);

    const newQuiz = {
      chapterId: String(id),
      challenges: newChallenges,
      principle,
      reflection,
    };

    writeFileSync(quizPath, JSON.stringify(newQuiz, null, 2) + '\n');
    console.log(`  ✅ Written: ${quizPath}`);
    migrated++;
  } catch (err) {
    console.error(`  ❌ Error migrating mission ${id}:`, err.message);
    errors++;
  }
}

console.log(`\n📊 Migration complete: ${migrated} migrated, ${errors} errors`);
