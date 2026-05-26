/**
 * Centralized Streaming Provider Configuration
 * Easy to update provider mirrors and add new providers
 */

export type ProviderType = "subscription" | "free" | "ad-supported";
export type ProviderRegion = "global" | "us" | "eu" | "jp" | "other";

export interface ProviderMirror {
  domain: string;
  priority: number; // 1 = highest priority
  active: boolean;
  description?: string;
}

export interface StreamingProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  regions: ProviderRegion[];
  color: string;
  glow: string;
  initials: string;
  hasDub: boolean;
  hasSub: boolean;
  quality: "4K" | "HD" | "SD";
  isDonghua?: boolean; // New field for donghua badge
  isOfficial?: boolean; // Official vs community/unofficial provider
  mirrors: ProviderMirror[];

  /**
   * Deterministic deep-link builder for anime detail pages (external redirect).
   * If omitted, resolver falls back to searchUrlPattern (legacy behavior).
   */
  deepLinkUrlPattern?: (title: string) => Promise<string | null> | string | null;

  /**
   * Legacy search URL builder (fallback).
   */
  searchUrlPattern: (title: string) => string;

  description?: string;
}

/**
 * Centralized Provider Registry
 * Add new providers here or update mirrors
 */
export const PROVIDERS_CONFIG: Record<string, StreamingProviderConfig> = {
  // ─── OFFICIAL PROVIDERS ─────────────────────────────────────────────────────

  netflix: {
    id: "netflix",
    name: "Netflix",
    type: "subscription",
    regions: ["global", "us", "eu", "jp"],
    color: "#E50914",
    glow: "shadow-[0_0_30px_-5px_#E50914]",
    initials: "N",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    isOfficial: true,
    mirrors: [
      {
        domain: "https://www.netflix.com",
        priority: 1,
        active: true,
        description: "Official Netflix",
      },
    ],
    searchUrlPattern: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    description: "Premium anime and streaming service",
  },

  crunchyroll: {
    id: "crunchyroll",
    name: "Crunchyroll",
    type: "subscription",
    regions: ["global", "us", "eu", "jp"],
    color: "#F47521",
    glow: "shadow-[0_0_30px_-5px_#F47521]",
    initials: "CR",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    isOfficial: true,
    mirrors: [
      {
        domain: "https://www.crunchyroll.com",
        priority: 1,
        active: true,
        description: "Official Crunchyroll",
      },
    ],
    searchUrlPattern: (title) =>
      `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
    description: "World's largest anime streaming service",
  },

  lucifer_donghua: {
    id: "lucifer_donghua",
    name: "Lucifer Donghua",
    type: "free",
    regions: ["global"],
    color: "#FF6B35",
    glow: "shadow-[0_0_30px_-5px_#FF6B35]",
    initials: "LD",
    hasDub: false,
    hasSub: true,
    quality: "HD",
    isDonghua: true,
    isOfficial: true,
    mirrors: [
      {
        domain: "https://luciferdonghua.in",
        priority: 1,
        active: true,
        description: "Official Lucifer Donghua",
      },
    ],
    searchUrlPattern: (title) => `https://luciferdonghua.in/search?q=${encodeURIComponent(title)}`,
    description: "Official donghua streaming platform",
  },

  // ─── COMMUNITY/UNOFFICIAL PROVIDERS ──────────────────────────────────────

  hianime: {
    id: "hianime",
    name: "HiAnime",
    type: "free",
    regions: ["global"],
    color: "#8B5CF6",
    glow: "shadow-[0_0_30px_-5px_#8B5CF6]",
    initials: "HA",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    mirrors: [
      {
        domain: "https://hianime.ph",
        priority: 1,
        active: true,
        description: "HiAnime (PH)",
      },
      {
        domain: "https://hianime.se",
        priority: 2,
        active: true,
        description: "HiAnime (SE)",
      },
      {
        domain: "https://hianime.lc",
        priority: 3,
        active: true,
        description: "HiAnime (LC)",
      },
    ],
    searchUrlPattern: (title) => `https://hianime.ph/search?keyword=${encodeURIComponent(title)}`,
    description: "Community anime streaming platform",
  },

  animepahe: {
    id: "animepahe",
    name: "AnimePahe",
    type: "free",
    regions: ["global"],
    color: "#E94B3C",
    glow: "shadow-[0_0_30px_-5px_#E94B3C]",
    initials: "AP",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    mirrors: [
      {
        domain: "https://animepahe.pw",
        priority: 1,
        active: true,
        description: "AnimePahe Primary",
      },
    ],
    searchUrlPattern: (title) => `https://animepahe.pw/anime?q=${encodeURIComponent(title)}`,
    description: "Community anime streaming",
  },

  animenana: {
    id: "animenana",
    name: "AnimeNana",
    type: "free",
    regions: ["global"],
    color: "#FF1493",
    glow: "shadow-[0_0_30px_-5px_#FF1493]",
    initials: "AN",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    mirrors: [
      {
        domain: "https://animenana.com",
        priority: 1,
        active: true,
        description: "AnimeNana",
      },
    ],
    searchUrlPattern: (title) => `https://animenana.com/search?keyword=${encodeURIComponent(title)}`,
    description: "Community anime streaming",
  },

  aniwatch: {
    id: "aniwatch",
    name: "AniWatch",
    type: "free",
    regions: ["global"],
    color: "#00D4FF",
    glow: "shadow-[0_0_30px_-5px_#00D4FF]",
    initials: "AW",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    mirrors: [
      {
        domain: "https://aniwatch.co.at",
        priority: 1,
        active: true,
        description: "AniWatch (AT)",
      },
      {
        domain: "https://aniwatchtv.com.ro",
        priority: 2,
        active: true,
        description: "AniWatch (RO)",
      },
      {
        domain: "https://jp-animenities.com",
        priority: 3,
        active: true,
        description: "AniWatch (JP)",
      },
    ],
    searchUrlPattern: (title) => `https://aniwatch.co.at/search?keyword=${encodeURIComponent(title)}`,
    description: "Community anime streaming network",
  },

  "9anime": {
    id: "9anime",
    name: "9anime",
    type: "free",
    regions: ["global"],
    color: "#6366F1",
    glow: "shadow-[0_0_30px_-5px_#6366F1]",
    initials: "9A",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    mirrors: [
      {
        domain: "https://9anime.org.lv",
        priority: 1,
        active: true,
        description: "9anime",
      },
    ],
    searchUrlPattern: (title) => `https://9anime.org.lv/search?keyword=${encodeURIComponent(title)}`,
    description: "Community anime streaming",
  },
};

/**
 * Default providers for anime detail pages
 * Prioritizes official services first
 */
export const DEFAULT_PROVIDERS = ["netflix", "crunchyroll", "hianime", "animepahe", "aniwatch"];

/**
 * Default donghua providers
 */
export const DONGHUA_PROVIDERS = ["lucifer_donghua", "hianime"];

/**
 * Official providers (always shown first)
 */
export const OFFICIAL_PROVIDERS = ["netflix", "crunchyroll", "lucifer_donghua"];

/**
 * Community/unofficial providers
 */
export const COMMUNITY_PROVIDERS = ["hianime", "animepahe", "animenana", "aniwatch", "9anime"];

/**
 * Get provider config by ID
 */
export function getProviderConfig(providerId: string): StreamingProviderConfig | null {
  return PROVIDERS_CONFIG[providerId.toLowerCase()] ?? null;
}

/**
 * Get all provider IDs
 */
export function getAllProviderIds(): string[] {
  return Object.keys(PROVIDERS_CONFIG);
}

/**
 * Get active providers for a region
 */
export function getProvidersForRegion(region: ProviderRegion): string[] {
  return Object.entries(PROVIDERS_CONFIG)
    .filter(([, config]) => config.regions.includes(region))
    .map(([id]) => id);
}

/**
 * Get provider mirrors sorted by priority
 */
export function getProviderMirrors(providerId: string): ProviderMirror[] {
  const config = getProviderConfig(providerId);
  if (!config) return [];
  return [...config.mirrors].sort((a, b) => a.priority - b.priority);
}

/**
 * Build provider search URL
 */
export function buildProviderSearchUrl(providerId: string, animeTitle: string): string | null {
  const config = getProviderConfig(providerId);
  if (!config) return null;
  return config.searchUrlPattern(animeTitle);
}

/**
 * Update provider mirror status (for runtime updates)
 */
export function updateProviderMirrorStatus(
  providerId: string,
  domain: string,
  active: boolean,
): boolean {
  const config = getProviderConfig(providerId);
  if (!config) return false;

  const mirror = config.mirrors.find((m) => m.domain === domain);
  if (mirror) {
    mirror.active = active;
    return true;
  }
  return false;
}
