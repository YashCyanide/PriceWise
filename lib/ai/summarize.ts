"use server";

import { OpenAI } from "openai";

export async function summarizeDescription(description: string): Promise<string> {
  if (!description || description.length < 100) {
    return description;
  }

  const apiKey = process.env.HF_TOKEN;
  
  if (!apiKey) {
    return description.substring(0, 200) + "...";
  }

  try {
    const client = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1",
      apiKey: apiKey,
    });

    const chatCompletion = await client.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "user",
          content: `Summarize this product description in 2-3 sentences:\n\n${description.substring(0, 1000)}`
        }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    return chatCompletion.choices[0]?.message?.content || description.substring(0, 200) + "...";
  } catch (error) {
    console.error("AI summarization error:", error);
    return description.substring(0, 200) + "...";
  }
}
