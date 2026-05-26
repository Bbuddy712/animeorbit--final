import { getYoutubeKey } from "@/lib/env.server";
import { withRetry } from "@/lib/retry";

export type YoutubeVideo = {
  videoId: string;
  title: string;
  embedUrl: string;
  kind: "trailer" | "opening" | "teaser" | "video";
};

const CACHE = new Map<string, { value: YoutubeVideo | null; expiresAt: number }>();
const CACHE_TTL = 30 * 60_000;

export async function searchYoutubeAnimeVideo(
  title: string,
  kind: "trailer" | "opening" | "teaser" = "trailer",
): Promise<YoutubeVideo | null> {
  const apiKey = getYoutubeKey();
  if (!apiKey || !title.trim()) return null;

  const cacheKey = `${kind}:${title.toLowerCase()}`;
  const hit = CACHE.get(cacheKey);
  if (hit && Date.now() < hit.expiresAt) return hit.value;

  const suffix =
    kind === "opening" ? " anime opening" : kind === "teaser" ? " anime teaser" : " anime trailer";
  const q = `${title}${suffix}`;

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "3");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("key", apiKey);

    const data = await withRetry(async () => {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`YouTube API ${res.status}`);
      return res.json() as Promise<{
        items?: { id: { videoId?: string }; snippet: { title: string } }[];
      }>;
    });

    const item = data.items?.find((i) => i.id.videoId);
    if (!item?.id.videoId) {
      CACHE.set(cacheKey, { value: null, expiresAt: Date.now() + CACHE_TTL });
      return null;
    }

    const video: YoutubeVideo = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      kind,
    };
    CACHE.set(cacheKey, { value: video, expiresAt: Date.now() + CACHE_TTL });
    return video;
  } catch (error) {
    console.warn("YouTube search failed:", error);
    return null;
  }
}
