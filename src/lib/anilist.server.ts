import { getAnilistCredentials } from "@/lib/env.server";
import { withRetry } from "@/lib/retry";

const GRAPHQL_URL = "https://graphql.anilist.co";

export type AnilistMedia = {
  id: number;
  idMal: number | null;
  title: { romaji: string | null; english: string | null };
  averageScore: number | null;
  popularity: number | null;
  status: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  studios: { nodes: { name: string }[] };
  nextAiringEpisode: { airingAt: number; episode: number } | null;
  rankings: { rank: number; type: string; context: string }[];
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAnilistAccessToken(): Promise<string | null> {
  const creds = getAnilistCredentials();
  if (!creds) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  try {
    const res = await fetch("https://anilist.co/api/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
      }),
    });
    if (!res.ok) throw new Error(`AniList auth ${res.status}`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      accessToken: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    };
    return cachedToken.accessToken;
  } catch (error) {
    console.warn("AniList token failed:", error);
    return null;
  }
}

const MEDIA_BY_MAL_QUERY = `
query ($malId: Int) {
  Media(idMal: $malId, type: ANIME) {
    id
    idMal
    title { romaji english }
    averageScore
    popularity
    status
    format
    season
    seasonYear
    studios(isMain: true) { nodes { name } }
    nextAiringEpisode { airingAt episode }
    rankings { rank type context }
  }
}
`;

const CACHE = new Map<number, { value: AnilistMedia | null; expiresAt: number }>();

export async function getAnilistMediaByMalId(malId: number): Promise<AnilistMedia | null> {
  const hit = CACHE.get(malId);
  if (hit && Date.now() < hit.expiresAt) return hit.value;

  try {
    const token = await getAnilistAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const data = await withRetry(async () => {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: MEDIA_BY_MAL_QUERY,
          variables: { malId },
        }),
      });
      if (!res.ok) throw new Error(`AniList ${res.status}`);
      return res.json() as Promise<{ data?: { Media: AnilistMedia | null } }>;
    });

    const media = data.data?.Media ?? null;
    CACHE.set(malId, { value: media, expiresAt: Date.now() + 10 * 60_000 });
    return media;
  } catch (error) {
    console.warn("AniList lookup failed:", error);
    CACHE.set(malId, { value: null, expiresAt: Date.now() + 60_000 });
    return null;
  }
}
