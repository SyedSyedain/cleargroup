// Gemini API integration — all Gemini API calls must go through this file
// Requires GEMINI_API_KEY in .env.local — never call Gemini from the frontend

export const GEMINI_MODEL = "gemini-1.5-flash";

// Returns the Gemini API key from server environment
export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in .env.local");
  return key;
}
