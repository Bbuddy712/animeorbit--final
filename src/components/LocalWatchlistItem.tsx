"use client";

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart, ListChecks, Trash2 } from "lucide-react";
import type { LocalAnime, LocalWatchlistEntry, WatchStatus } from "@/lib/local-watchlist";

import { STATUS_LABELS, STATUS_ORDER } from "./LocalWatchlistMenu";

interface LocalWatchlistItemProps {
  item: LocalAnime | LocalWatchlistEntry | { anime: LocalAnime };
  activeCategory: "favorites" | WatchStatus | "recentlyViewed";
  isFavorite: boolean;
  onFavoriteToggle: (anime: LocalAnime) => void;
  onWatchlistUpdate: (anime: LocalAnime, status: WatchStatus) => void;
  onRemoveWatchlist: (mal_id: number) => void;
  onRemoveFavorite: (mal_id: number) => void;
  onClose: () => void;
}

function getAnimeFromItem(item: any, activeCategory: string) {
  if (activeCategory === "favorites") return item as LocalAnime;
  if (activeCategory === "recentlyViewed") return (item as { anime: LocalAnime }).anime;
  return (item as LocalWatchlistEntry).anime;
}

function getStatusFromItem(item: any, activeCategory: string, watchlistEntries: any[]) {
  const anime = getAnimeFromItem(item, activeCategory);
  if (activeCategory === "favorites" || activeCategory === "recentlyViewed") {
    return watchlistEntries.find((entry: any) => entry.mal_id === anime.mal_id)?.status;
  }
  return (item as LocalWatchlistEntry).status;
}

export function LocalWatchlistItem({
  item,
  activeCategory,
  isFavorite,
  onFavoriteToggle,
  onWatchlistUpdate,
  onRemoveWatchlist,
  onRemoveFavorite,
  onClose,
}: LocalWatchlistItemProps) {
  const anime = getAnimeFromItem(item, activeCategory);
  const status = getStatusFromItem(item, activeCategory, []); // Note: In real usage, pass watchlist entries

  const formatTitle = (title: string) => (title.length > 34 ? `${title.slice(0, 34)}…` : title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
            onClick={onClose}
            className="block text-sm font-semibold leading-tight text-[#f8fafc] line-clamp-2"
          >
            {formatTitle(anime.title)}
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
            onClick={() => onFavoriteToggle(anime)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "text-[#f59e0b]" : "text-[#94a3b8]"}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        )}

        {(activeCategory === "favorites" || activeCategory === "recentlyViewed") && (
          <button
            onClick={() => onWatchlistUpdate(anime, "plan_to_watch")}
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
              onChange={(e) => onWatchlistUpdate(anime, e.target.value as WatchStatus)}
              className="w-full rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[#06111f] px-3 py-2 text-sm text-[#f8fafc] outline-none transition"
            >
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <button
              onClick={() => onRemoveWatchlist(anime.mal_id)}
              className="inline-flex h-10 min-w-[3rem] items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeCategory === "favorites" && (
          <button
            onClick={() => onRemoveFavorite(anime.mal_id)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>
    </motion.div>
  );
}
