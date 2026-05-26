import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { getGeminiKey, getOpenAiKey } from "@/lib/env.server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/";
const GEMINI_MODEL = "gemini-2.0-flash";
const OPENAI_MODEL = "gpt-4o-mini";

export type AiProvider = "gemini" | "openai";

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: GEMINI_BASE,
    apiKey,
  });
}

export function createOpenAiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    apiKey,
    baseURL: "https://api.openai.com/v1/",
  });
}

/**
 * Primary: Gemini. Fallback: OpenAI. Returns null if neither key is in `.env`.
 */
export function getRecommendationModel(): { model: LanguageModel; provider: AiProvider } | null {
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    return {
      model: createGeminiProvider(geminiKey)(GEMINI_MODEL),
      provider: "gemini",
    };
  }

  const openAiKey = getOpenAiKey();
  if (openAiKey) {
    return {
      model: createOpenAiProvider(openAiKey)(OPENAI_MODEL),
      provider: "openai",
    };
  }

  return null;
}

/** OpenAI-only model for optional chat endpoint. */
export function getOpenAiModel(): LanguageModel | null {
  const key = getOpenAiKey();
  if (!key) return null;
  return createOpenAiProvider(key)(OPENAI_MODEL);
}
