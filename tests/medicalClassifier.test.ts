import { describe, it, expect, vi, beforeEach } from 'vitest';

let generateContentMock: any;
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: (...args: any[]) => generateContentMock(...args),
    },
  })),
}));

import { isMedicalContent } from '../services/medicalClassifier';

beforeEach(() => {
  generateContentMock = vi.fn();
});

describe('isMedicalContent', () => {
  it('returns true when model flags text as medical', async () => {
    generateContentMock.mockResolvedValue({ text: '{"medical": true}' });
    const result = await isMedicalContent('foo');
    expect(result).toBe(true);
  });

  it('returns false when model flags text as non-medical', async () => {
    generateContentMock.mockResolvedValue({ text: '{"medical": false}' });
    const result = await isMedicalContent('foo');
    expect(result).toBe(false);
  });
});
