export interface BotanicalImageResult {
  imageUrl: string;
}

// Frontend entry point for AI image generation.
// The browser calls a local server endpoint so GEMINI_API_KEY never ships to frontend code.
export async function generateBotanicalImage(prompt: string): Promise<BotanicalImageResult> {
  const response = await fetch("/api/generate-botanical-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<BotanicalImageResult> & { error?: string };

  if (!response.ok || !payload.imageUrl) {
    throw new Error(payload.error ?? "Image generation failed.");
  }

  return {
    imageUrl: payload.imageUrl,
  };
}
