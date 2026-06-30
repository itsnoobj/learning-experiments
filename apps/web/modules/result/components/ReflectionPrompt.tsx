export interface ReflectionPromptProps {
  /** The reflection question posed to the learner. */
  question: string;
}

const KEYFRAMES = `
@keyframes reflect-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * A reflection block presented as a soft surface card with entrance animation.
 * A thought-bubble led "Reflect" label above an italicized question that
 * invites the learner to apply the principle to their own context.
 */
export function ReflectionPrompt({ question }: ReflectionPromptProps) {
  return (
    <div
      style={{
        marginTop: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        animation: 'reflect-in 0.4s ease-out 1.1s both',
      }}
    >
      <style>{KEYFRAMES}</style>
      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4em',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-text-dim)',
          margin: '0 0 var(--spacing-md)',
        }}
      >
        <span role="img" aria-label="thought bubble">
          💭
        </span>
        Reflect
      </p>
      <p
        style={{
          fontStyle: 'italic',
          fontSize: '1.1rem',
          lineHeight: 1.7,
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        {question}
      </p>
    </div>
  );
}

export default ReflectionPrompt;
