import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { jikanSmartRecommendations } from "@/lib/jikan.functions";

/**
 * Fuzzy search algorithm for typo tolerance
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[len2][len1];
}

/**
 * Check if strings match with fuzzy matching
 */
function fuzzyMatch(query: string, target: string, maxDistance: number = 2): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  // Exact match gets highest priority
  if (t.includes(q) || q.includes(t)) return true;

  // Fuzzy match with distance threshold
  const distance = calculateLevenshteinDistance(q, t);
  return distance <= maxDistance;
}

/**
 * Enhanced search with multiple discovery categories
 */
export const enhancedSearch = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        query: z.string().min(1).max(200),
        limit: z.number().default(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      // Get base results
      const results = await jikanSmartRecommendations({
        data: {
          prompt: data.query,
          limit: data.limit,
        },
      });

      // Enhanced results with search metadata
      return {
        exact: results.slice(0, Math.ceil(results.length * 0.3)),
        similar: results.slice(Math.ceil(results.length * 0.3), Math.ceil(results.length * 0.6)),
        related: results.slice(Math.ceil(results.length * 0.6)),
        total: results.length,
      };
    } catch (e) {
      console.error("Enhanced search failed:", e);
      return {
        exact: [],
        similar: [],
        related: [],
        total: 0,
      };
    }
  });

/**
 * Advanced discovery recommendations
 */
export const discoveryRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        category: z.enum([
          "trending",
          "popular",
          "top-rated",
          "ongoing",
          "completed",
          "hidden-gems",
          "new-releases",
          "underrated",
        ]),
        limit: z.number().default(20),
        genres: z.array(z.string()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const categoryPrompts: Record<string, string> = {
      trending: "Currently trending anime and donghua this season",
      popular: "Most popular anime of all time",
      "top-rated": "Highest rated anime on MyAnimeList",
      ongoing: "Currently airing anime",
      completed: "Finished anime series",
      "hidden-gems": "Underrated anime that deserve more attention",
      "new-releases": "Newly released anime",
      underrated: "Underrated but excellent anime",
    };

    const prompt = data.genres
      ? `${categoryPrompts[data.category]} in ${data.genres.join(", ")} genres`
      : categoryPrompts[data.category];

    try {
      const results = await jikanSmartRecommendations({
        data: {
          prompt,
          limit: data.limit,
        },
      });

      return {
        category: data.category,
        results,
        count: results.length,
      };
    } catch (e) {
      console.error("Discovery failed:", e);
      return {
        category: data.category,
        results: [],
        count: 0,
      };
    }
  });

export const aiTrendingByRegion = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        region: z.string().min(1).max(60).default("Global"),
        limit: z.number().default(14),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const prompt =
      data.region === "Global"
        ? "Most watched anime worldwide right now"
        : `Most watched anime in ${data.region} right now`;

    try {
      const results = await jikanSmartRecommendations({
        data: {
          prompt,
          limit: data.limit,
        },
      });
      return { region: data.region, results, count: results.length };
    } catch (e) {
      console.error("aiTrendingByRegion failed:", e);
      return { region: data.region, results: [], count: 0 };
    }
  });

/**
 * Search suggestions with fuzzy matching
 */
export const getSearchSuggestions = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        query: z.string().min(1).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const suggestions = [
      "Death Note",
      "Naruto",
      "Attack on Titan",
      "Demon Slayer",
      "My Hero Academia",
      "One Piece",
      "Jujutsu Kaisen",
      "Chainsaw Man",
      "Mob Psycho 100",
      "Steins;Gate",
      "Evangelion",
      "Neon Genesis Evangelion",
      "Cowboy Bebop",
      "Fullmetal Alchemist",
      "Code Geass",
      "The Rising of the Shield Hero",
      "That Time I Got Reincarnated as a Slime",
      "Solo Leveling",
      "Tower of God",
      "Omniscient Reader's Viewpoint",
    ];

    const q = data.query.toLowerCase();

    // Exact prefix matches first
    const exactMatches = suggestions.filter((s) => s.toLowerCase().startsWith(q));

    // Then fuzzy matches
    const fuzzyMatches = suggestions.filter(
      (s) => !exactMatches.includes(s) && fuzzyMatch(data.query, s),
    );

    return [...exactMatches, ...fuzzyMatches].slice(0, 8);
  });
