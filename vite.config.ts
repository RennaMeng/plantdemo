import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function extractImageUrlFromText(text: string | undefined): string | null {
  if (!text) {
    return null;
  }

  const dataUrl = text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/);
  const httpUrl = text.match(/https?:\/\/[^\s)"']+\.(?:png|jpg|jpeg|webp)(?:\?[^\s)"']*)?/i);

  return dataUrl?.[0] || httpUrl?.[0] || null;
}

async function generateWithOpenRouter(env: Record<string, string>, prompt: string): Promise<string> {
  const apiKey = env.OPENROUTER_API_KEY || env.GEMINI_API_KEY;
  const model = env.OPENROUTER_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Copy .env.example to .env and add your OpenRouter API key.");
  }

  // TODO: Tune image_config or model slug if your OpenRouter image model changes.
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.OPENROUTER_SITE_URL || "http://localhost:5173",
      "X-OpenRouter-Title": env.OPENROUTER_APP_TITLE || "Plant Morphology Generator",
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
        aspect_ratio: env.OPENROUTER_IMAGE_ASPECT_RATIO || "3:4",
        image_size: env.OPENROUTER_IMAGE_SIZE || "1K",
      },
    }),
  });

  const result = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?:
          | string
          | Array<{
              type?: string;
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

async function generateWithGemini(env: Record<string, string>, prompt: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  const model = env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
  const apiVersion = env.GEMINI_API_VERSION || "v1beta";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Copy .env.example to .env and add your Google AI Studio API key.");
  }

  // TODO: Replace or extend this server-side call if you switch image providers.
  // Keep the API key on the server. Do not call Gemini directly from browser code.
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

function botanicalImageApiPlugin(env: Record<string, string>): Plugin {
  const handleImageRequest = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== "POST") {
      next();
      return;
    }

    try {
      const rawBody = await readRequestBody(req);
      const { prompt } = JSON.parse(rawBody || "{}") as { prompt?: string };

      if (!prompt?.trim()) {
        sendJson(res, 400, { error: "Prompt is required." });
        return;
      }

      const provider =
        env.IMAGE_PROVIDER ||
        (env.OPENROUTER_API_KEY || env.GEMINI_API_KEY?.startsWith("sk-or-") ? "openrouter" : "gemini");
      const imageUrl = provider === "openrouter" ? await generateWithOpenRouter(env, prompt) : await generateWithGemini(env, prompt);

      sendJson(res, 200, { imageUrl });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Unexpected image generation error.",
      });
    }
  };

  return {
    name: "botanical-image-api",
    configureServer(server) {
      server.middlewares.use("/api/generate-botanical-image", handleImageRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/generate-botanical-image", handleImageRequest);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), botanicalImageApiPlugin(env)],
  };
});
