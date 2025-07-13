
import { GoogleGenAI, Type } from "@google/genai";
import { MCQ } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mcqSchema = {
    type: Type.OBJECT,
    properties: {
        stem: {
            type: Type.STRING,
            description: "The main body of the multiple-choice question (the question itself)."
        },
        options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the option, e.g., 'A', 'B', 'C', 'D'." },
                    text: { type: Type.STRING, description: "The text of the answer option." }
                },
                required: ["id", "text"]
            }
        },
        correctAnswerId: {
            type: Type.STRING,
            description: "The 'id' of the correct option from the 'options' array."
        },
        citation: {
            type: Type.OBJECT,
            description: "A citation for the information used in the question.",
            properties: {
                source: { type: Type.STRING, description: "The source of the citation, which must be 'PubMed'." }
            },
            required: ["source"]
        }
    },
    required: ["stem", "options", "correctAnswerId", "citation"]
};


export const generateMCQFromText = async (text: string): Promise<MCQ> => {
    const prompt = `
        You are an expert specialist-author certified by CME/CPD committees. Based on the following text from a medical thesis, generate one single-best-answer multiple-choice question (MCQ) that:

        1. Aligns with a clear learning objective derived from the text.
        2. Uses a focused clinical vignette (concise stem) testing application-level understanding.
        3. Includes exactly four grammatically parallel, plausible answer options (no “all/none of the above”).
        4. Has one clearly correct answer (correct option indicated).
        5. Avoids negative phrasing (“except”) and unnecessary complexity.
        6. Provides a concise rationale (1–2 sentences) explaining why the correct answer is best.
        7. Cites at least one supporting reference (e.g., guideline, study) in the rationale.
        8. Produces output strictly as a raw JSON object matching this schema:
        
        {
          "question": string,
          "options": { "A": string, "B": string, "C": string, "D": string },
          "correct": "A"|"B"|"C"|"D",
          "rationale": string,
          "reference": string
        }
        
        Do not include markdown, backticks, or extra formatting—only the JSON object.
        
        Thesis Text:
        ---
        ${text}
        ---

    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: mcqSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text!.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedJson.stem || !parsedJson.options || parsedJson.options.length !== 4 || !parsedJson.correctAnswerId) {
            throw new Error("AI response is missing required fields or has an incorrect number of options.");
        }

        // Add a unique ID for state management
        return { ...parsedJson, id: crypto.randomUUID() } as MCQ;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("The AI model failed to generate a valid question. Please try again with a different text or check the console for details.");
    }
};
