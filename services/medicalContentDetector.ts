import { MEDICAL_KEYWORDS } from '../medicalKeywords';

const keywordSet = new Set(MEDICAL_KEYWORDS.map(k => k.toLowerCase()));

export const isMedicalContent = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  for (const kw of keywordSet) {
    if (lower.includes(kw)) {
      return true;
    }
  }
  return false;
};
