import { describe, it, expect, vi } from 'vitest';
import { generateQuestionFromText } from '../services/geminiService';
import { QuestionType } from '../types';

// Mock the @google/genai library to avoid network calls
vi.mock('@google/genai', () => {
  const generateContent = vi.fn().mockImplementation(({ config }) => {
    const schema: any = config?.responseSchema;
    if (schema?.properties?.options) {
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
    if (schema?.properties?.answer?.type === 'boolean') {
      return Promise.resolve({
        text: JSON.stringify({
          stem: 'Primary aldosteronism is the most common cause of secondary hypertension.',
          answer: true,
          rationale: 'The statement is accurate according to recent studies.',
          citation: { source: 'PubMed' }
        })
      });
    }
    return Promise.resolve({
      text: JSON.stringify({
        stem: 'Which hormone is overproduced in primary aldosteronism?',
        answer: 'Aldosterone',
        rationale: 'Primary aldosteronism is characterized by excessive aldosterone production.',
        citation: { source: 'PubMed' }
      })
    });
  });

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
    const optionIds = mcq.options!.map(o => o.id);
    expect(optionIds).toContain(mcq.correctAnswerId);
    expect(mcq.citation.source).toBe('PubMed');
    expect(mcq.id).toBeDefined();
    expect(mcq.type).toBe(QuestionType.MCQ);
  });

  it('returns a True/False question when requested', async () => {
    const q = await generateQuestionFromText(sampleText, QuestionType.TrueFalse);
    expect(q.type).toBe(QuestionType.TrueFalse);
    expect(q.options).toHaveLength(2);
    expect(q.options?.map(o => o.text)).toEqual(['True', 'False']);
    expect(['A', 'B']).toContain(q.correctAnswerId);
    expect(typeof q.answer).toBe('boolean');
  });

  it('returns a Short Answer question when requested', async () => {
    const q = await generateQuestionFromText(sampleText, QuestionType.ShortAnswer);
    expect(q.type).toBe(QuestionType.ShortAnswer);
    expect(q.options).toBeUndefined();
    expect(typeof q.answer).toBe('string');
  });

  it('returns a valid True/False question', async () => {
    const tf = await generateQuestionFromText(sampleText, QuestionType.TRUE_FALSE);

    expect(tf.type).toBe(QuestionType.TRUE_FALSE);
    expect(typeof tf.answer).toBe('boolean');
    expect(tf.citation.source).toBe('PubMed');
    expect(tf.id).toBeDefined();
  });
});
