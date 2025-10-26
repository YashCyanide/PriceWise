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
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: description.substring(0, 1024),
          parameters: {
            max_length: 130,
            min_length: 30,
            do_sample: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      console.log("Model loading, using fallback");
      return description.substring(0, 200) + "...";
    }

    return result[0]?.summary_text || description.substring(0, 200) + "...";
  } catch (error) {
    console.error("AI summarization error:", error);
    return description.substring(0, 200) + "...";
  }
}
