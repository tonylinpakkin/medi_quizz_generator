
import { GoogleGenAI, Type } from "@google/genai";
import { MCQ } from '../types';

let ai: GoogleGenAI | null = null;

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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey });
    }

    const prompt = `
        You are an expert medical question author for practicing physicians.
        Based on the following text from a medical thesis, generate one single-best-answer multiple-choice question (MCQ).
        The question must be challenging, clinically relevant, and test a key concept from the provided text.
        Include a brief explanation for why the chosen answer is correct in a 'rationale' field.
        Your response MUST be a valid JSON object that strictly adheres to the provided schema.
        Do not include any markdown formatting, backticks, or the word 'json' in your response. Just the raw JSON object.

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
