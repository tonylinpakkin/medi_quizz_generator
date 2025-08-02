import type { MCQ } from '../types';

/**
 * Format an MCQ object as plain text for copying or export.
 * @param mcq The MCQ to format.
 * @returns Plain text representation of the MCQ.
 */
export const mcqToPlainText = (mcq: MCQ): string => {
  const lines: string[] = [];
  lines.push(mcq.stem);
  mcq.options?.forEach(opt => {
    lines.push(`${opt.id}. ${opt.text}`);
  });
  if (mcq.correctAnswerId) {
    lines.push(`Answer: ${mcq.correctAnswerId}`);
  } else if (mcq.answer !== undefined) {
    lines.push(`Answer: ${mcq.answer}`);
  }
  if (mcq.rationale) {
    lines.push(`Rationale: ${mcq.rationale}`);
  }
  lines.push(`Source: ${mcq.citation.source}`);
  return lines.join('\n');
};
