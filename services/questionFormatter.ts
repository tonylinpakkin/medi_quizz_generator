import type { Question } from '../types';

/**
 * Format a Question object as plain text for copying or export.
 * @param question The question to format.
 * @returns Plain text representation of the question.
 */
export const questionToPlainText = (question: Question): string => {
  const lines: string[] = [];
  lines.push(question.stem);
  question.options?.forEach(opt => {
    lines.push(`${opt.id}. ${opt.text}`);
  });
  if (question.correctAnswerId) {
    lines.push(`Answer: ${question.correctAnswerId}`);
  } else if (question.answer !== undefined) {
    lines.push(`Answer: ${question.answer}`);
  }
  if (question.rationale) {
    lines.push(`Rationale: ${question.rationale}`);
  }
  lines.push(`Source: ${question.citation.source}`);
  if (question.citation.context) {
    lines.push(`Source Context: ${question.citation.context}`);
  }
  return lines.join('\n');
};
