import { MEDICAL_KEYWORDS } from '../medicalKeywords';
import { WordTokenizer, PorterStemmer } from 'natural';

const tokenizer = new WordTokenizer();
const stemSet = new Set(
  MEDICAL_KEYWORDS.map(k => PorterStemmer.stem(k.toLowerCase()))
);

export const isMedicalContent = (text: string): boolean => {
  if (!text) return false;

  const tokens = tokenizer.tokenize(text.toLowerCase());
  for (const token of tokens) {
    const stem = PorterStemmer.stem(token);
    if (stemSet.has(stem)) {
      return true;
    }
  }
  return false;
};
