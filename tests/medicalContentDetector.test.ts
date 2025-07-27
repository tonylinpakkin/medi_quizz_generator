import { describe, it, expect } from 'vitest';
import { isMedicalContent } from '../services/medicalContentDetector';

describe('isMedicalContent', () => {
  const positiveCases = [
    'The patient was diagnosed with hypertension.',
    'Vaccinations prevent many diseases.',
    'Renal failure may require dialysis therapy.',
    'Clinical trials evaluate new cancer treatments.',
  ];

  positiveCases.forEach(text => {
    it(`detects medical terminology in "${text}"`, () => {
      expect(isMedicalContent(text)).toBe(true);
    });
  });

  const negativeCases = [
    'The quick brown fox jumps over the lazy dog.',
    'She enjoys painting landscapes in her free time.',
    'The car needs a new transmission.',
  ];

  negativeCases.forEach(text => {
    it(`returns false for non-medical text "${text}"`, () => {
      expect(isMedicalContent(text)).toBe(false);
    });
  });
});
