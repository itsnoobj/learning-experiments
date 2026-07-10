export type StorySectionType =
  'situation' | 'story' | 'contrast' | 'principle' | 'psychology' | 'trap' | 'move';

export interface StorySectionProps {
  /** Which kind of section this is; drives the header label and styling. */
  type: StorySectionType;
  /** Optional override for the section header label. */
  title?: string;
  /** Section body text; blank lines split it into paragraphs. */
  content: string;
  /** If true, section renders inside a collapsible `<details>` element. */
  collapsible?: boolean;
}

/** Default labels for section types when no title override is provided. */
const DEFAULT_LABELS: Record<StorySectionType, string> = {
  situation: 'The Situation',
  story: 'The Story',
  contrast: 'A Different Angle',
  principle: 'The Principle',
  psychology: 'Why It Happens',
  trap: 'The Trap',
  move: 'The Move',
};

/** Renders one labelled section of a chapter with type-aware styling. */
export function StorySection({ type, title, content, collapsible = false }: StorySectionProps) {
  const isPrinciple = type === 'principle';
  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const label = title ?? DEFAULT_LABELS[type] ?? type;

  const header = (
    <h2
      style={{
        fontSize: isPrinciple ? '1.3rem' : '1.1rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: isPrinciple ? 'var(--color-gold)' : 'var(--color-text-dim)',
        margin: '0 0 var(--spacing-sm)',
        cursor: collapsible ? 'pointer' : undefined,
      }}
    >
      {label}
    </h2>
  );

  const body = paragraphs.map((paragraph, index) => (
    <p
      key={index}
      style={{
        fontSize: isPrinciple ? '1.2rem' : '1rem',
        fontWeight: isPrinciple ? 600 : 400,
        fontStyle: isPrinciple ? 'italic' : 'normal',
        lineHeight: 1.7,
        margin: '0 0 var(--spacing-md)',
        color: isPrinciple ? 'var(--color-gold)' : 'var(--color-text)',
      }}
    >
      {paragraph}
    </p>
  ));

  if (collapsible) {
    return (
      <details style={{ marginBottom: 'var(--spacing-xl, 2.5rem)' }}>
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            background: 'var(--color-surface, rgba(255,255,255,0.03))',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-gold, #c9a84c)',
              transition: 'transform 0.2s',
            }}
            className="details-arrow"
            aria-hidden="true"
          >
            ▶
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-dim)',
            }}
          >
            {label}
          </span>
        </summary>
        <div style={{ marginTop: 'var(--spacing-md, 1rem)', paddingLeft: '0.25rem' }}>{body}</div>
      </details>
    );
  }

  return (
    <section style={{ marginBottom: 'var(--spacing-xl, 2.5rem)' }}>
      {header}
      {body}
    </section>
  );
}
