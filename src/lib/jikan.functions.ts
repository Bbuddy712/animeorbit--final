import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { jikanApi } from "@/lib/jikan-api.server";
import { getSmartAnimeRecommendations } from "@/lib/jikan-recommendations.server";

const limitSchema = z.number().int().min(1).max(50).optional().default(12);
const idSchema = z.number().int().positive();

export const jikanGetTrending = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ limit: limitSchema }).parse(input ?? {}))
  .handler(async ({ data }) => jikanApi.getTrending(data.limit));

export const jikanGetTopAnime = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ limit: limitSchema }).parse(input ?? {}))
  .handler(async ({ data }) => jikanApi.getTopAnime(data.limit));

export const jikanGetSeasonNow = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ limit: limitSchema }).parse(input ?? {}))
  .handler(async ({ data }) => jikanApi.getSeasonNow(data.limit));

export const jikanGetRandom = createServerFn({ method: "GET" }).handler(async () =>
  jikanApi.getRandom(),
);

export const jikanSearchAnime = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        q: z.string().min(1).max(200),
        limit: limitSchema,
        page: z.number().int().min(1).max(25).optional().default(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => jikanApi.searchAnime(data.q, data.limit, data.page));

export const jikanGetAnimeById = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: idSchema }).parse(input))
  .handler(async ({ data }) => jikanApi.getAnimeById(data.id));

export const jikanGetAnimeCharacters = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: idSchema }).parse(input))
  .handler(async ({ data }) => jikanApi.getAnimeCharacters(data.id));

export const jikanGetAnimeRecommendations = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: idSchema }).parse(input))
  .handler(async ({ data }) => jikanApi.getAnimeRecommendations(data.id));

export const jikanGetAnimeStreaming = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: idSchema }).parse(input))
  .handler(async ({ data }) => jikanApi.getAnimeStreaming(data.id));

export const jikanGetByGenre = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ genreId: idSchema, limit: limitSchema }).parse(input))
  .handler(async ({ data }) => jikanApi.getByGenre(data.genreId, data.limit));

export const jikanSmartRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        prompt: z.string().min(1).max(500),
        limit: z.number().int().min(1).max(24).optional().default(8),
        hints: z
          .object({
            query: z.string().optional(),
            tags: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) =>
    getSmartAnimeRecommendations(data.prompt, data.limit, data.hints ?? {}),
  );
