import { z } from 'zod';

/**
 * Section types that make up a chapter's narrative arc.
 * Mirrors the chapter template: situation → story → contrast → principle →
 * psychology → trap → move.
 */
export const sectionTypeSchema = z.enum([
  'situation',
  'story',
  'contrast',
  'principle',
  'psychology',
  'trap',
  'move',
]);

export type SectionType = z.infer<typeof sectionTypeSchema>;

/** A single titled block of chapter content. */
export const chapterSectionSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'section content must not be empty'),
});

export type ChapterSection = z.infer<typeof chapterSectionSchema>;

/**
 * Sections as an object keyed by section type.
 * Each key maps to a section object with optional title and required content.
 * At minimum, a chapter must have a `situation` section.
 */
export const chapterSectionsSchema = z.object({
  situation: chapterSectionSchema,
  story: chapterSectionSchema.optional(),
  contrast: chapterSectionSchema.optional(),
  principle: chapterSectionSchema.optional(),
  psychology: chapterSectionSchema.optional(),
  trap: chapterSectionSchema.optional(),
  move: chapterSectionSchema.optional(),
});

export type ChapterSections = z.infer<typeof chapterSectionsSchema>;

/** Runtime schema for a chapter JSON document. */
export const chapterSchema = z.object({
  id: z.string().min(1),
  part: z.number().int(),
  section: z.string().min(1),
  title: z.string().min(1),
  forces: z.array(z.string()).nonempty('a chapter must list at least one force'),
  connections: z.array(z.string()),
  audio: z.string().min(1),
  visual: z.string().min(1),
  sections: chapterSectionsSchema,
});

export type ChapterDocument = z.infer<typeof chapterSchema>;
