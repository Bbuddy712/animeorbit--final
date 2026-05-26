import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { getRecommendationModel } from "@/lib/ai/providers";
import { withRetry } from "@/lib/retry";

/**
 * Beginner preference schema
 */
export const BeginnerPreferencesSchema = z.object({
  genres: z.array(z.string()).min(1).max(5).describe("Selected genres"),
  mood: z
    .enum(["action", "emotional", "lighthearted", "dark", "balanced"])
    .describe("Overall mood preference"),
  pace: z.enum(["short", "medium", "long"]).describe("Series length preference"),
  complexity: z.enum(["simple", "moderate", "complex"]).describe("Story complexity tolerance"),
  hasFavoriteShows: z.boolean().describe("Has watched other anime/shows"),
  favoriteExamples: z.array(z.string()).optional().describe("Favorite anime/shows"),
});

export type BeginnerPreferences = z.infer<typeof BeginnerPreferencesSchema>;

/**
 * Recommendation schema for beginner packs
 */
const RecommendationSchema = z.object({
  query: z.string().describe("Search query for anime"),
  title: z.string().describe("Anime title"),
  why: z.string().max(150).describe("Why this is perfect for beginners"),
  tags: z.array(z.string()).max(4).describe("Genre/theme tags"),
});

const BeginnerPackSchema = z.object({
  pack: z.enum([
    "action",
    "dark_thriller",
    "emotional",
    "comedy",
    "romance",
    "fantasy",
    "mind_games",
    "donghua",
  ]),
  title: z.string(),
  description: z.string(),
  recommendations: z.array(RecommendationSchema).min(3).max(5),
});

/**
 * Generate beginner starter pack recommendations using AI
 */
export const generateBeginnerPack = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        packType: z.string(),
        preferences: BeginnerPreferencesSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = getRecommendationModel();
    if (!model) {
      return {
        pack: data.packType,
        title: `${data.packType} Starter Pack`,
        description: "Curated for beginners",
        recommendations: [],
      };
    }

    const prompt = `You are an expert anime recommendation system for complete beginners.

User Preferences:
- Genres: ${data.preferences.genres.join(", ")}
- Mood: ${data.preferences.mood}
- Length preference: ${data.preferences.pace === "short" ? "13-14 episodes" : data.preferences.pace === "medium" ? "24-26 episodes" : "50+ episodes"}
- Story complexity: ${data.preferences.complexity}
${data.preferences.favoriteExamples ? `- Loved: ${data.preferences.favoriteExamples.join(", ")}` : ""}

Create a "${data.packType}" starter pack with beginner-friendly anime. Each recommendation should:
1. Be PERFECT for someone new to anime
2. Have strong cultural/art impact
3. Be easy to understand without complex lore
4. Have great English dub + sub options
5. Match their mood preference

Return 3-5 recommendations in the "${data.packType}" category.`;

    try {
      const { object } = await withRetry(() =>
        generateObject({
          model: model.model,
          schema: BeginnerPackSchema,
          prompt,
        }),
      );
      return object;
    } catch (e) {
      console.error("generateBeginnerPack failed:", e);
      return {
        pack: data.packType,
        title: `${data.packType} Starter Pack`,
        description: "Recommended for beginners",
        recommendations: [],
      };
    }
  });

/**
 * Generate personalized onboarding explanation
 */
export const generateOnboardingWelcome = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ preferences: BeginnerPreferencesSchema }).parse(input))
  .handler(async ({ data }) => {
    const model = getRecommendationModel();
    if (!model) {
      return {
        welcome: "Welcome to AnimeOrbit! Start your anime journey here.",
        tips: [] as string[],
      };
    }

    const prompt = `Create a friendly 1-2 sentence welcome message and 3 beginner tips for someone starting their anime journey with these preferences:
- Genres: ${data.preferences.genres.join(", ")}
- Mood: ${data.preferences.mood}
- Experience: ${data.preferences.hasFavoriteShows ? "Has watched anime before" : "Brand new to anime"}

Focus on making them feel excited and confident about exploring anime.`;

    try {
      const { object } = await withRetry(() =>
        generateObject({
          model: model.model,
          schema: z.object({
            welcome: z.string().max(200),
            tips: z.array(z.string()).max(3),
          }),
          prompt,
        }),
      );
      return object;
    } catch (e) {
      console.error("generateOnboardingWelcome failed:", e);
      return {
        welcome: "Welcome to AnimeOrbit! Start your anime journey here.",
        tips: [
          "Start with beginner-friendly anime to build your taste",
          "Don't skip the opening sequences - anime OP/ED songs are iconic",
          "Join discussions and find your favorite anime communities",
        ],
      };
    }
  });
