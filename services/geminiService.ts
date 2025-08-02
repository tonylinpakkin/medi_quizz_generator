
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, MCQQuestion, TrueFalseQuestion } from '../types';

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

const trueFalseSchema = {
    type: Type.OBJECT,
    properties: {
        stem: { type: Type.STRING, description: "The statement to evaluate." },
        answer: { type: Type.BOOLEAN, description: "True if the statement is correct." },
        rationale: { type: Type.STRING, description: "Explanation of the answer." },
        citation: {
            type: Type.OBJECT,
            description: "A citation for the information used in the question.",
            properties: {
                source: { type: Type.STRING, description: "The source of the citation, which must be 'PubMed'." }
            },
            required: ["source"]
        }
    },
    required: ["stem", "answer", "rationale", "citation"]
};

export const generateQuestionFromText = async (
    text: string,
    type: QuestionType,
    current = 1,
    total = 1
): Promise<Question> => {
    let prompt: string;
    let schema: any;

    switch (type) {
        case QuestionType.TRUE_FALSE:
            prompt = `
        You are an expert medical question author for practicing physicians.
        Based on the following text from a medical thesis, generate question ${current} of ${total} as a true/false question.
        Include whether the statement is true in an 'answer' field.
        Include a brief explanation for why the answer is correct in a 'rationale' field.
        Your response MUST be a valid JSON object that strictly adheres to the provided schema.
        Do not include any markdown formatting, backticks, or the word 'json' in your response. Just the raw JSON object.

        Thesis Text:
        ---
        ${text}
        ---
    `;
            schema = trueFalseSchema;
            break;
        case QuestionType.MCQ:
        default:
            prompt = `
        You are an expert medical question author for practicing physicians.
        Based on the following text from a medical thesis, generate question ${current} of ${total} as a single-best-answer multiple-choice question (MCQ).
        The question must be challenging, clinically relevant, and test a key concept from the provided text.
        Include a brief explanation for why the chosen answer is correct in a 'rationale' field.
        Your response MUST be a valid JSON object that strictly adheres to the provided schema.
        Do not include any markdown formatting, backticks, or the word 'json' in your response. Just the raw JSON object.

        Thesis Text:
        ---
        ${text}
        ---
    `;
            schema = mcqSchema;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Basic validation per type
        if (type === QuestionType.MCQ) {
            if (!parsedJson.stem || !parsedJson.options || parsedJson.options.length !== 4 || !parsedJson.correctAnswerId || !parsedJson.rationale) {
                throw new Error("AI response is missing required fields or has an incorrect number of options.");
            }
            return { ...parsedJson, type, id: crypto.randomUUID() } as MCQQuestion;
        } else if (type === QuestionType.TRUE_FALSE) {
            if (typeof parsedJson.answer !== 'boolean' || !parsedJson.stem) {
                throw new Error("AI response is missing required fields for true/false question.");
            }
            return { ...parsedJson, type, id: crypto.randomUUID() } as TrueFalseQuestion;
        }

        return { ...parsedJson, type, id: crypto.randomUUID() } as Question;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("The AI model failed to generate a valid question. Please try again with a different text or check the console for details.");
    }
};

export const generateMCQFromText = (
    text: string,
    current = 1,
    total = 1
): Promise<MCQQuestion> => generateQuestionFromText(text, QuestionType.MCQ, current, total) as Promise<MCQQuestion>;

