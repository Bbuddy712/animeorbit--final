/**
 * HiAnime deep-link utilities (external redirect only).
 *
 * Working domains:
 * - https://hianime.ph (primary)
 * - https://hianimes.se (fallback)
 *
 * Requirements:
 * - normalize anime titles
 * - generate HiAnime-style slug
 * - generate direct anime detail URL (no search)
 * - fallback domain switching
 * - graceful failure (returns null)
 */

export type HiAnimeDomain = "https://hianime.ph" | "https://hianimes.se";

const PRIMARY: HiAnimeDomain = "https://hianime.ph";
const FALLBACK: HiAnimeDomain = "https://hianimes.se";

/**
 * Best-effort title normalization:
 * - lower-case
 * - remove punctuation
 * - collapse whitespace
 * - keep alnum + spaces + hyphens
 */
export function normalizeAnimeTitle(input: string): string {
  const s = (input ?? "")
    .toString()
    .trim()
    .toLowerCase();

  // Remove common separators / punctuation
  const cleaned = s
    .replace(/[\u2019']/g, "") // apostrophes
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ") // drop non supported chars
    .replace(/\s+/g, " ")
    .trim();

  // Hyphenate multi-word titles for slug friendliness
  return cleaned.replace(/\s+/g, "-");
}

/**
 * Convert something like "Attack on Titan" -> "attack-on-titan"
 */
export function toSlugBase(title: string): string {
  const normalized = normalizeAnimeTitle(title);
  // Ensure no leading/trailing hyphens
  return normalized.replace(/^-+/, "").replace(/-+$/, "");
}

/**
 * HiAnime URL examples:
 *   https://hianime.ph/details/one-piece-n0aido
 *
 * The trailing token after the slug is variable and hard to infer deterministically.
 * Strategy:
 * - Generate the expected base slug
 * - Since the token isn't predictable, we cannot reliably build the full URL without scraping/search.
 *
 * However, requirement asks for "intelligent external streaming redirect support" and
 * "graceful fallback if URL unavailable".
 *
 * Practical approach:
 * - Try a few candidate token-less variants:
 *   1) /details/<slug> (may or may not work)
 *   2) /details/<slug>-<random> can't be done safely.
 *
 * To avoid random guessing, we only construct the deterministic base URL and rely on
 * fallback UX (resolver can mark unavailable -> search fallback).
 *
 * This utility returns the deterministic candidate(s) so resolver can attempt domain reachability.
 */

export function buildHiAnimeDetailsUrlBase(
  domain: HiAnimeDomain,
  slugBase: string,
): string {
  return `${domain}/details/${slugBase}`;
}

/**
 * Provider health check for domain reachability.
 * Uses a cheap HEAD-like strategy via GET with abort.
 */
async function validateDomainReachable(domain: string, timeoutMs = 2500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    // Note: Many sites may block HEAD; GET is more compatible.
    const res = await fetch(domain, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,*/*",
      },
    });

    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
}

export type HiAnimeDeepLinkResult =
  | { url: string; domain: HiAnimeDomain; resolved: true }
  | { url: string | null; domain: HiAnimeDomain | null; resolved: false };

export async function buildHiAnimeDeepLink(title: string): Promise<HiAnimeDeepLinkResult> {
  const slugBase = toSlugBase(title);
  if (!slugBase) return { url: null, domain: null, resolved: false };

  // Prefer primary, fallback if primary domain seems unreachable.
  const primaryOk = await validateDomainReachable(PRIMARY);
  if (primaryOk) {
    return { url: buildHiAnimeDetailsUrlBase(PRIMARY, slugBase), domain: PRIMARY, resolved: true };
  }

  const fallbackOk = await validateDomainReachable(FALLBACK);
  if (fallbackOk) {
    return { url: buildHiAnimeDetailsUrlBase(FALLBACK, slugBase), domain: FALLBACK, resolved: true };
  }

  return { url: null, domain: null, resolved: false };
}
