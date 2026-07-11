import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://brightpath-dental.vercel.app",
    "X-Title": "BrightPath Dental",
  },
});

export async function embed(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("[ai/embeddings] OPENAI_API_KEY is not set");
  }

  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[ai/embeddings] embed() failed:", error);
    throw new Error("Failed to generate embedding");
  }
}
