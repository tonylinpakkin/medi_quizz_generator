import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the @google/genai library to avoid network calls
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            stem: 'What is the primary hormone involved in adrenal hypertension?',
            options: [
              { id: 'A', text: 'Aldosterone' },
              { id: 'B', text: 'Cortisol' },
              { id: 'C', text: 'Adrenaline' },
              { id: 'D', text: 'Renin' }
            ],
            correctAnswerId: 'A',
            rationale: 'Aldosterone overproduction leads to primary aldosteronism.',
            citation: { source: 'PubMed' }
          })
        })
      }
    })),
    Type: {
      OBJECT: 'object',
      ARRAY: 'array',
      STRING: 'string'
    }
  };
});

import { generateQuestionFromText } from '../services/geminiService';
import { QuestionType } from '../types';

const sampleText = 'Primary aldosteronism is the most common cause of secondary hypertension.';

describe('generateQuestionFromText', () => {
  it('returns a valid MCQ object for MCQ type', async () => {
    const mcq = await generateQuestionFromText(sampleText, QuestionType.MCQ);

    expect(mcq.stem.length).toBeGreaterThan(0);
    expect(mcq.options).toHaveLength(4);
    const optionIds = mcq.options.map(o => o.id);
    expect(optionIds).toContain(mcq.correctAnswerId);
    expect(mcq.rationale.length).toBeGreaterThan(0);
    expect(mcq.citation.source).toBe('PubMed');
    expect(mcq.id).toBeDefined();
    expect(mcq.type).toBe(QuestionType.MCQ);
  });

  it('tags the returned question with TrueFalse type', async () => {
    const q = await generateQuestionFromText(sampleText, QuestionType.TrueFalse);
    expect(q.type).toBe(QuestionType.TrueFalse);
  });

  it('tags the returned question with ShortAnswer type', async () => {
    const q = await generateQuestionFromText(sampleText, QuestionType.ShortAnswer);
    expect(q.type).toBe(QuestionType.ShortAnswer);
  });
});
