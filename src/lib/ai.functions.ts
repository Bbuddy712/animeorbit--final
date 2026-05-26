import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateObject, streamObject } from "ai";
import { z } from "zod";
import { getRecommendationModel, getOpenAiModel } from "@/lib/ai/providers";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { withRetry } from "@/lib/retry";

const SCHEMA = z.object({
  query: z.string().describe("Best short search phrase for MyAnimeList/Jikan search (no quotes)."),
  tags: z
    .array(z.string())
    .max(6)
    .describe("Short keywords (genres/themes) summarizing the user's intent."),
  reasoning: z.string().max(280).describe("One-sentence friendly reason explaining the picks."),
});

const REFUSAL_MARKERS = [
  "i cannot",
  "i can't",
  "i am unable",
  "i'm unable",
  "as an ai",
  "as a language model",
  "moderation",
  "policy",
  "warning",
  "system message",
];

const SYSTEM_PROMPT =
  "You are an anime recommendation search planner. Return only schema fields for finding anime. Never mention moderation, policy, tags explanations, warnings, limitations, or system messages. If the user enters an anime title, return a query for similar anime or its closest matching genre/theme. Keep query under 6 words. Prefer anime discovery words such as action fantasy, overpowered protagonist, sad romance, psychological thriller, isekai, shounen, slice of life, supernatural, mecha, sports. Always recommend by producing a useful query, tags, and a short positive reason.";

function hasRefusalLanguage(value: string) {
  const text = value.toLowerCase();
  return REFUSAL_MARKERS.some((marker) => text.includes(marker));
}

function safeFallback(prompt: string) {
  return {
    query: prompt.slice(0, 60),
    tags: [] as string[],
    reasoning: "Here are anime picks that match your vibe.",
  };
}

function assertAiRateLimit() {
  const request = getRequest();
  const key = `ai:${rateLimitKeyFromRequest(request)}`;
  const result = checkRateLimit(key, 20, 60_000);
  if (!result.ok) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`);
  }
}

async function generateMoodHints(prompt: string) {
  const recommendation = getRecommendationModel();
  if (!recommendation) return safeFallback(prompt);

  const { model } = recommendation;
  const { object } = await withRetry(() =>
    generateObject({
      model,
      schema: SCHEMA,
      system: SYSTEM_PROMPT,
      prompt,
    }),
  );
  if (hasRefusalLanguage(`${object.query} ${object.reasoning} ${object.tags.join(" ")}`)) {
    return safeFallback(prompt);
  }
  return object;
}

export const aiMoodToQuery = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ prompt: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data }) => {
    assertAiRateLimit();

    const startedAt = Date.now();
    try {
      return await generateMoodHints(data.prompt);
    } catch (e) {
      console.error("aiMoodToQuery failed:", {
        err: e instanceof Error ? e.message : e,
        durationMs: Date.now() - startedAt,
      });
      return safeFallback(data.prompt);
    }
  });

/** Streams partial mood hints (reasoning/tags/query) for progressive UI. */
export const aiMoodToQueryStream = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ prompt: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data }) => {
    assertAiRateLimit();

    const startedAt = Date.now();
    const recommendation = getRecommendationModel();
    if (!recommendation) {
      return Response.json(safeFallback(data.prompt));
    }

    try {
      const { model } = recommendation;
      const result = streamObject({
        model,
        schema: SCHEMA,
        system: SYSTEM_PROMPT,
        prompt: data.prompt,
      });
      return result.toTextStreamResponse();
    } catch (e) {
      console.error("aiMoodToQueryStream failed:", {
        err: e instanceof Error ? e.message : e,
        durationMs: Date.now() - startedAt,
      });
      return Response.json(safeFallback(data.prompt));
    }
  });

/** Optional OpenAI chat for future tools — returns null if OPENAI_API_KEY unset. */
export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
          .min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertAiRateLimit();
    const model = getOpenAiModel();
    if (!model) throw new Error("OPENAI_API_KEY is not configured");

    const { generateText } = await import("ai");
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("No user message");

    const { text } = await withRetry(() =>
      generateText({
        model,
        system:
          "You are AnimeOrbit's helpful anime guide. Be concise and enthusiastic about anime.",
        prompt: lastUser.content,
      }),
    );
    return { reply: text };
  });
