import { describe, it, expect, vi } from 'vitest';

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

import { generateMCQFromText } from '../services/geminiService';

const sampleText = 'Primary aldosteronism is the most common cause of secondary hypertension.';

describe('generateMCQFromText', () => {
  it('throws a descriptive error when API_KEY is missing', async () => {
    const original = process.env.API_KEY;
    // simulate missing key
    delete process.env.API_KEY;

    await expect(generateMCQFromText(sampleText)).rejects.toThrow(
      'API_KEY environment variable not set.'
    );

    // restore environment
    process.env.API_KEY = original;
  });

  it('returns a valid MCQ object', async () => {
    const mcq = await generateMCQFromText(sampleText);

    expect(mcq.stem.length).toBeGreaterThan(0);
    expect(mcq.options).toHaveLength(4);
    const optionIds = mcq.options.map(o => o.id);
    expect(optionIds).toContain(mcq.correctAnswerId);
    expect(mcq.rationale.length).toBeGreaterThan(0);
    expect(mcq.citation.source).toBe('PubMed');
    expect(mcq.id).toBeDefined();
  });
});
