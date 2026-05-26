// Rewritten single-file implementation for local-first preferences
export type WatchStatus =
  | "plan_to_watch"
  | "watching"
  | "completed"
  | "on_hold"
  | "dropped";

export type StoredAnime = {
  id: number;
  title: string;
  image: string | null;
  rating: number | null;
  episodes: number | null;
};

export type LocalAnime = {
  mal_id: number;
  title: string;
  image_url: string | null;
  score: number | null;
  total_episodes: number | null;
};

export type LocalWatchlistEntry = {
  mal_id: number;
  status: WatchStatus;
  episodes_watched?: number;
  anime: LocalAnime;
  updated_at: number;
};

export type StoredWatchlistEntry = StoredAnime & {
  status: WatchStatus;
  episodes_watched?: number;
  updated_at: number;
};

export type LocalRecentlyViewedEntry = {
  mal_id: number;
  anime: LocalAnime;
  viewed_at: number;
};

export type ContinueWatchingEntry = {
  mal_id: number;
  anime: LocalAnime;
  episode?: number;
  page?: number;
  updated_at: number;
};

const KEY_PREFIX = "animeorbit";
const KEYS = {
  favorites: `${KEY_PREFIX}.favorites`,
  watchlist: `${KEY_PREFIX}.watchlist`,
  recentlyViewed: `${KEY_PREFIX}.recently_viewed`,
  continueWatching: `${KEY_PREFIX}.continue_watching`,
} as const;

function available() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!available()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch (error) {
    console.debug(`[local-watchlist] read failed for ${key}:`, error);
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!available()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    console.debug(`[local-watchlist] wrote ${key}:`, value);
  } catch (error) {
    console.debug(`[local-watchlist] write failed for ${key}:`, error);
  }
}

function emit(key: string) {
  try {
    // Try to emit a standard StorageEvent (other windows)
    try {
      window.dispatchEvent(new StorageEvent("storage", { key }));
      console.debug(`[local-watchlist] emitted storage event for ${key}`);
    } catch (e) {
      // Some environments/browsers restrict constructing StorageEvent manually.
      console.debug(`[local-watchlist] could not emit native StorageEvent for ${key}:`, e);
    }

    // Also emit a same-window custom event so in-window listeners update immediately.
    try {
      window.dispatchEvent(new CustomEvent("animeorbit:storage", { detail: { key } }));
      console.debug(`[local-watchlist] emitted custom storage event for ${key}`);
    } catch (err) {
      console.debug(`[local-watchlist] failed to emit custom storage event for ${key}:`, err);
    }
  } catch (error) {
    console.debug(`[local-watchlist] failed to emit storage event for ${key}:`, error);
  }
}

function normalizeStoredAnime(raw: any): StoredAnime {
  if (!raw) {
    return { id: 0, title: "", image: null, rating: null, episodes: null };
  }

  return {
    id: raw.id ?? raw.mal_id ?? 0,
    title: raw.title ?? raw.title_english ?? raw.name ?? "",
    image: raw.image ?? raw.image_url ?? raw.images?.webp?.large_image_url ?? null,
    rating: raw.rating ?? raw.score ?? null,
    episodes: raw.episodes ?? raw.total_episodes ?? null,
  };
}

function fromStoredAnime(stored: StoredAnime): LocalAnime {
  return {
    mal_id: stored.id,
    title: stored.title,
    image_url: stored.image,
    score: stored.rating,
    total_episodes: stored.episodes,
  };
}

function toStoredAnime(anime: LocalAnime): StoredAnime {
  return {
    id: anime.mal_id,
    title: anime.title,
    image: anime.image_url,
    rating: anime.score,
    episodes: anime.total_episodes,
  };
}

// Favorites
export function listFavoritesLocal(): LocalAnime[] {
  const stored = read<unknown[]>(KEYS.favorites, []);
  return Array.isArray(stored)
    ? stored.map((item) => fromStoredAnime(normalizeStoredAnime(item)))
    : [];
}

export function isFavoriteLocal(mal_id: number): boolean {
  return listFavoritesLocal().some((anime) => anime.mal_id === mal_id);
}

export function getFavoriteLocal(mal_id: number): LocalAnime | undefined {
  return listFavoritesLocal().find((anime) => anime.mal_id === mal_id);
}

export function toggleFavoriteLocal(anime: LocalAnime): boolean {
  const cur = listFavoritesLocal();
  const i = cur.findIndex((item) => item.mal_id === anime.mal_id);
  if (i >= 0) {
    cur.splice(i, 1);
    write(KEYS.favorites, cur.map(toStoredAnime));
    emit(KEYS.favorites);
    return false;
  }
  cur.unshift(anime);
  write(KEYS.favorites, cur.map(toStoredAnime));
  emit(KEYS.favorites);
  return true;
}

export function removeFavoriteLocal(mal_id: number) {
  const cur = listFavoritesLocal();
  const next = cur.filter((item) => item.mal_id !== mal_id);
  write(KEYS.favorites, next.map(toStoredAnime));
  emit(KEYS.favorites);
}

// Watchlist (map by id)
function readWatchlist(): Record<number, StoredWatchlistEntry> {
  return read<Record<number, StoredWatchlistEntry>>(KEYS.watchlist, {} as any);
}

function writeWatchlist(m: Record<number, StoredWatchlistEntry>) {
  write(KEYS.watchlist, m);
  emit(KEYS.watchlist);
}

function fromStoredWatchlistEntry(stored: StoredWatchlistEntry): LocalWatchlistEntry {
  return {
    mal_id: stored.id,
    status: stored.status,
    episodes_watched: stored.episodes_watched,
    anime: fromStoredAnime(normalizeStoredAnime(stored)),
    updated_at: stored.updated_at,
  };
}

export function listWatchlistLocal(): LocalWatchlistEntry[] {
  const m = readWatchlist();
  return Object.values(m)
    .map(fromStoredWatchlistEntry)
    .sort((a, b) => b.updated_at - a.updated_at);
}

export function getWatchlistEntryLocal(mal_id: number): LocalWatchlistEntry | undefined {
  const m = readWatchlist();
  const stored = m[mal_id];
  return stored ? fromStoredWatchlistEntry(stored) : undefined;
}

export function upsertWatchlistLocal(
  anime: LocalAnime,
  status: WatchStatus,
  opts?: { episodes_watched?: number }
) {
  const m = readWatchlist();
  const now = Date.now();
  const storedEntry: StoredWatchlistEntry = {
    ...toStoredAnime(anime),
    status,
    episodes_watched: opts?.episodes_watched,
    updated_at: now,
  };
  m[anime.mal_id] = storedEntry;
  writeWatchlist(m);
  return fromStoredWatchlistEntry(storedEntry);
}

export function removeWatchlistLocal(mal_id: number) {
  const m = readWatchlist();
  delete m[mal_id];
  writeWatchlist(m);
}

// Recently viewed
export function listRecentlyViewedLocal(limit = 20): LocalRecentlyViewedEntry[] {
  return read<LocalRecentlyViewedEntry[]>(KEYS.recentlyViewed, []).slice(0, limit);
}

export function trackRecentlyViewedLocal(anime: LocalAnime, limit = 20) {
  const list = read<LocalRecentlyViewedEntry[]>(KEYS.recentlyViewed, []);
  const now = Date.now();
  const next = list.filter((i) => i.mal_id !== anime.mal_id);
  next.unshift({ mal_id: anime.mal_id, anime, viewed_at: now });
  const out = next.slice(0, limit);
  write(KEYS.recentlyViewed, out);
  emit(KEYS.recentlyViewed);
  return out;
}

// Continue watching
function readContinue(): Record<number, ContinueWatchingEntry> {
  return read<Record<number, ContinueWatchingEntry>>(KEYS.continueWatching, {} as any);
}

function writeContinue(m: Record<number, ContinueWatchingEntry>) {
  write(KEYS.continueWatching, m);
  emit(KEYS.continueWatching);
}

export function setContinueWatchingLocal(anime: LocalAnime, progress?: { episode?: number; page?: number }) {
  const m = readContinue();
  const now = Date.now();
  const entry: ContinueWatchingEntry = {
    mal_id: anime.mal_id,
    anime,
    episode: progress?.episode,
    page: progress?.page,
    updated_at: now,
  };
  m[anime.mal_id] = entry;
  writeContinue(m);
  return entry;
}

export function getContinueWatchingEntryLocal(mal_id: number): ContinueWatchingEntry | undefined {
  const m = readContinue();
  return m[mal_id];
}

export function listContinueWatchingLocal(): ContinueWatchingEntry[] {
  const m = readContinue();
  return Object.values(m).sort((a, b) => b.updated_at - a.updated_at);
}

// Future sync scaffold
export type SyncAdapter = { isEnabled?: boolean };
export const defaultSyncAdapter: SyncAdapter = { isEnabled: false };
export function syncToServerIfEnabled(_adapter: SyncAdapter = defaultSyncAdapter) {
  // no-op local-first
}


