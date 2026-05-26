/**
 * Provider Domain Checker & Resolver
 * Intelligent system for validating and selecting working provider domains
 * - Checks domain availability with timeout protection
 * - Caches results
 * - Manages localStorage preferences
 * - Provides fallback mechanisms
 */

import { getProviderConfig, getProviderMirrors } from "@/lib/providers.config";

export type ProviderCheckResult = {
  providerId: string;
  domain: string;
  working: boolean;
  cached: boolean;
  timestamp: number;
};

export type ProviderPreference = {
  providerId: string;
  preferredDomain: string;
  timestamp: number;
};

const CACHE_KEY_PREFIX = "animeorbit:provider-health:";
const PREFERENCE_KEY_PREFIX = "animeorbit:provider-preference:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DOMAIN_CHECK_TIMEOUT_MS = 4000; // 4 seconds per domain

/**
 * Get cache key for provider domain
 */
function getCacheKey(providerId: string, domain: string): string {
  return `${CACHE_KEY_PREFIX}${providerId}:${domain}`;
}

/**
 * Get preference key for provider
 */
function getPreferenceKey(providerId: string): string {
  return `${PREFERENCE_KEY_PREFIX}${providerId}`;
}

/**
 * Check if a domain is reachable
 */
export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOMAIN_CHECK_TIMEOUT_MS);

    const response = await fetch(domain, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(timeout);

    // Accept 2xx, 3xx, 4xx responses as "working"
    // Only 5xx and timeouts are considered unavailable
    return response.status < 500;
  } catch (error) {
    // If HEAD fails, try GET
    if (error instanceof Error && error.message === "Failed to fetch") {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DOMAIN_CHECK_TIMEOUT_MS);

        const response = await fetch(domain, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        clearTimeout(timeout);
        return response.status < 500;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Get cached domain check result
 */
function getCachedResult(providerId: string, domain: string): ProviderCheckResult | null {
  if (typeof window === "undefined") return null;

  const key = getCacheKey(providerId, domain);
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  try {
    const result = JSON.parse(cached) as ProviderCheckResult;

    // Check if cache is still valid
    if (Date.now() - result.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return { ...result, cached: true };
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Cache domain check result
 */
function cacheResult(
  providerId: string,
  domain: string,
  working: boolean,
): ProviderCheckResult {
  if (typeof window === "undefined") {
    return { providerId, domain, working, cached: false, timestamp: 0 };
  }

  const result: ProviderCheckResult = {
    providerId,
    domain,
    working,
    cached: false,
    timestamp: Date.now(),
  };

  try {
    const key = getCacheKey(providerId, domain);
    localStorage.setItem(key, JSON.stringify(result));
  } catch (error) {
    console.error("Failed to cache provider check result:", error);
  }

  return result;
}

/**
 * Get user's preferred domain for a provider (or null if none set)
 */
export function getProviderPreference(providerId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const key = getPreferenceKey(providerId);
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const preference = JSON.parse(stored) as ProviderPreference;
    return preference.preferredDomain;
  } catch {
    return null;
  }
}

/**
 * Save user's preferred domain for a provider
 */
export function setProviderPreference(providerId: string, domain: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = getPreferenceKey(providerId);
    const preference: ProviderPreference = {
      providerId,
      preferredDomain: domain,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(preference));
  } catch (error) {
    console.error("Failed to save provider preference:", error);
  }
}

/**
 * Clear user's preferred domain for a provider
 */
export function clearProviderPreference(providerId: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = getPreferenceKey(providerId);
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Find first working domain for a provider
 * Returns working domain or falls back to preferred/primary domain
 */
export async function findWorkingDomain(providerId: string): Promise<string | null> {
  const config = getProviderConfig(providerId);
  if (!config) return null;

  // Check for user preference first
  const userPreference = getProviderPreference(providerId);
  if (userPreference) {
    // Verify it still works
    const cached = getCachedResult(providerId, userPreference);
    if (cached) {
      if (cached.working) {
        return userPreference;
      }
    } else {
      // Not in cache, check it
      const available = await checkDomainAvailability(userPreference);
      cacheResult(providerId, userPreference, available);
      if (available) {
        return userPreference;
      }
    }
    // Preference is not working, clear it and find another
    clearProviderPreference(providerId);
  }

  // Get mirrors sorted by priority
  const mirrors = getProviderMirrors(providerId);

  // Check each mirror in priority order
  for (const mirror of mirrors) {
    let available: boolean;

    // Check cache first
    const cached = getCachedResult(providerId, mirror.domain);
    if (cached) {
      available = cached.working;
    } else {
      // Not in cache, check it
      available = await checkDomainAvailability(mirror.domain);
      cacheResult(providerId, mirror.domain, available);
    }

    if (available) {
      return mirror.domain;
    }
  }

  // All mirrors are down, return primary as fallback
  const primaryMirror = mirrors[0];
  return primaryMirror?.domain ?? null;
}

/**
 * Check multiple providers and return first working domain for each
 */
export async function findWorkingDomainsForProviders(
  providerIds: string[],
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Check all providers in parallel
  const promises = providerIds.map(async (id) => {
    const domain = await findWorkingDomain(id);
    results[id] = domain;
  });

  await Promise.all(promises);

  return results;
}

/**
 * Check all mirrors for a provider and get working ones
 */
export async function getWorkingMirrors(providerId: string): Promise<string[]> {
  const config = getProviderConfig(providerId);
  if (!config) return [];

  const mirrors = getProviderMirrors(providerId);
  const working: string[] = [];

  for (const mirror of mirrors) {
    let available: boolean;

    const cached = getCachedResult(providerId, mirror.domain);
    if (cached) {
      available = cached.working;
    } else {
      available = await checkDomainAvailability(mirror.domain);
      cacheResult(providerId, mirror.domain, available);
    }

    if (available) {
      working.push(mirror.domain);
    }
  }

  return working;
}

/**
 * Build search URL for a provider using first working domain
 */
export async function buildProviderSearchUrl(
  providerId: string,
  animeTitle: string,
  domain?: string,
): Promise<string | null> {
  const config = getProviderConfig(providerId);
  if (!config) return null;

  const resolvedDomain = domain ?? (await findWorkingDomain(providerId));
  if (!resolvedDomain) return null;

  const searchUrl = config.searchUrlPattern(animeTitle);

  try {
    if (searchUrl.startsWith("http")) {
      const url = new URL(searchUrl);
      const workingUrl = new URL(resolvedDomain);
      url.hostname = workingUrl.hostname;
      url.protocol = workingUrl.protocol;
      return url.toString();
    }

    const normalizedDomain = resolvedDomain.endsWith("/")
      ? resolvedDomain.slice(0, -1)
      : resolvedDomain;
    const normalizedSearch = searchUrl.startsWith("/") ? searchUrl : `/${searchUrl}`;
    return `${normalizedDomain}${normalizedSearch}`;
  } catch (error) {
    console.error(`buildProviderSearchUrl failed for ${providerId}:`, error);
    return searchUrl;
  }
}
