import type { Anime, Character, StreamingLink } from "@/lib/anime.types";
import { withRetry } from "@/lib/retry";

const BASE = "https://api.jikan.moe/v4";
const MIN_INTERVAL_MS = 350;
const CACHE_TTL_MS = 5 * 60_000;

type CacheEntry<T> = { value: T; expiresAt: number };

const cache = new Map<string, CacheEntry<unknown>>();
let lastRequestAt = 0;
let queue: Promise<void> = Promise.resolve();

async function throttle(): Promise<void> {
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestAt));
    if (wait > 0) await new Promise<void>((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
  };
  const next = queue.then(run);
  queue = next.catch(() => {});
  await next;
}

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCache<T>(key: string, value: T, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Tracks in-flight requests to avoid thundering herd on concurrent renders.
const inflight = new Map<string, Promise<unknown>>();

async function jget<T>(path: string): Promise<T> {
  const cacheKey = `jikan:${path}`;

  // Serve cached response immediately when available.
  const hit = getCached<T>(cacheKey);
  if (hit !== undefined) return hit;

  // Dedupe concurrent fetches for the same cacheKey.
  const existing = inflight.get(cacheKey) as Promise<T> | undefined;
  if (existing) return existing;

  const dataPromise = withRetry(async () => {
    await throttle();
    const res = await fetch(`${BASE}${path}`);
    if (res.status === 429) throw new Error("Jikan 429 rate limited");
    if (!res.ok) throw new Error(`Jikan ${res.status}`);
    return (await res.json()) as T;
  }) as Promise<T>;

  inflight.set(cacheKey, dataPromise as Promise<unknown>);

  try {
    const data = await dataPromise;
    setCache(cacheKey, data);
    return data;
  } finally {
    inflight.delete(cacheKey);
  }
}

export const jikanApi = {
  getTopAnime: (limit = 12) =>
    jget<{ data: Anime[] }>(`/top/anime?limit=${limit}`).then((r) => r.data),

  getSeasonNow: (limit = 12) =>
    jget<{ data: Anime[] }>(`/seasons/now?limit=${limit}`).then((r) => r.data),

  getTrending: (limit = 12) =>
    jget<{ data: Anime[] }>(`/top/anime?filter=airing&limit=${limit}`).then((r) => r.data),

  searchAnime: (q: string, limit = 12, page = 1) =>
    jget<{ data: Anime[] }>(
      `/anime?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}&order_by=score&sort=desc`,
    ).then((r) => r.data),

  getByGenre: (genreId: number, limit = 12) =>
    jget<{ data: Anime[] }>(
      `/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`,
    ).then((r) => r.data),

  getByGenres: (genreIds: number[], limit = 12) =>
    jget<{ data: Anime[] }>(
      `/anime?genres=${genreIds.join(",")}&order_by=score&sort=desc&limit=${limit}`,
    ).then((r) => r.data),

  getRandom: () => jget<{ data: Anime }>(`/random/anime`).then((r) => r.data),

  getAnimeById: (id: number) => jget<{ data: Anime }>(`/anime/${id}/full`).then((r) => r.data),

  getAnimeCharacters: (id: number) =>
    jget<{ data: Character[] }>(`/anime/${id}/characters`).then((r) => r.data.slice(0, 12)),

  getAnimeRecommendations: (id: number) =>
    jget<{ data: { entry: Anime }[] }>(`/anime/${id}/recommendations`).then((r) =>
      r.data.slice(0, 12).map((x) => x.entry),
    ),

  getAnimeStreaming: (id: number) =>
    jget<{ data: StreamingLink[] }>(`/anime/${id}/streaming`).then((r) => r.data),
};
