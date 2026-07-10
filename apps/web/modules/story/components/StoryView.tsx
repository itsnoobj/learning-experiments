import { StorySection } from './StorySection';
import type { StorySectionType } from './StorySection';

/** A single section's data (without the type key, which comes from the object key). */
interface SectionData {
  title?: string;
  content: string;
}

/** Sections as an object keyed by section type. */
type StorySections = Partial<Record<StorySectionType, SectionData>>;

interface StoryViewProps {
  /** Chapter title rendered as the page heading. */
  title: string;
  /** Sections keyed by type that make up the chapter body. */
  sections: StorySections;
}

/** Canonical rendering order for section types. */
const SECTION_ORDER: StorySectionType[] = [
  'situation',
  'story',
  'contrast',
  'principle',
  'psychology',
  'trap',
  'move',
];

/** Sections that are collapsible (deeper content, not the core read). */
const COLLAPSIBLE_SECTIONS: Set<StorySectionType> = new Set(['contrast', 'psychology', 'move']);

/** Renders a chapter title and its ordered story sections. */
export function StoryView({ title, sections = {} }: StoryViewProps) {
  return (
    <article>
      <h1
        style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          margin: '0 0 var(--spacing-xl, 2.5rem)',
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h1>
      {SECTION_ORDER.map((type) => {
        const section = sections[type];
        if (!section) return null;
        return (
          <StorySection
            key={type}
            type={type}
            title={section.title}
            content={section.content}
            collapsible={COLLAPSIBLE_SECTIONS.has(type)}
          />
        );
      })}
    </article>
  );
}
