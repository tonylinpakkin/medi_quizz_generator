
import { BIAS_KEYWORDS } from '../constants';

// Create a Set for faster lookups
const keywordSet = new Set(BIAS_KEYWORDS.map(k => k.toLowerCase()));

/**
 * Detects potentially biased keywords in a given text.
 * @param text The text to scan.
 * @returns An array of unique keywords found in the text, in lowercase.
 */
export const detectBias = (text: string): string[] => {
  if (!text) return [];

  // Normalize text: lowercase and split into words, removing basic punctuation.
  const words = text.toLowerCase().split(/\s+/).map(word => word.replace(/[.,!?;:"]$/, ''));

  const foundKeywords = new Set<string>();

  for (const word of words) {
    if (keywordSet.has(word)) {
      foundKeywords.add(word);
    }
  }

  // Also check for multi-word phrases like "native american"
  const lowercasedText = text.toLowerCase();
  for (const keyword of BIAS_KEYWORDS) {
      if (keyword.includes(' ') && lowercasedText.includes(keyword)) {
          foundKeywords.add(keyword);
      }
  }

  return Array.from(foundKeywords);
};
