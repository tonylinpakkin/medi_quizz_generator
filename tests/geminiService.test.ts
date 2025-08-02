import { describe, it, expect, vi } from 'vitest';
import { generateQuestionFromText } from '../services/geminiService';
import { QuestionType } from '../types';

// Mock the @google/genai library to avoid network calls
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockImplementation(({ config }) => {
          if (config.responseSchema.properties.options) {
            return Promise.resolve({
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
            });
          }
          return Promise.resolve({
            text: JSON.stringify({
              stem: 'Primary aldosteronism is the most common cause of secondary hypertension.',
              answer: true,
              rationale: 'This statement is supported by epidemiological data.',
              citation: { source: 'PubMed' }
            })
          });
        })
      }
    })),
    Type: {
      OBJECT: 'object',
      ARRAY: 'array',
      STRING: 'string',
      BOOLEAN: 'boolean'
    }
  };
});

const sampleText = 'Primary aldosteronism is the most common cause of secondary hypertension.';

describe('generateQuestionFromText', () => {
  it('returns a valid MCQ object', async () => {
    const mcq = await generateQuestionFromText(sampleText, QuestionType.MCQ);

    expect(mcq.type).toBe(QuestionType.MCQ);
    expect(mcq.options).toHaveLength(4);
    const optionIds = mcq.options.map(o => o.id);
    expect(optionIds).toContain(mcq.correctAnswerId);
    expect(mcq.citation.source).toBe('PubMed');
    expect(mcq.id).toBeDefined();
  });

  it('returns a valid True/False question', async () => {
    const tf = await generateQuestionFromText(sampleText, QuestionType.TRUE_FALSE);

    expect(tf.type).toBe(QuestionType.TRUE_FALSE);
    expect(typeof tf.answer).toBe('boolean');
    expect(tf.citation.source).toBe('PubMed');
    expect(tf.id).toBeDefined();
  });
});
