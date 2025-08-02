import { describe, it, expect } from 'vitest';
import { mcqToPlainText } from '../services/mcqFormatter';
import type { MCQ } from '../types';
import { QuestionType } from '../types';

const mcq: MCQ = {
  id: '1',
  type: QuestionType.MCQ,
  stem: 'Stem',
  options: [
    { id: 'A', text: 'Opt A' },
    { id: 'B', text: 'Opt B' },
    { id: 'C', text: 'Opt C' },
    { id: 'D', text: 'Opt D' },
  ],
  correctAnswerId: 'A',
  rationale: 'Because',
  citation: { source: 'PubMed' },
};

describe('mcqToPlainText', () => {
  it('formats an MCQ into plain text', () => {
    const text = mcqToPlainText(mcq);
    expect(text).toContain('Stem');
    expect(text).toContain('A. Opt A');
    expect(text).toContain('Answer: A');
    expect(text).toContain('Rationale: Because');
    expect(text).toContain('Source: PubMed');
  });
});

