
import { GoogleGenAI, Type } from "@google/genai";
import { CalculationResult } from "../types";

export const solveWithAi = async (prompt: string): Promise<CalculationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Solve the following math problem. Provide the final numerical result and a very brief one-sentence explanation. 
      Problem: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: {
              type: Type.STRING,
              description: 'The final numerical answer as a string.',
            },
            explanation: {
              type: Type.STRING,
              description: 'A concise explanation of the calculation.',
            },
          },
          required: ["result", "explanation"],
        },
      },
    });

    const data = JSON.parse(response.text.trim());
    return data;
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to process with AI. Please check your query.");
  }
};
