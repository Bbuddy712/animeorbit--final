import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateObject } from "ai";
import { getAnilistMediaByMalId } from "@/lib/anilist.server";
import { searchYoutubeAnimeVideo } from "@/lib/youtube.server";
import { getRecommendationModel } from "@/lib/ai/providers";
import { withRetry } from "@/lib/retry";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { getRequest } from "@tanstack/react-start/server";
import { smartResolveProvider, resolveProviderBatch } from "@/lib/provider-resolver.server";

export const fetchYoutubeTrailer = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(300),
        kind: z.enum(["trailer", "opening", "teaser"]).optional().default("trailer"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => searchYoutubeAnimeVideo(data.title, data.kind));

export const fetchAnilistByMalId = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ malId: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => getAnilistMediaByMalId(data.malId));

export type AnimeExtras = {
  youtubeEmbedUrl: string | null;
  anilistScore: number | null;
  anilistRank: number | null;
  anilistStatus: string | null;
  anilistStudios: string[];
  nextAiring: { episode: number; airingAt: number } | null;
};

export const fetchAnimeExtras = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        malId: z.number().int().positive(),
        title: z.string().min(1).max(300),
        hasJikanTrailer: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<AnimeExtras> => {
    const [youtube, anilist] = await Promise.all([
      data.hasJikanTrailer ? Promise.resolve(null) : searchYoutubeAnimeVideo(data.title, "trailer"),
      getAnilistMediaByMalId(data.malId),
    ]);

    const globalRank = anilist?.rankings?.find(
      (r) => r.type === "RATED" && r.context === "HIGHEST",
    );

    return {
      youtubeEmbedUrl: youtube?.embedUrl ?? null,
      anilistScore: anilist?.averageScore ?? null,
      anilistRank: globalRank?.rank ?? null,
      anilistStatus: anilist?.status ?? null,
      anilistStudios: anilist?.studios?.nodes?.map((s) => s.name) ?? [],
      nextAiring: anilist?.nextAiringEpisode ?? null,
    };
  });

/** Streaming provider with availability and language info. */
export type StreamingProvider = {
  name: "Netflix" | "Crunchyroll" | "HiAnime" | string;
  url: string;
  available: boolean;
  hasDub: boolean;
  hasSub: boolean;
  quality: "HD" | "4K" | "SD" | string;
  source: "api" | "ai" | "fallback";
};

type CacheEntry<T> = { data: T; expiry: number };
const providerCache = new Map<string, CacheEntry<StreamingProvider[]>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedProviders(title: string): StreamingProvider[] | null {
  const key = `providers:${title}`;
  const entry = providerCache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  providerCache.delete(key);
  return null;
}

function setCachedProviders(title: string, providers: StreamingProvider[]): void {
  const key = `providers:${title}`;
  providerCache.set(key, { data: providers, expiry: Date.now() + CACHE_TTL_MS });
}

const PROVIDER_SEARCH_URLS: Record<string, (title: string) => string> = {
  Netflix: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  Crunchyroll: (t) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(t)}`,
  HiAnime: (t) => `/search?keyword=${encodeURIComponent(t)}`,
};

const PROVIDER_METADATA: Record<string, { hasDub: boolean; hasSub: boolean; quality: string }> = {
  Netflix: { hasDub: true, hasSub: true, quality: "HD" },
  Crunchyroll: { hasDub: true, hasSub: true, quality: "HD" },
  HiAnime: { hasDub: true, hasSub: true, quality: "HD" },
};

async function aiValidateProviders(title: string): Promise<StreamingProvider[] | null> {
  const model = getRecommendationModel();
  if (!model) return null;

  const prompt = `You are a helpful anime streaming guide. For the anime "${title}", provide the best current working streaming provider URLs for Netflix, Crunchyroll, and HiAnime. Return valid, working URLs only. If you're unsure about a provider for this anime, omit it. Focus on accuracy.`;

  try {
    const { object } = await withRetry(() =>
      generateObject({
        model: model.model,
        schema: z.object({
          providers: z.array(
            z.object({
              name: z.enum(["Netflix", "Crunchyroll", "HiAnime"]),
              url: z.string().url(),
              available: z.boolean(),
            }),
          ),
        }),
        prompt,
      }),
    );

    return object.providers.map((p) => ({
      ...p,
      hasDub: PROVIDER_METADATA[p.name]?.hasDub ?? false,
      hasSub: PROVIDER_METADATA[p.name]?.hasSub ?? true,
      quality: PROVIDER_METADATA[p.name]?.quality ?? "HD",
      source: "ai" as const,
    }));
  } catch (e) {
    console.error("AI provider validation failed:", e);
    return null;
  }
}

function getFallbackProviders(title: string): StreamingProvider[] {
  return Object.entries(PROVIDER_SEARCH_URLS).map(([name, urlFn]) => ({
    name,
    url: urlFn(title),
    available: false,
    hasDub: PROVIDER_METADATA[name]?.hasDub ?? false,
    hasSub: PROVIDER_METADATA[name]?.hasSub ?? true,
    quality: PROVIDER_METADATA[name]?.quality ?? "HD",
    source: "fallback" as const,
  }));
}

function assertProviderRateLimit() {
  const request = getRequest();
  const key = `provider:${rateLimitKeyFromRequest(request)}`;
  const result = checkRateLimit(key, 30, 60_000);
  if (!result.ok) {
    throw new Error(
      `Provider lookup rate limit exceeded. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`,
    );
  }
}

export const fetchStreamingProviders = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(300),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<StreamingProvider[]> => {
    const cached = getCachedProviders(data.title);
    if (cached) {
      return cached;
    }

    try {
      assertProviderRateLimit();

      const aiProviders = await aiValidateProviders(data.title);
      if (aiProviders && aiProviders.length > 0) {
        setCachedProviders(data.title, aiProviders);
        return aiProviders;
      }
    } catch (e) {
      console.error("Provider lookup error:", e);
    }

    const fallback = getFallbackProviders(data.title);
    setCachedProviders(data.title, fallback);
    return fallback;
  });

/**
 * Resolve a single provider with mirror fallback
 * Validates mirrors and returns the best available URL
 */
export const resolveProviderUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        providerId: z.string().min(1).max(50),
        animeTitle: z.string().min(1).max(300),
        providerUrls: z.record(z.string(), z.string().nullable()).optional(),
        useAiFallback: z.boolean().optional().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const resolved = await smartResolveProvider(
        data.providerId,
        data.animeTitle,
        data.providerUrls?.[data.providerId] ?? null,
        data.useAiFallback,
      );
      return resolved;
    } catch (e) {
      console.error(`Error resolving provider ${data.providerId}:`, e);
      return null;
    }
  });

/**
 * Resolve multiple providers at once
 * Useful for loading all streaming options in parallel
 */
export const resolveMultipleProviders = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        providerIds: z.array(z.string().min(1).max(50)).min(1).max(10),
        animeTitle: z.string().min(1).max(300),
        providerUrls: z.record(z.string(), z.string().nullable()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const resolved = await resolveProviderBatch(data.providerIds, data.animeTitle, data.providerUrls ?? {});
      return resolved;
    } catch (e) {
      console.error("Error resolving multiple providers:", e);
      return {};
    }
  });
