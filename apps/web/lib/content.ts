import type { QuizChallenge } from '@field-guide/shared-types';

import type { StorySectionType } from '@/modules/story';

import chapterJson from '../../../content/chapters/part-02/31.json';
import quizJson from '../../../content/chapters/part-02/31.quiz.json';

/**
 * Chapter 31 content, with section `type` narrowed from the widened `string`
 * that JSON imports produce back to the `StorySectionType` literal union
 * expected by the story components.
 */
export const chapter31 = {
  ...chapterJson,
  sections: chapterJson.sections.map((s) => ({
    ...s,
    type: s.type as StorySectionType,
  })),
};

/**
 * Chapter 31 quiz, with challenges narrowed to the discriminated
 * {@link QuizChallenge} union expected by the quiz components.
 */
export const quiz31 = {
  ...quizJson,
  challenges: quizJson.challenges as unknown as QuizChallenge[],
};
