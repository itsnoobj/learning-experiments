'use client';

import { ScenarioChoice, SpotTheForce, CardFlip, DragMatch, BeforeAfter } from '@/modules/quiz';

const noop = () => {};

const SCENARIO_CHOICE = {
  situation: 'Test scenario',
  options: [
    { text: 'A', correct: false, feedback: 'Nope' },
    { text: 'B', correct: true, feedback: 'Yes!' },
    { text: 'C', correct: false, feedback: 'Nah' },
  ],
};

const SPOT_THE_FORCE = {
  situation: 'Test spot',
  question: 'Which force?',
  options: [
    { text: 'Ego', correct: true, feedback: 'Yes' },
    { text: 'Fear', correct: false, feedback: 'No' },
    { text: 'Status', correct: false, feedback: 'Nah' },
  ],
};

const CARD_FLIP = {
  front: 'Common belief goes here',
  back: 'The actual principle that corrects it',
};

const DRAG_MATCH = {
  instruction: 'Put these in order',
  items: [
    { id: 'a', text: 'Name the loss' },
    { id: 'b', text: 'Make first step tiny' },
    { id: 'c', text: 'Let early adopters prove it' },
    { id: 'd', text: 'Protect status' },
  ],
  correctOrder: ['a', 'b', 'c', 'd'],
};

const BEFORE_AFTER = {
  context: 'Your team resists a new tool.',
  scenarioA: {
    label: 'Manager A',
    text: 'Presents 50 slides of data proving the tool is better.',
  },
  scenarioB: {
    label: 'Manager B',
    text: "Says 'I know this means relearning. Let's try it for one task.'",
  },
  correctScenario: 'B' as const,
  explanation: 'Manager B acknowledged the loss first.',
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-lg)',
      }}
    >
      <h2
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-gold)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

/**
 * Dev-only gallery of every quiz template with sample data.
 * Renders nothing outside development to avoid shipping to production.
 */
export default function DevQuizPage() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 'var(--spacing-lg)' }}>
        Quiz Templates (dev)
      </h1>

      <Section label="ScenarioChoice">
        <ScenarioChoice
          situation={SCENARIO_CHOICE.situation}
          options={SCENARIO_CHOICE.options}
          onCorrect={noop}
        />
      </Section>

      <Section label="SpotTheForce">
        <SpotTheForce
          situation={SPOT_THE_FORCE.situation}
          question={SPOT_THE_FORCE.question}
          options={SPOT_THE_FORCE.options}
          onCorrect={noop}
        />
      </Section>

      <Section label="CardFlip">
        <CardFlip front={CARD_FLIP.front} back={CARD_FLIP.back} onCorrect={noop} />
      </Section>

      <Section label="DragMatch">
        <DragMatch
          instruction={DRAG_MATCH.instruction}
          items={DRAG_MATCH.items}
          correctOrder={DRAG_MATCH.correctOrder}
          onCorrect={noop}
        />
      </Section>

      <Section label="BeforeAfter">
        <BeforeAfter
          context={BEFORE_AFTER.context}
          scenarioA={BEFORE_AFTER.scenarioA}
          scenarioB={BEFORE_AFTER.scenarioB}
          correctScenario={BEFORE_AFTER.correctScenario}
          explanation={BEFORE_AFTER.explanation}
          onCorrect={noop}
        />
      </Section>
    </main>
  );
}
