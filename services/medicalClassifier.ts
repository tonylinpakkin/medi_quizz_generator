import { GoogleGenAI } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable not set.');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Determine if the provided text is medical in nature.
 * @param text Input text to analyze.
 * @returns true if the text is medical, false otherwise.
 */
export const isMedicalContent = async (text: string): Promise<boolean> => {
  const prompt = `Only answer with a JSON object of the form { "medical": true } if the following text relates to medicine or healthcare. Respond { "medical": false } otherwise. Text: \n\n${text}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    });

    const result = JSON.parse(response.text!.trim());
    return Boolean(result.medical);
  } catch (err) {
    console.error('Gemini medical classification failed:', err);
    throw new Error('Medical classification failed.');
  }
};
