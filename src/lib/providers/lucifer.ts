/**
 * Lucifer Donghua deep-link utilities (external redirect only).
 *
 * Provider:
 *   https://luciferdonghua.in/
 *
 * Example:
 *   https://luciferdonghua.in/anime/renegade-immortal-xian-ni/
 *
 * Requirements:
 * - donghua title normalization
 * - generate direct anime detail links
 * - graceful fallback if cannot generate
 * - keep deterministic (avoid random token guessing)
 */

export const LUCIFER_BASE = "https://luciferdonghua.in" as const;

function normalizeDonghuaTitle(input: string): string {
  const raw = (input ?? "").toString().trim().toLowerCase();

  // Replace common separators with space/hyphen friendly tokens
  let s = raw
    .replace(/[\u2019']/g, "") // apostrophes
    .replace(/&/g, " and ")
    .replace(/[:]/g, " ")
    .replace(/\./g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");

  // Keep alnum + spaces + hyphens candidates, drop the rest
  s = s.replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

  // Hyphenate
  s = s.replace(/\s+/g, "-");

  // Cleanup hyphens
  return s.replace(/^-+/, "").replace(/-+$/, "");
}

/**
 * Deterministic slug builder.
 *
 * Note:
 * - If the site's slug includes extra suffix tokens that cannot be inferred,
 *   the resolver will gracefully fall back to search.
 */
export function buildLuciferAnimeUrl(title: string): string | null {
  const slug = normalizeDonghuaTitle(title);
  if (!slug) return null;

  // luciferdonghua links often have trailing slash.
  return `${LUCIFER_BASE}/anime/${slug}/`;
}

/**
 * Minimal domain reachability check (optional).
 * We keep it deterministic and cheap.
 */
export async function isLuciferReachable(timeoutMs = 2500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(LUCIFER_BASE, {
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
