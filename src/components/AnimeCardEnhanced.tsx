"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, Play } from "lucide-react";
import { WatchButton } from "@/components/WatchButton";
import type { Anime } from "@/lib/jikan";

export interface AnimeCardEnhancedProps {
  anime: Anime;
  index?: number;
  showWatchButton?: boolean;
  providers?: string[];
}

export function AnimeCardEnhanced({
  anime,
  index = 0,
  showWatchButton = false,
  providers,
}: AnimeCardEnhancedProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showWatch, setShowWatch] = useState(false);

  const title = anime.title_english || anime.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.4 }}
      className="group relative shrink-0 w-[160px] sm:w-[190px] md:w-[200px]"
    >
      <div className="relative cursor-pointer overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.12)] bg-[#0d1526] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[rgba(124,58,237,0.5)] hover:shadow-[0_0_32px_-4px_rgba(124,58,237,0.45),0_12px_40px_rgba(0,0,0,0.6)]">
        <Link to={`/anime/${anime.mal_id}` as string} className="block">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {!imgLoaded && (
              <div className="absolute inset-0 animate-shimmer bg-[#0f172a]" />
            )}
            <img
              src={anime.images.webp.large_image_url}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className={
                "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] " +
                (imgLoaded ? "opacity-100" : "opacity-0")
              }
            />

            {/* Gradient — always present, deepens on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/98 via-[#0d1526]/20 to-transparent transition-opacity duration-300 group-hover:opacity-100" />

            {/* Purple shimmer on hover — top edge */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Play overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
              onMouseEnter={() => showWatchButton && setShowWatch(true)}
              onMouseLeave={() => setShowWatch(false)}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(168,85,247,0.5)] bg-[rgba(15,23,42,0.75)] backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              </div>
            </div>

            {/* Score badge */}
            {anime.score && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(13,21,38,0.85)] px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                <Star className="h-2.5 w-2.5 fill-[#a855f7] text-[#a855f7]" />
                {anime.score.toFixed(1)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]/75">
              {anime.genres?.[0]?.name || "Anime"}
            </div>
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#f8fafc]">
              {title}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#94a3b8]/70">
              {anime.episodes && <span>{anime.episodes} eps</span>}
              {anime.year && <span>· {anime.year}</span>}
            </div>
          </div>
        </Link>

        {/* Watch Button Overlay */}
        {showWatchButton && showWatch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0d1526] via-[#0d1526]/80 to-transparent"
            onClick={(e) => e.preventDefault()}
          >
            <WatchButton
              animeTitle={title}
              malId={anime.mal_id}
              providers={providers}
              size="sm"
              showLabel={false}
              variant="default"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
