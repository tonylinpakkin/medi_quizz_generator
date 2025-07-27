import { describe, it, expect } from 'vitest';
import { isMedicalContent } from '../services/medicalContentDetector';


describe('isMedicalContent', () => {
  it('detects medical terminology using stemming', () => {
    const text = 'The patient was diagnosed with hypertension.';
    expect(isMedicalContent(text)).toBe(true);
  });

  it('returns false for non-medical text', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    expect(isMedicalContent(text)).toBe(false);
  });
});
