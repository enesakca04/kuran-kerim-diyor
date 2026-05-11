import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";
const model = genAI.getGenerativeModel({ model: modelName });

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  detectedLanguage?: string; // Dil algılamayı buraya ekledik
}

export const moderateComment = async (text: string): Promise<ModerationResult> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Moderation]: GEMINI_API_KEY not found, auto-approving.");
    return { isSafe: true, detectedLanguage: 'tr' };
  }

  try {
    const prompt = `Analyze this comment for a Quran application: "${text}"
    
    Rules:
    1. Check for profanity, mockery, hate speech, or inappropriate content.
    2. Detect the language code (e.g. 'tr', 'en', 'ar', 'de', 'fr', 'es').
    3. If isSafe is false, set "reason" to one of these EXACT codes: 'PROFANITY', 'INSULT', 'SPAM', 'OFF_TOPIC', 'HATE_SPEECH', 'OTHER'.
    4. If isSafe is true, set "reason" to "".
    
    You MUST respond ONLY with a valid JSON object.
    
    Example format:
    {
      "isSafe": boolean,
      "reason": "CODE",
      "detectedLanguage": "tr"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Attempt to parse JSON from response
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return {
      isSafe: parsed.isSafe ?? true,
      reason: parsed.reason || "",
      detectedLanguage: parsed.detectedLanguage || "tr"
    };
  } catch (error) {
    console.error("[Moderation Error]:", error);
    // On error, we default to PENDING (isSafe: true for optimistic, but DB should handle status)
    // Actually, safest is to allow but log the error.
    return { isSafe: true };
  }
};
