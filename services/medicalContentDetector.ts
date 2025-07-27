import { MEDICAL_KEYWORDS } from '../medicalKeywords';

// Separate keywords into single words and multi-word phrases
const singleWordKeywords = new Set<string>();
const phraseKeywords: string[] = [];

for (const kw of MEDICAL_KEYWORDS) {
  const lower = kw.toLowerCase();
  if (lower.includes(' ')) {
    phraseKeywords.push(lower);
  } else {
    singleWordKeywords.add(lower);
  }
}

export const isMedicalContent = (text: string): boolean => {
  if (!text) return false;

  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);

  // Check single-word matches
  for (const token of tokens) {
    if (singleWordKeywords.has(token)) {
      return true;
    }
  }

  // Check phrase matches
  for (const phrase of phraseKeywords) {
    if (lower.includes(phrase)) {
      return true;
    }
  }

  return false;
};
