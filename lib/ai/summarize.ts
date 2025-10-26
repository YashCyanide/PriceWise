"use server";

export async function summarizeDescription(description: string): Promise<string> {
  if (!description || description.length < 100) {
    return description;
  }

  const apiKey = process.env.HF_TOKEN;
  
  if (!apiKey) {
    return description.substring(0, 200) + "...";
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            {
              role: "user",
              content: `Summarize this product description in 2-3 concise sentences:\n\n${description.substring(0, 1000)}`
            }
          ],
          max_tokens: 150,
          temperature: 0.5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      console.log("Model error, using fallback");
      return description.substring(0, 200) + "...";
    }

    return result.choices?.[0]?.message?.content || description.substring(0, 200) + "...";
  } catch (error) {
    console.error("AI summarization error:", error);
    return description.substring(0, 200) + "...";
  }
}
