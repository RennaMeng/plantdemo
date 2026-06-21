export const config = {
  maxDuration: 60,
};

function extractImageUrlFromText(text: string | undefined): string | null {
  if (!text) {
    return null;
  }

  const dataUrl = text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/);
  const httpUrl = text.match(/https?:\/\/[^\s)"']+\.(?:png|jpg|jpeg|webp)(?:\?[^\s)"']*)?/i);

  return dataUrl?.[0] || httpUrl?.[0] || null;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in Vercel Environment Variables.");
  }

  // TODO: Update model/image_config here if your OpenRouter image model slug changes.
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://plantdemo.vercel.app",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE || "Plant Morphology Generator",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image", "text"],
      stream: false,
      image_config: {
        aspect_ratio: process.env.OPENROUTER_IMAGE_ASPECT_RATIO || "3:4",
        image_size: process.env.OPENROUTER_IMAGE_SIZE || "1K",
      },
    }),
  });

  const result = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?:
          | string
          | Array<{
              text?: string;
              image_url?: { url?: string } | string;
              imageUrl?: { url?: string } | string;
            }>;
        images?: Array<{
          image_url?: { url?: string };
          imageUrl?: { url?: string };
          url?: string;
        }>;
      };
    }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? "OpenRouter image generation failed.");
  }

  const message = result.choices?.[0]?.message;
  const imageUrlFromImages =
    message?.images?.[0]?.image_url?.url || message?.images?.[0]?.imageUrl?.url || message?.images?.[0]?.url || null;
  const imageUrlFromContent = Array.isArray(message?.content)
    ? message.content
        .map((part) => {
          const imageUrl = part.image_url;
          const imageUrlAlt = part.imageUrl;

          if (typeof imageUrl === "string") {
            return imageUrl;
          }

          if (typeof imageUrlAlt === "string") {
            return imageUrlAlt;
          }

          return imageUrl?.url || imageUrlAlt?.url || extractImageUrlFromText(part.text);
        })
        .find(Boolean) || null
    : extractImageUrlFromText(message?.content);
  const imageUrl = imageUrlFromImages || imageUrlFromContent;

  if (!imageUrl) {
    const textContent = Array.isArray(message?.content)
      ? message.content.map((part) => part.text).filter(Boolean).join(" ")
      : message?.content;

    throw new Error(textContent ? `OpenRouter returned text but no image: ${textContent}` : "OpenRouter response did not include an image.");
  }

  return imageUrl;
}

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
  const apiVersion = process.env.GEMINI_API_VERSION || "v1beta";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in Vercel Environment Variables.");
  }

  // TODO: Replace this direct Gemini call if you switch providers.
  const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  const result = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
          inlineData?: {
            mimeType?: string;
            data?: string;
          };
          inline_data?: {
            mime_type?: string;
            data?: string;
          };
        }>;
      };
    }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Gemini image generation failed.");
  }

  const imagePart = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data || part.inline_data?.data);
  const imageData = imagePart?.inlineData?.data || imagePart?.inline_data?.data;
  const mimeType = imagePart?.inlineData?.mimeType || imagePart?.inline_data?.mime_type || "image/png";
  const imageUrl = imageData ? `data:${mimeType};base64,${imageData}` : null;

  if (!imageUrl) {
    const textResponse = result.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;

    throw new Error(textResponse ? `Gemini returned text but no image: ${textResponse}` : "Gemini response did not include an image.");
  }

  return imageUrl;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const prompt = typeof req.body === "string" ? JSON.parse(req.body || "{}").prompt : req.body?.prompt;

    if (!prompt?.trim()) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const provider =
      process.env.IMAGE_PROVIDER ||
      (process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY?.startsWith("sk-or-") ? "openrouter" : "gemini");
    const imageUrl = provider === "openrouter" ? await generateWithOpenRouter(prompt) : await generateWithGemini(prompt);

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected image generation error.",
    });
  }
}
