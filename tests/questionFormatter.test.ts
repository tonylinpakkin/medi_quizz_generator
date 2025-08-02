import { describe, it, expect } from 'vitest';
import { questionToPlainText } from '../services/questionFormatter';
import type { Question } from '../types';

const question: Question = {
  id: '1',
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

describe('questionToPlainText', () => {
  it('formats a question into plain text', () => {
    const text = questionToPlainText(question);
    expect(text).toContain('Stem');
    expect(text).toContain('A. Opt A');
    expect(text).toContain('Answer: A');
    expect(text).toContain('Rationale: Because');
    expect(text).toContain('Source: PubMed');
  });
});

