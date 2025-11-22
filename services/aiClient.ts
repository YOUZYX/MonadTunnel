
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export interface RecommendationResponse {
  reasoning: string;
  recommendedAppIds: string[];
  searchKeywords: string[];
}

export async function getAiRecommendation(userQuery: string, contextData: any[]): Promise<RecommendationResponse> {
  try {
    // Simplify context to save tokens, sending only names and tags/info
    const simplifiedContext = contextData.map(d => ({
        id: d.id,
        name: d.name,
        tags: d.tags,
        info: d.description
    }));

    const ecosystemContext = JSON.stringify(simplifiedContext);
    
    const prompt = `
      You are the Oracle of the Monad Tunnel.
      
      Context: A list of Dapps on Monad:
      ${ecosystemContext}

      User Query: "${userQuery}"

      Task:
      1. Identify Dapps that matches the user's intent (can be multiple).
      2. If the user asks "Where to trade?", look for DEXs. If "Gaming", look for games.
      3. Return a list of matching IDs (recommendedAppIds).
      4. Return general keywords related to the query (searchKeywords).
      5. Provide a reasoning string (max 30 words).

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            recommendedAppIds: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            searchKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
          },
          required: ["reasoning", "recommendedAppIds"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RecommendationResponse;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      reasoning: "Interference detected. Showing all viable nodes.",
      recommendedAppIds: [],
      searchKeywords: []
    };
  }
}
