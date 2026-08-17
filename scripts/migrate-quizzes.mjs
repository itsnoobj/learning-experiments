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
  const pair = pairs[0];
  return {
    type: 'card-flip',
    front: pair.front,
    back: pair.back,
  };
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
    explanation:
      'The stronger response shows structural awareness — it recognizes the game and changes it, rather than just playing harder within the existing frame.',
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
    const newChallenges = oldQuiz.challenges.map((c) => migrateChallenge(c, id));
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
