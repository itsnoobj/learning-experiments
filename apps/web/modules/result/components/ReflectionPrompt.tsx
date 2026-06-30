export interface ReflectionPromptProps {
  /** The reflection question posed to the learner. */
  question: string;
}

/**
 * A reflection block presented as a soft surface card: a thought-bubble led
 * "Reflect" label above an italicized question that invites the learner to
 * apply the principle to their own context.
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
      }}
    >
      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4em',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.7rem',
          fontWeight: 600,
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
          fontSize: '1.05rem',
          lineHeight: 1.6,
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
