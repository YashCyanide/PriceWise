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
      model: "meta-llama/Llama-3.2-3B-Instruct",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes product descriptions into 2-3 concise sentences."
        },
        {
          role: "user",
          content: `Summarize this product description in 2-3 sentences:\n\n${description.substring(0, 1500)}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || description.substring(0, 200) + "...";
  } catch (error) {
    console.error("AI summarization error:", error);
    return description.substring(0, 200) + "...";
  }
}
