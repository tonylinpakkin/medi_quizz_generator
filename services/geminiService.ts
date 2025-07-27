
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
        rationale: {
            type: Type.STRING,
            description: "A brief explanation of why the selected answer is correct."
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
    required: ["stem", "options", "correctAnswerId", "rationale", "citation"]
};


export const generateMCQFromText = async (text: string): Promise<MCQ> => {
    const prompt = `
        You are an expert medical question author for practicing physicians.

        Step 1: Determine if the following input text is clearly related to **medical or clinical topics** (e.g., human health, diseases, treatments, anatomy, physiology, diagnostics, healthcare systems).
        
        - If the input **is NOT related** to medical or clinical content, do NOT generate any question. Instead, return this exact message:
          {
            "error": "The input text does not appear to be medical or clinical in nature. Please paste content related to medicine or healthcare for MCQ generation."
          }
        
        - If the input **is clearly medical**, proceed to Step 2.
        
        Step 2: Based on the medical input, generate one challenging, clinically relevant, single-best-answer multiple-choice question (MCQ) that tests a key concept from the text. Include a brief explanation for the correct answer in the 'rationale' field.
        
        Your response MUST be a valid JSON object that strictly adheres to the provided schema.  
        Do not include any markdown formatting, backticks, or the word 'json'. Just return the raw JSON object.
        
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
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedJson.stem || !parsedJson.options || parsedJson.options.length !== 4 || !parsedJson.correctAnswerId || !parsedJson.rationale) {
            throw new Error("AI response is missing required fields or has an incorrect number of options.");
        }

        // Add a unique ID for state management
        return { ...parsedJson, id: crypto.randomUUID() } as MCQ;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("The AI model failed to generate a valid question. Please try again with a different text or check the console for details.");
    }
};
