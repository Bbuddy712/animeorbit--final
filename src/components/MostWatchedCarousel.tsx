import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import type { Anime } from "@/lib/jikan";
import { SectionHeader } from "./ui/SectionHeader";

export function MostWatchedCarousel() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["most-watched-today"],
    queryFn: () => jikanGetTopAnime({ data: { limit: 10 } }),
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    refetchInterval: 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [paused, setPaused] = useState(false);

  const count = items.length;

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [count, next, paused]);

  if (isLoading) {
    return (
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Most Watched Anime Today" />
          <div className="aspect-[21/9] animate-shimmer rounded-2xl bg-[#0f172a]" />
        </div>
      </section>
    );
  }

  if (count === 0) return null;

  const anime = items[active];

  return (
    <section
      id="most-watched"
      className="relative py-12 sm:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Most Watched Anime Today"
          subtitle="Top-ranked anime right now — refreshed every hour"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.15)] hover:text-white"
                aria-label="Previous anime"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.15)] hover:text-white"
                aria-label="Next anime"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          }
        />

        {/* Main carousel card */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.15)] bg-[#0d1526]">
          <AnimatePresence mode="wait">
            <MostWatchedSlide key={anime.mal_id} anime={anime} rank={active + 1} />
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-[#a855f7]"
                    : "w-1.5 bg-[#94a3b8]/30 hover:bg-[#94a3b8]/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const MostWatchedSlide = memo(function MostWatchedSlide({ anime, rank }: { anime: Anime; rank: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col sm:flex-row"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full shrink-0 sm:w-[220px] md:w-[260px]">
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer bg-[#0f172a]" />}
        <img
          src={anime.images.webp.large_image_url}
          alt={anime.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-xs font-bold text-white shadow-lg">
          #{rank}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#f8fafc] sm:text-2xl md:text-3xl">
          {anime.title_english ?? anime.title}
        </h3>

        {/* Genres */}
        {anime.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {anime.genres.map((g) => (
              <span
                key={g.mal_id}
                className="rounded-full border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.1)] px-3 py-0.5 text-xs font-medium text-[#a855f7]"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#94a3b8]">
          {anime.score != null && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="font-semibold text-[#f8fafc]">{anime.score}</span>
            </span>
          )}
          {anime.popularity != null && (
            <span>
              Popularity: <span className="font-semibold text-[#f8fafc]">#{anime.popularity}</span>
            </span>
          )}
          {anime.episodes != null && <span>{anime.episodes} episodes</span>}
        </div>

        {/* Synopsis */}
        {anime.synopsis && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#94a3b8]">
            {anime.synopsis}
          </p>
        )}

        {/* CTA */}
        <div className="mt-6">
          <Link
            to={`/anime/${anime.mal_id}` as string}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(124,58,237,0.6)]"
          >
            <Play className="h-4 w-4" />
            Watch Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
});
MostWatchedSlide.displayName = "MostWatchedSlide";
