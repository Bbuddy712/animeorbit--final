"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Heart,
  ListChecks,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  useLocalFavorites,
  useLocalRecentlyViewed,
  useLocalWatchlist,
} from "@/hooks/use-local-preferences";
import type {
  LocalAnime,
  LocalWatchlistEntry,
  WatchStatus,
} from "@/lib/local-watchlist";

const STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: "Planned",
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
};

const STATUS_ORDER: WatchStatus[] = [
  "plan_to_watch",
  "watching",
  "completed",
  "on_hold",
  "dropped",
];

type Category = "favorites" | WatchStatus | "recentlyViewed";

const CATEGORY_LABELS: Record<Category, string> = {
  favorites: "Favorites",
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
  recentlyViewed: "Recently Viewed",
};

const CATEGORY_ICONS: Record<Category, ReactNode> = {
  favorites: <Heart className="h-4 w-4" />,
  plan_to_watch: <ListChecks className="h-4 w-4" />,
  watching: <Sparkles className="h-4 w-4" />,
  completed: <Check className="h-4 w-4" />,
  on_hold: <Clock className="h-4 w-4" />,
  dropped: <Trash2 className="h-4 w-4" />,
  recentlyViewed: <Star className="h-4 w-4" />,
};

function createWatchlistLabel(entry: LocalWatchlistEntry) {
  return `${entry.anime.title} · ${STATUS_LABELS[entry.status]}`;
}

function formatTitle(anime: LocalAnime) {
  return anime.title.length > 34 ? `${anime.title.slice(0, 34)}…` : anime.title;
}

export function LocalWatchlistMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("favorites");
  const favorites = useLocalFavorites();
  const watchlist = useLocalWatchlist();
  const recent = useLocalRecentlyViewed(10);

  const watchlistByStatus = useMemo(
    () =>
      STATUS_ORDER.reduce<Record<WatchStatus, LocalWatchlistEntry[]>>((acc, status) => {
        acc[status] = watchlist.entries.filter((entry) => entry.status === status);
        return acc;
      }, {} as Record<WatchStatus, LocalWatchlistEntry[]>),
    [watchlist.entries]
  );

  const activeItems = useMemo(() => {
    if (activeCategory === "favorites") return favorites.favorites;
    if (activeCategory === "recentlyViewed") return recent.items;
    return watchlistByStatus[activeCategory];
  }, [activeCategory, favorites.favorites, recent.items, watchlistByStatus]);

  useEffect(() => {
    if (!open) return;
    setActiveCategory("favorites");
  }, [open]);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!open) return;
      if (rootRef.current?.contains(event.target as Node)) return;
      onOpenChange(false);
    };
    window.addEventListener("mousedown", listener);
    return () => window.removeEventListener("mousedown", listener);
  }, [open, onOpenChange]);

  const handleFavoriteToggle = (anime: LocalAnime) => {
    const added = favorites.toggle(anime);
    toast.success(added ? "Added to Favorites" : "Removed from Favorites");
  };

  const handleWatchlistUpdate = (anime: LocalAnime, status: WatchStatus) => {
    watchlist.upsert(anime, status);
    toast.success(`Moved to ${STATUS_LABELS[status]}`);
  };

  const handleRemoveWatchlist = (mal_id: number) => {
    watchlist.remove(mal_id);
    toast.success("Removed from watchlist");
  };

  const handleRemoveFavorite = (mal_id: number) => {
    favorites.remove(mal_id);
    toast.success("Removed from Favorites");
  };

  const isFavorite = (mal_id: number) => favorites.favorites.some((item) => item.mal_id === mal_id);

  return (
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-3 min-w-[320px] max-w-[520px] overflow-hidden rounded-3xl border border-[rgba(124,58,237,0.22)] bg-[#070f1f]/95 shadow-[0_36px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="border-b border-[rgba(124,58,237,0.18)] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]/80">
                    My List
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-[#f8fafc]">Your local anime tracker</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(15,23,42,0.84)] text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.35)] hover:text-white"
                  aria-label="Close list menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-[rgba(124,58,237,0.14)] bg-[rgba(124,58,237,0.05)] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#94a3b8]/70">Favorites</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">{favorites.favorites.length}</p>
                </div>
                <div className="rounded-2xl border border-[rgba(124,58,237,0.14)] bg-[rgba(124,58,237,0.05)] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#94a3b8]/70">Watchlist</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">{watchlist.entries.length}</p>
                </div>
                <div className="rounded-2xl border border-[rgba(124,58,237,0.14)] bg-[rgba(124,58,237,0.05)] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#94a3b8]/70">Viewed</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">{recent.items.length}</p>
                </div>
              </div>
            </div>

            <div className="border-b border-[rgba(124,58,237,0.14)] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap gap-2">
                {(["favorites", ...STATUS_ORDER, "recentlyViewed"] as Category[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      activeCategory === category
                        ? "border-[#a855f7] bg-[#7c3aed]/15 text-white"
                        : "border-[rgba(255,255,255,0.08)] bg-[#0c172d] text-[#94a3b8] hover:border-[#7c3aed]/40 hover:text-white"
                    }`}
                  >
                    {CATEGORY_ICONS[category]}
                    {CATEGORY_LABELS[category]}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-4 py-4 sm:px-5">
              {activeItems.length === 0 ? (
                <div className="rounded-3xl border border-[rgba(124,58,237,0.14)] bg-[rgba(15,23,42,0.75)] p-8 text-center text-sm text-[#94a3b8]">
                  {activeCategory === "favorites"
                    ? "No favorite anime yet. Heart a show to save it here."
                    : activeCategory === "recentlyViewed"
                    ? "Browse anime to build a watch history."
                    : "Use the watchlist actions to add anime to this list."}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((item, index) => {
                    const anime =
                      activeCategory === "favorites"
                        ? (item as LocalAnime)
                        : activeCategory === "recentlyViewed"
                        ? (item as { anime: LocalAnime })?.anime
                        : (item as LocalWatchlistEntry).anime;

                    const status =
                      activeCategory === "favorites"
                        ? watchlist.entries.find((entry) => entry.mal_id === anime.mal_id)?.status
                        : activeCategory === "recentlyViewed"
                        ? watchlist.entries.find((entry) => entry.mal_id === anime.mal_id)?.status
                        : (item as LocalWatchlistEntry).status;

                    const isFav = isFavorite(anime.mal_id);

                    return (
                      <motion.div
                        key={anime.mal_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="rounded-3xl border border-[rgba(124,58,237,0.14)] bg-[#0a1228]/95 p-3 shadow-[0_0_40px_rgba(124,58,237,0.06)]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl bg-[#06111e]">
                            <img
                              src={anime.image_url ?? "https://via.placeholder.com/160x240?text=Anime"}
                              alt={anime.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to="/anime/$id"
                              params={{ id: String(anime.mal_id) }}
                              onClick={() => onOpenChange(false)}
                              className="block text-sm font-semibold leading-tight text-[#f8fafc] line-clamp-2"
                            >
                              {formatTitle(anime)}
                            </Link>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#94a3b8]">
                              <span className="rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-2.5 py-1">
                                {status ? STATUS_LABELS[status] : "No status"}
                              </span>
                              {anime.score != null && <span>{anime.score.toFixed(1)}/10</span>}
                              {anime.total_episodes != null && <span>{anime.total_episodes} eps</span>}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {activeCategory !== "recentlyViewed" && (
                            <button
                              type="button"
                              onClick={() => {
                                handleFavoriteToggle(anime);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
                            >
                              <Heart className={`h-4 w-4 ${isFav ? "text-[#f59e0b]" : "text-[#94a3b8]"}`} />
                              {isFav ? "Favorited" : "Favorite"}
                            </button>
                          )}

                          {(activeCategory === "favorites" || activeCategory === "recentlyViewed") && (
                            <button
                              type="button"
                              onClick={() => handleWatchlistUpdate(anime, "plan_to_watch")}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
                            >
                              <ListChecks className="h-4 w-4" />
                              Add to Plan
                            </button>
                          )}

                          {activeCategory !== "favorites" && activeCategory !== "recentlyViewed" && (
                            <div className="flex items-center gap-2">
                              <select
                                value={status}
                                onChange={(event) =>
                                  handleWatchlistUpdate(anime, event.target.value as WatchStatus)
                                }
                                className="w-full rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[#06111f] px-3 py-2 text-sm text-[#f8fafc] outline-none transition"
                              >
                                {STATUS_ORDER.map((value) => (
                                  <option key={value} value={value}>
                                    {STATUS_LABELS[value]}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveWatchlist(anime.mal_id)}
                                className="inline-flex h-10 min-w-[3rem] items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {activeCategory === "favorites" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(anime.mal_id)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[rgba(124,58,237,0.14)] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-4 py-3 text-sm font-semibold text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
                Close list
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
