import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { getOpenAiModel, getRecommendationModel } from "@/lib/ai/providers";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { getRequest } from "@tanstack/react-start/server";

export type AIProvider = "openai" | "gemini";
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  provider?: AIProvider;
}

const SYSTEM_PROMPT = `You are AnimeOrbit's friendly anime and donghua expert assistant. You help users discover anime, understand stories, get recommendations, and explore themes.

Your expertise includes:
- Anime & Donghua recommendations based on mood and preferences
- Watch order guidance for series
- Genre and theme explanations
- Similar anime suggestions
- Beginner-friendly recommendations
- Power scaling and ability discussions
- Story lore and character explanations
- Streaming availability help

Keep responses concise but informative. Use friendly, enthusiastic tone. When recommending anime:
1. Give the title and genre
2. Explain why it matches their vibe
3. Mention episode count and status
4. Add a brief "why you'll love it" reason

Always ask clarifying questions if needed to make better recommendations.`;

function assertAiRateLimit() {
  const request = getRequest();
  const key = `chat:${rateLimitKeyFromRequest(request)}`;
  const result = checkRateLimit(key, 30, 60_000);
  if (!result.ok) {
    throw new Error(`Rate limited. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`);
  }
}

/**
 * Stream anime-focused AI responses
 */
export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        message: z.string().min(1).max(1000),
        provider: z.enum(["openai", "gemini"]).default("gemini"),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .optional()
          .default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertAiRateLimit();

    const providerRequested = data.provider;
    const startedAt = Date.now();
    const TIMEOUT_MS = 55_000;

    // Note: AIAssistantPanel expects a text stream response.
    // This handler always returns either a valid stream response or a short text fallback.
    const withTimeout = <T,>(p: Promise<T>, ms: number, message: string): Promise<T> => {
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error(message)), ms);
        p.then(
          (v) => {
            clearTimeout(t);
            resolve(v);
          },
          (e) => {
            clearTimeout(t);
            reject(e);
          },
        );
      });
    };

    const buildTextStreamResponse = async (provider: AIProvider) => {
      const model =
        provider === "openai" ? getOpenAiModel() : getRecommendationModel();

      if (!model) {
        throw new Error(
          `${provider.toUpperCase()} model is not configured (missing API key).`,
        );
      }

      const llm = typeof model === "object" && "model" in model ? model.model : model;

      const response = await streamText({
        model: llm,
        system: SYSTEM_PROMPT,
        messages: [
          ...data.conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          {
            role: "user" as const,
            content: data.message,
          },
        ],
        temperature: 0.8,
      });

      return response.toTextStreamResponse();
    };

    try {
      console.info("[ai] chatWithAI start", {
        providerRequested,
        historyCount: data.conversationHistory.length,
      });

      // First attempt: use requested provider
      const firstProvider = providerRequested;
      const response = await withTimeout(
        buildTextStreamResponse(firstProvider),
        TIMEOUT_MS,
        `AI timeout after ${TIMEOUT_MS}ms (${firstProvider})`,
      );

      console.info("[ai] chatWithAI success", {
        providerRequested,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (e) {
      // Fallback attempt Gemini -> OpenAI
      console.error("[ai] chatWithAI first attempt failed", {
        providerRequested,
        err: e instanceof Error ? e.message : e,
      });

      const fallbackProvider: AIProvider = providerRequested === "gemini" ? "openai" : "gemini";

      try {
        console.info("[ai] chatWithAI fallback", {
          from: providerRequested,
          to: fallbackProvider,
        });

        const response = await withTimeout(
          buildTextStreamResponse(fallbackProvider),
          TIMEOUT_MS,
          `AI timeout after ${TIMEOUT_MS}ms (fallback ${fallbackProvider})`,
        );

        return response;
      } catch (e2) {
        console.error("[ai] chatWithAI fallback failed", {
          from: providerRequested,
          to: fallbackProvider,
          err: e2 instanceof Error ? e2.message : e2,
        });

        // Return a simple text response to ensure the client stops loading.
        const msg =
          e2 instanceof Error
            ? e2.message
            : "AI temporarily unavailable. Please try again.";

        return new Response(
          msg,
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }
    }
  });

/**
 * Get anime query suggestions for autocomplete
 */
export const getAISuggestions = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        query: z.string().min(1).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Mock suggestions for UI preview
    const suggestions = [
      "Recommend anime like Death Note",
      "Best beginner anime",
      "Emotional anime with great romance",
      "Short anime under 13 episodes",
      "Donghua recommendations",
      "Anime with overpowered main character",
      "Psychological thriller anime",
      "Funny comedy anime",
      "Action anime with good plot",
      "Anime with sad endings",
    ];

    return suggestions
      .filter((s) => s.toLowerCase().includes(data.query.toLowerCase()))
      .slice(0, 5);
  });
