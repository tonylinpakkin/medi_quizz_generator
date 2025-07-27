import { MEDICAL_KEYWORDS } from '../medicalKeywords';
import { WordTokenizer, PorterStemmer } from 'natural';


// Separate keywords into single words and multi-word phrases
const keywordStems = new Set<string>();
const phraseKeywords: string[] = [];

for (const kw of MEDICAL_KEYWORDS) {
  const lower = kw.toLowerCase();
  if (lower.includes(' ')) {
    phraseKeywords.push(lower);
  } else {
    const stem = PorterStemmer.stem(lower);
    keywordStems.add(stem);
    if (lower.endsWith('sis')) {
      const alt = lower.slice(0, -2) + 'e';
      keywordStems.add(PorterStemmer.stem(alt));
    }
  }
}


export const isMedicalContent = (text: string): boolean => {
  if (!text) return false;

  const lower = text.toLowerCase();
  const tokenizer = new WordTokenizer();
  const tokens = tokenizer.tokenize(lower);

  // Check single-word matches using stemming
  for (const token of tokens) {
    const stem = PorterStemmer.stem(token);
    if (keywordStems.has(stem)) {
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
