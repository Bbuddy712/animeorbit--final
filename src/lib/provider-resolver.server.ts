/**
 * Provider Resolver System
 * Handles mirror validation, fallback logic, and domain resolution
 * - Timeout protection on every fetch
 * - Retry system with graceful fallback
 * - Prevents crash on all-mirrors-down scenario
 */

import { generateObject } from "ai";
import { z } from "zod";
import { getRecommendationModel } from "@/lib/ai/providers";
import { withRetry } from "@/lib/retry";
import {
  getProviderConfig,
  getProviderMirrors,
  buildProviderSearchUrl,
  updateProviderMirrorStatus,
} from "@/lib/providers.config";

type ProviderUrlOverrides = Record<string, string | null | undefined>;

function normalizeProviderUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = trimmed.startsWith("//")
    ? `https:${trimmed}`
    : /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function providerDomainFromUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

const MIRROR_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const VALIDATION_TIMEOUT_MS = 4000; // 4s per mirror check
const MAX_MIRROR_RETRIES = 2; // retry each mirror up to 2 times

const mirrorValidationCache = new Map<string, { domain: string; expiry: number }>();

/**
 * Validate if a domain is reachable with timeout + retry protection.
 * Returns true only if the domain responds with a non-error status.
 */
async function validateMirrorDomain(
  domain: string,
  retries = MAX_MIRROR_RETRIES,
): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);

      const response = await fetch(domain, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,*/*",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Accept any 2xx or 3xx as "reachable"
      if (response.status < 500) {
        return true;
      }
    } catch (e) {
      const isAbort =
        e instanceof Error && (e.name === "AbortError" || e.message.includes("abort"));
      if (isAbort) {
        console.debug(`Mirror timeout for ${domain} (attempt ${attempt + 1})`);
      } else {
        console.debug(`Mirror validation failed for ${domain} (attempt ${attempt + 1}):`, e);
      }
      // Don't retry on last attempt
      if (attempt === retries) break;
      // Small backoff before retry
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return false;
}

/**
 * Get cached valid mirror for provider
 */
function getCachedMirror(providerId: string): string | null {
  const key = `mirror:${providerId}`;
  const cached = mirrorValidationCache.get(key);

  if (cached && Date.now() < cached.expiry) {
    return cached.domain;
  }

  mirrorValidationCache.delete(key);
  return null;
}

/**
 * Cache validated mirror
 */
function cacheMirror(providerId: string, domain: string): void {
  const key = `mirror:${providerId}`;
  mirrorValidationCache.set(key, {
    domain,
    expiry: Date.now() + MIRROR_CACHE_TTL_MS,
  });
}

/**
 * Resolve provider with mirror fallback.
 * Returns the first accessible mirror URL, or null if all fail.
 * Never throws — always returns gracefully.
 */
export async function resolveProviderMirror(providerId: string): Promise<string | null> {
  const config = getProviderConfig(providerId);
  if (!config) return null;

  // Check cache first
  const cached = getCachedMirror(providerId);
  if (cached) {
    return cached;
  }

  // Get mirrors sorted by priority
  const mirrors = getProviderMirrors(providerId);
  if (mirrors.length === 0) return null;

  // Try each mirror in order of priority — wrapped in try/catch to prevent crashes
  for (const mirror of mirrors) {
    if (!mirror.active) continue;

    try {
      const isValid = await validateMirrorDomain(mirror.domain);
      if (isValid) {
        cacheMirror(providerId, mirror.domain);
        return mirror.domain;
      } else {
        // Mark mirror as inactive if validation fails
        updateProviderMirrorStatus(providerId, mirror.domain, false);
      }
    } catch (e) {
      console.debug(`Error validating mirror ${mirror.domain}:`, e);
      continue;
    }
  }

  // All mirrors failed — reset active flags so next request retries them
  mirrors.forEach((m) => updateProviderMirrorStatus(providerId, m.domain, true));
  console.warn(`All mirrors failed for provider: ${providerId}`);
  return null;
}

/**
 * Build final provider URL with mirror resolution.
 * Falls back to first mirror's search URL if validation fails.
 */
export async function buildProviderUrl(
  providerId: string,
  animeTitle: string,
  providerUrlOverride?: string | null,
): Promise<{ url: string; mirror: string; resolved: boolean } | null> {
  const config = getProviderConfig(providerId);
  if (!config) return null;

  // Try to resolve a working mirror
  const mirror = await resolveProviderMirror(providerId);

  const normalizedOverrideUrl = normalizeProviderUrl(providerUrlOverride);
  if (normalizedOverrideUrl) {
    return {
      url: normalizedOverrideUrl,
      mirror: providerDomainFromUrl(normalizedOverrideUrl),
      resolved: true,
    };
  }

  if (mirror) {
    // Prefer deterministic deep-links (anime detail pages) when available.
    if (config.deepLinkUrlPattern) {
      try {
        const deepLink = await config.deepLinkUrlPattern(animeTitle);
        if (deepLink) {
          return {
            url: deepLink,
            mirror,
            resolved: true,
          };
        }
      } catch (e) {
        console.debug(`Deep-link build failed for ${providerId}:`, e);
      }
    }

    // Legacy behavior: use search URL pattern with mirror domain swapping.
    const searchPath = config.searchUrlPattern(animeTitle);

    let finalUrl: string;
    try {
      if (searchPath.startsWith("http")) {
        const urlObj = new URL(searchPath);
        const mirrorUrl = new URL(mirror);
        urlObj.hostname = mirrorUrl.hostname;
        urlObj.protocol = mirrorUrl.protocol;
        finalUrl = urlObj.toString();
      } else {
        const baseUrl = mirror.endsWith("/") ? mirror.slice(0, -1) : mirror;
        const path = searchPath.startsWith("/") ? searchPath : `/${searchPath}`;
        finalUrl = `${baseUrl}${path}`;
      }
    } catch (e) {
      console.error(`Error constructing provider URL for ${providerId}:`, e);
      finalUrl = mirror;
    }

    return {
      url: finalUrl,
      mirror,
      resolved: true,
    };
  }

  // No validated mirror: try deep-link builder (may include its own domain health logic),
  // otherwise fall back to the first mirror's search URL.
  if (config.deepLinkUrlPattern) {
    try {
      const deepLink = await config.deepLinkUrlPattern(animeTitle);
      if (deepLink) {
        const firstMirror = config.mirrors[0]?.domain ?? "unknown";
        return {
          url: deepLink,
          mirror: firstMirror,
          resolved: false,
        };
      }
    } catch {
      // ignore
    }
  }

  const fallbackUrl = buildProviderSearchUrl(providerId, animeTitle);
  if (fallbackUrl) {
    const firstMirror = config.mirrors[0]?.domain ?? "";
    let resolvedFallback = fallbackUrl;
    if (fallbackUrl.startsWith("/") && firstMirror) {
      const base = firstMirror.endsWith("/") ? firstMirror.slice(0, -1) : firstMirror;
      resolvedFallback = `${base}${fallbackUrl}`;
    }
    return {
      url: resolvedFallback,
      mirror: firstMirror || "unknown",
      resolved: false,
    };
  }

  return null;
}

/**
 * AI-Powered Mirror Discovery (Advanced)
 * Searches for latest provider mirrors if current ones are down
 */
async function aiDiscoverMirrors(providerId: string, providerName: string): Promise<string[]> {
  const model = getRecommendationModel();
  if (!model) return [];

  try {
    const { object } = await withRetry(() =>
      generateObject({
        model: model.model,
        schema: z.object({
          mirrors: z
            .array(z.string().url())
            .describe("List of current working mirror URLs for this provider"),
        }),
        prompt: `You are a helpful resource finder. Find the current working mirror URLs for the ${providerName} anime streaming provider. Return only valid URLs that currently work. Focus on accuracy and only return actual working mirrors.`,
      }),
    );

    return object.mirrors;
  } catch (e) {
    console.debug("AI mirror discovery failed:", e);
    return [];
  }
}

/**
 * Smart Provider Resolution with AI Fallback
 * Tries standard mirrors first, then AI discovery if needed.
 * Never throws — always returns gracefully.
 */
export async function smartResolveProvider(
  providerId: string,
  animeTitle: string,
  providerUrlOverride?: string | null,
  useAiFallback = true,
): Promise<{
  url: string;
  mirror: string;
  source: "cache" | "validated" | "ai" | "fallback";
} | null> {
  const config = getProviderConfig(providerId);
  if (!config) return null;

  try {
    // Try standard resolution with mirror validation
    const resolved = await buildProviderUrl(providerId, animeTitle, providerUrlOverride);
    if (resolved) {
      const source = resolved.resolved ? "validated" : "fallback";
      return {
        ...resolved,
        source: providerUrlOverride ? "validated" : getCachedMirror(providerId) ? "cache" : source,
      };
    }

    // If AI fallback enabled and all standard mirrors failed, try AI discovery
    if (useAiFallback) {
      try {
        const aiMirrors = await aiDiscoverMirrors(providerId, config.name);
        if (aiMirrors.length > 0) {
          for (const mirror of aiMirrors) {
            const isValid = await validateMirrorDomain(mirror);
            if (isValid) {
              const searchPath = config.searchUrlPattern(animeTitle);

              let finalUrl: string;
              try {
                if (searchPath.startsWith("http")) {
                  const urlObj = new URL(searchPath);
                  urlObj.hostname = new URL(mirror).hostname;
                  finalUrl = urlObj.toString();
                } else {
                  const baseUrl = mirror.endsWith("/") ? mirror.slice(0, -1) : mirror;
                  const path = searchPath.startsWith("/") ? searchPath : `/${searchPath}`;
                  finalUrl = `${baseUrl}${path}`;
                }
              } catch {
                finalUrl = mirror;
              }

              cacheMirror(providerId, mirror);
              return {
                url: finalUrl,
                mirror,
                source: "ai",
              };
            }
          }
        }
      } catch (e) {
        console.debug("Smart provider resolution: AI fallback failed:", e);
      }
    }
  } catch (e) {
    console.error(`smartResolveProvider crashed for ${providerId}:`, e);
  }

  // Last resort: return a fallback search URL so the UI never shows "Failed"
  const fallbackUrl = buildProviderSearchUrl(providerId, animeTitle);
  if (fallbackUrl) {
    const firstMirror = config.mirrors[0]?.domain ?? "";
    let resolvedFallback = fallbackUrl;
    if (fallbackUrl.startsWith("/") && firstMirror) {
      const base = firstMirror.endsWith("/") ? firstMirror.slice(0, -1) : firstMirror;
      resolvedFallback = `${base}${fallbackUrl}`;
    }
    return {
      url: resolvedFallback,
      mirror: firstMirror || "unknown",
      source: "fallback",
    };
  }

  return null;
}

/**
 * Batch resolve multiple providers
 * Useful for loading multiple streaming options at once.
 * Each provider resolves independently — one failure won't block others.
 */
export async function resolveProviderBatch(
  providerIds: string[],
  animeTitle: string,
  providerUrlOverrides?: ProviderUrlOverrides,
): Promise<
  Record<
    string,
    {
      url: string;
      mirror: string;
      source: "cache" | "validated" | "ai" | "fallback";
    } | null
  >
> {
  const results: Record<
    string,
    {
      url: string;
      mirror: string;
      source: "cache" | "validated" | "ai" | "fallback";
    } | null
  > = {};

  await Promise.allSettled(
    providerIds.map(async (id) => {
      try {
        results[id] = await smartResolveProvider(id, animeTitle, providerUrlOverrides?.[id]);
      } catch (e) {
        console.error(`resolveProviderBatch: failed for ${id}:`, e);
        results[id] = null;
      }
    }),
  );

  return results;
}

/**
 * Clear cache for testing or when provider changes
 */
export function clearMirrorCache(): void {
  mirrorValidationCache.clear();
}

/**
 * Get mirror cache stats (for debugging)
 */
export function getMirrorCacheStats(): {
  size: number;
  entries: Array<{ provider: string; mirror: string; expiry: number }>;
} {
  const entries = Array.from(mirrorValidationCache.entries()).map(([key, value]) => ({
    provider: key.replace("mirror:", ""),
    mirror: value.domain,
    expiry: value.expiry,
  }));

  return {
    size: mirrorValidationCache.size,
    entries,
  };
}
