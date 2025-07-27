import { describe, it, expect, vi, beforeEach } from 'vitest';

var mockGenerateContent: any;

// Mock the @google/genai library to avoid network calls
vi.mock('@google/genai', () => {
  mockGenerateContent = vi.fn().mockResolvedValue({
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

  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
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
  beforeEach(() => {
    mockGenerateContent.mockClear();
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

  it('accepts medical text with new keywords', async () => {
    const text = 'Myocardial infarction can present with chest pain.';
    const mcq = await generateMCQFromText(text);
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(mcq).toBeDefined();
  });

  it('rejects non-medical text', async () => {
    const nonMedicalText = 'The quick brown fox jumps over the lazy dog.';
    await expect(generateMCQFromText(nonMedicalText)).rejects.toThrow(
      'The input text does not appear to be medical or clinical in nature.'
    );
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});
