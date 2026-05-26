"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ContinueWatchingEntry,
  LocalAnime,
  LocalRecentlyViewedEntry,
  LocalWatchlistEntry,
  WatchStatus,
} from "@/lib/local-watchlist";
import {
  getContinueWatchingEntryLocal,
  getWatchlistEntryLocal,
  isFavoriteLocal,
  listContinueWatchingLocal,
  listFavoritesLocal,
  listRecentlyViewedLocal,
  listWatchlistLocal,
  removeFavoriteLocal,
  removeWatchlistLocal,
  setContinueWatchingLocal,
  toggleFavoriteLocal,
  trackRecentlyViewedLocal,
  upsertWatchlistLocal,
} from "@/lib/local-watchlist";

function bumpReasonably(setter: React.Dispatch<React.SetStateAction<number>>) {
  setter((n) => (n + 1) % 1_000_000);
}


function useStorageBuster() {
  const [bust, setBust] = useState(0);

  const bustRef = useRef(bust);
  bustRef.current = bust;

  useEffect(() => {
    const onStorage = (e: StorageEvent | CustomEvent) => {
      // Support both native StorageEvent (from other windows) and the custom
      // same-window event `animeorbit:storage` dispatched by the local API.
      const key = (e as StorageEvent).key ?? (e as CustomEvent).detail?.key;
      if (!key) return;
      if (String(key).startsWith("animeorbit")) bumpReasonably(setBust);
    };

    const onNativeStorage = (e: StorageEvent) => onStorage(e);
    const onCustom = (e: Event) => onStorage(e as CustomEvent);

    window.addEventListener("storage", onNativeStorage);
    window.addEventListener("animeorbit:storage", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onNativeStorage);
      window.removeEventListener("animeorbit:storage", onCustom as EventListener);
    };
  }, []);

  const localBuster = useCallback(() => {
    bumpReasonably(setBust);
  }, []);

  return { bust, localBuster };
}

export function useLocalFavorites() {
  const { bust, localBuster } = useStorageBuster();
  const [favorites, setFavorites] = useState<LocalAnime[]>(() => listFavoritesLocal());

  useEffect(() => {
    setFavorites(listFavoritesLocal());
  }, []);

  useEffect(() => {
    if (bust > 0) {
      console.debug("[useLocalFavorites] storage event received, reloading favorites");
      setFavorites(listFavoritesLocal());
    }
  }, [bust]);

  const refresh = useCallback(() => {
    console.debug("[useLocalFavorites] refreshing favorites from storage");
    setFavorites(listFavoritesLocal());
    localBuster();
  }, [localBuster]);

  const isFavorite = useCallback((mal_id: number) => isFavoriteLocal(mal_id), []);

  const toggle = useCallback(
    (anime: LocalAnime) => {
      console.debug("[useLocalFavorites] toggling favorite", anime.mal_id, anime.title);
      const r = toggleFavoriteLocal(anime);
      refresh();
      return r;
    },
    [refresh]
  );

  const remove = useCallback(
    (mal_id: number) => {
      console.debug("[useLocalFavorites] removing favorite", mal_id);
      removeFavoriteLocal(mal_id);
      refresh();
    },
    [refresh]
  );

  return { favorites, isFavorite, toggle, remove, refresh };
}

export const useFavorites = useLocalFavorites;

export function useLocalWatchlist() {
  const [entries, setEntries] = useState<LocalWatchlistEntry[]>(() => listWatchlistLocal());
  const { bust, localBuster } = useStorageBuster();

  useEffect(() => {
    setEntries(listWatchlistLocal());
  }, []);

  useEffect(() => {
    if (bust > 0) {
      console.debug("[useLocalWatchlist] storage event received, reloading watchlist");
      setEntries(listWatchlistLocal());
    }
  }, [bust]);

  const refresh = useCallback(() => {
    console.debug("[useLocalWatchlist] refreshing watchlist from storage");
    setEntries(listWatchlistLocal());
    localBuster();
  }, [localBuster]);

  const upsert = useCallback(
    (anime: LocalAnime, status: WatchStatus, opts?: { episodes_watched?: number }) => {
      console.debug("[useLocalWatchlist] upserting watchlist", anime.mal_id, status);
      const r = upsertWatchlistLocal(anime, status, opts);
      refresh();
      return r;
    },
    [refresh]
  );

  const remove = useCallback(
    (mal_id: number) => {
      console.debug("[useLocalWatchlist] removing watchlist entry", mal_id);
      removeWatchlistLocal(mal_id);
      refresh();
    },
    [refresh]
  );

  const getEntry = useCallback((mal_id: number) => getWatchlistEntryLocal(mal_id), []);

  return { entries, refresh, upsert, remove, getEntry };
}

export const useWatchlist = useLocalWatchlist;

export function useLocalRecentlyViewed(limit = 20) {
  const { localBuster } = useStorageBuster();
  const [items, setItems] = useState<LocalRecentlyViewedEntry[]>(() =>
    listRecentlyViewedLocal(limit)
  );

  const refresh = useCallback(() => {
    setItems(listRecentlyViewedLocal(limit));
    localBuster();
  }, [limit, localBuster]);

  const track = useCallback(
    (anime: LocalAnime) => {
      const r = trackRecentlyViewedLocal(anime, limit);
      refresh();
      return r;
    },
    [limit, refresh]
  );

  return { items, refresh, track };
}

export function useLocalContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingEntry[]>(() =>
    listContinueWatchingLocal()
  );

  const { localBuster } = useStorageBuster();

  const refresh = useCallback(() => {
    setItems(listContinueWatchingLocal());
    localBuster();
  }, [localBuster]);

  const getEntry = useCallback(
    (mal_id: number) => getContinueWatchingEntryLocal(mal_id),
    []
  );

  const setProgress = useCallback(
    (anime: LocalAnime, progress?: { episode?: number; page?: number }) => {
      const r = setContinueWatchingLocal(anime, progress);
      refresh();
      return r;
    },
    [refresh]
  );

  return { items, refresh, getEntry, setProgress };
}

