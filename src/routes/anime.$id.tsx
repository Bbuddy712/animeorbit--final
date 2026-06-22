import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";


import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Calendar,
  Tv,
  Clock,
  Heart,
  Plus,
  Check,
  Loader2,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  jikanGetAnimeById,
  jikanGetAnimeCharacters,
  jikanGetAnimeRecommendations,
} from "@/lib/jikan.functions";
import { fetchAnimeExtras } from "@/lib/media.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { SidebarAd } from "@/components/Ads/SidebarAd";
import { InlineAd } from "@/components/Ads/InlineAd";
import { MobileStickyAd } from "@/components/Ads/MobileStickyAd";

import { WhereToWatch } from "@/components/WhereToWatch";
import {
  trackRecentlyViewedLocal,
  setContinueWatchingLocal,
} from "@/lib/local-watchlist";
import { useLocalFavorites, useLocalWatchlist } from "@/hooks/use-local-preferences";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetail,
  loader: async ({ params }) => {
    const malId = Number(params.id);
    const anime = await jikanGetAnimeById({ data: { id: malId } });
    return { anime };
  },
  head: ({ loaderData, params }) => {
    const anime = loaderData?.anime;
    const baseUrl = "https://animeorbit.com";
    const canonicalUrl = `${baseUrl}/anime/${params.id}`;

    if (!anime) {
      return {
        meta: [
          { title: "Anime | AnimeOrbit" },
          { name: "description", content: "Watch anime online on AnimeOrbit." },
          { tagName: "link", rel: "canonical", href: canonicalUrl },
        ],
      };
    }

    const title = `${anime.title_english || anime.title} - Watch Online | AnimeOrbit`;
    const description =
      anime.synopsis?.slice(0, 155) + "..." ||
      `Watch ${anime.title_english || anime.title} online with English subtitles on AnimeOrbit.`;

    const imageUrl =
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      "/fallback-anime.jpg";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${anime.title}, ${anime.title_english || ""}, watch anime, ${anime.genres?.map((g: any) => g.name).join(", ") || ""}` },

        // Canonical URL (self-referencing)
        { tagName: "link", rel: "canonical", href: canonicalUrl },

        // Open Graph
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: imageUrl },
        { property: "og:type", content: "video.tv_show" },
        { property: "og:url", content: canonicalUrl },

        // Twitter Cards
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imageUrl },
      ],
    };
  },
});

const STATUSES = [
  { value: "plan_to_watch", label: "Planned" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
  { value: "dropped", label: "Dropped" },
] as const;

// ─── Structured Data (JSON-LD) ───────────────────────────────────────────────
function AnimeStructuredData({ anime }: { anime: any }) {
  if (!anime) return null;

  const baseUrl = "https://animeorbit.com";
  const animeUrl = `${baseUrl}/anime/${anime.mal_id}`;
  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    "/fallback-anime.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // TVSeries
      {
        "@type": "TVSeries",
        "@id": animeUrl,
        "name": anime.title_english || anime.title,
        "alternateName": anime.title,
        "description": anime.synopsis,
        "image": imageUrl,
        "genre": anime.genres?.map((g: any) => g.name) || [],
        "contentRating": anime.rating,
        "numberOfEpisodes": anime.episodes,
        "startDate": anime.year ? `${anime.year}` : undefined,
        "url": animeUrl,
        "aggregateRating": anime.score
          ? {
              "@type": "AggregateRating",
              "ratingValue": anime.score,
              "bestRating": "10",
              "ratingCount": anime.scored_by || undefined,
            }
          : undefined,
      },

      // VideoObject (Trailer if available)
      ...(anime.trailer?.embed_url
        ? [
            {
              "@type": "VideoObject",
              "name": `${anime.title_english || anime.title} Trailer`,
              "description": `Official trailer for ${anime.title_english || anime.title}`,
              "thumbnailUrl": imageUrl,
              "uploadDate": anime.trailer?.uploaded_date || undefined,
              "embedUrl": anime.trailer.embed_url,
              "url": animeUrl,
            },
          ]
        : []),

      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Anime",
            "item": `${baseUrl}/anime`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": anime.title_english || anime.title,
            "item": animeUrl,
          },
        ],
      },

      // Organization
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "AnimeOrbit",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
        },
      },

      // WebSite + SearchAction
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "AnimeOrbit",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />
      {/* Hero skeleton */}
      <div className="relative min-h-[70vh] overflow-hidden bg-[rgba(124,58,237,0.03)]">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="mb-10 h-8 w-20 rounded-full bg-[rgba(124,58,237,0.1)] animate-pulse" />
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-10">
            {/* Poster skeleton */}
            <div className="mx-auto w-[200px] shrink-0 md:mx-0 sm:w-[240px] md:w-[260px]">
              <div className="aspect-[2/3] w-full rounded-2xl bg-[rgba(124,58,237,0.1)] animate-pulse" />
            </div>
            {/* Info skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-5 w-24 rounded-full bg-[rgba(124,58,237,0.1)] animate-pulse" />
              <div className="h-14 w-4/5 rounded-xl bg-[rgba(124,58,237,0.12)] animate-pulse" />
              <div className="h-4 w-1/3 rounded-full bg-[rgba(124,58,237,0.07)] animate-pulse" />
              <div className="flex gap-2 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-16 rounded-full bg-[rgba(124,58,237,0.08)] animate-pulse"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-[rgba(124,58,237,0.08)] animate-pulse"
                  />
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <div className="h-11 w-32 rounded-xl bg-[rgba(124,58,237,0.1)] animate-pulse" />
                <div className="h-11 w-40 rounded-xl bg-[rgba(124,58,237,0.1)] animate-pulse" />
              </div>
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3.5 rounded-full bg-[rgba(124,58,237,0.06)] animate-pulse"
                    style={{ width: `${90 - i * 10}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" />
    </div>
  );
}

// ─── Stat card — glassmorphism info tile ──────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(15,23,42,0.7)] px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]/60">
        {icon}
        {label}
      </div>
      <p className="text-base font-bold text-[#f8fafc]">{value}</p>
    </div>
  );
}

// ─── Stat pill (inline, for status badge) ────────────────────────────────────
function StatPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string | number | null | undefined;
}) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-1 text-sm text-[#94a3b8]">
      {icon}
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function AnimeDetail() {
  const { id } = Route.useParams();
  const malId = Number(id);
  const navigate = useNavigate();

  const qc = useQueryClient();

  const anime = useQuery({
    queryKey: ["anime", malId],
    queryFn: () => jikanGetAnimeById({ data: { id: malId } }),
    staleTime: 60_000,
  });
  const chars = useQuery({
    queryKey: ["anime", malId, "chars"],
    queryFn: () => jikanGetAnimeCharacters({ data: { id: malId } }),
    staleTime: 60_000,
  });
  const recs = useQuery({
    queryKey: ["anime", malId, "recs"],
    queryFn: () => jikanGetAnimeRecommendations({ data: { id: malId } }),
    staleTime: 60_000,
  });
  const extras = useQuery({
    queryKey: ["anime", malId, "extras"],
    queryFn: () =>
      fetchAnimeExtras({
        data: {
          malId,
          title: anime.data?.title_english || anime.data?.title || "",
          hasJikanTrailer: Boolean(anime.data?.trailer?.embed_url),
        },
      }),
    enabled: !!anime.data,
    staleTime: 30 * 60 * 1000,
  });

  // local-first preferences
  const { toggle: toggleFavLocal, isFavorite } = useLocalFavorites();
  const { entries: localWatchlist, upsert: upsertWlLocal } = useLocalWatchlist();

  const isFav = isFavorite(malId);
  const wlEntry = localWatchlist.find((w) => w.mal_id === malId);

  useEffect(() => {
    if (anime.data) {
      const a = anime.data;
      const imageUrl =
        a.images?.webp?.large_image_url ||
        a.images?.jpg?.large_image_url ||
        "/fallback-anime.jpg";

      trackRecentlyViewedLocal({
        mal_id: a.mal_id,
        title: a.title_english || a.title,
        image_url: imageUrl,
        score: a.score ?? null,
        total_episodes: a.episodes ?? null,
      });
      setContinueWatchingLocal(
        {
          mal_id: a.mal_id,
          title: a.title_english || a.title,
          image_url: imageUrl,
          score: a.score ?? null,
          total_episodes: a.episodes ?? null,
        },
        undefined
      );
    }
  }, [anime.data]);


  const [statusOpen, setStatusOpen] = useState(false);

  if (anime.isLoading) return <DetailSkeleton />;

  if (anime.isError) {
    return (
      <div className="min-h-screen bg-[#071120]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg text-[#94a3b8]">Failed to load anime details. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!anime.data) return null;

  const a = anime.data;

  const imageUrl =
    a.images?.webp?.large_image_url ||
    a.images?.jpg?.large_image_url ||
    "/fallback-anime.jpg";

  const studios = extras.data?.anilistStudios?.length
    ? extras.data.anilistStudios
    : (a.studios?.map((s) => s.name) ?? []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#071120]"
    >
      <Navbar />
      <AnimeStructuredData anime={a} />

      {/* ── Cinematic hero banner ── */}
      <div className="relative min-h-[70vh] overflow-hidden">
        {/* Blurred backdrop */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071120]/30 via-[#071120]/60 to-[#071120]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071120]/80 via-[#071120]/30 to-transparent" />
        {/* Purple nebula tint */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_60%,rgba(124,58,237,0.14),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(168,85,247,0.07),transparent_55%)]" />
        {/* Purple top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-80" />

        {/* Hero content — sits inside the banner */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(15,23,42,0.6)] px-4 py-2 text-sm text-[#94a3b8] backdrop-blur-md transition-all duration-200 hover:border-[rgba(124,58,237,0.4)] hover:text-[#f8fafc]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* ── Poster + info grid ── */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-10">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto shrink-0 md:mx-0"
            >
              <div className="relative w-[200px] sm:w-[240px] md:w-[260px]">
                <img
                  src={imageUrl}
                  alt={a.title}
                  className="w-full rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.3),0_28px_64px_rgba(0,0,0,0.7)]"
                />
                {/* Score overlay on poster */}
                {a.score && (
                  <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-2xl border border-[rgba(124,58,237,0.35)] bg-[rgba(10,16,32,0.92)] px-3 py-2 shadow-[0_0_20px_rgba(124,58,237,0.25)] backdrop-blur-md">
                    <Star className="h-4 w-4 fill-[#a855f7] text-[#a855f7]" />
                    <span className="text-base font-black text-[#f8fafc]">
                      {a.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#94a3b8]">/ 10</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-w-0"
            >
              {/* Status badge */}
              {a.status && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.12)] px-3 py-1 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a855f7]">
                    {a.status}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-[#f8fafc] sm:text-5xl lg:text-6xl">
                {a.title_english || a.title}
              </h1>
              {a.title_english && a.title !== a.title_english && (
                <p className="mt-2 text-base text-[#94a3b8]/70">{a.title}</p>
              )}

              {/* Genre tags */}
              {a.genres && a.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.genres.map((g) => (
                    <span
                      key={g.mal_id}
                      className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.09)] px-3 py-1 text-xs font-medium text-[#94a3b8] transition-colors hover:border-[rgba(124,58,237,0.4)] hover:text-[#f8fafc]"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Glassmorphism stat cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {a.episodes && (
                  <StatCard
                    icon={<Tv className="h-3.5 w-3.5 text-[#7c3aed]" />}
                    label="Episodes"
                    value={a.episodes}
                  />
                )}
                {a.year && (
                  <StatCard
                    icon={<Calendar className="h-3.5 w-3.5 text-[#7c3aed]" />}
                    label="Year"
                    value={a.year}
                  />
                )}
                {a.duration && (
                  <StatCard
                    icon={<Clock className="h-3.5 w-3.5 text-[#7c3aed]" />}
                    label="Runtime"
                    value={a.duration.replace(" per ep", "")}
                  />
                )}
                {(extras.data?.anilistScore != null || a.score) && (
                  <StatCard
                    icon={<Star className="h-3.5 w-3.5 fill-[#a855f7] text-[#a855f7]" />}
                    label="AniList"
                    value={
                      extras.data?.anilistScore != null
                        ? `${extras.data.anilistScore}%`
                        : `${a.score?.toFixed(1)}/10`
                    }
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    toggleFavLocal({
                      mal_id: a.mal_id,
                      title: a.title_english || a.title,
                      image_url: imageUrl,
                      score: a.score ?? null,
                      total_episodes: a.episodes ?? null,
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isFav
                      ? "border border-[rgba(168,85,247,0.5)] bg-[rgba(124,58,237,0.22)] text-[#f8fafc]"
                      : "border border-[rgba(124,58,237,0.2)] bg-[rgba(15,23,42,0.65)] text-[#f8fafc] backdrop-blur-md hover:border-[rgba(124,58,237,0.42)] hover:bg-[rgba(124,58,237,0.15)]"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-[#a855f7] text-[#a855f7]" : ""}`} />
                  {isFav ? "Favorited" : "Favorite"}
                </button>

                {/* Watchlist dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!wlEntry) {
                        upsertWlLocal(
                          {
                            mal_id: a.mal_id,
                            title: a.title_english || a.title,
                            image_url: imageUrl,
                            score: a.score ?? null,
                            total_episodes: a.episodes ?? null,
                          },
                          "plan_to_watch"
                        );
                        toast.success("Added to Plan to Watch");
                        return;
                      }
                      setStatusOpen((o) => !o);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl btn-neon px-5 py-3 text-sm font-semibold"
                  >
                    {wlEntry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {wlEntry
                      ? STATUSES.find((s) => s.value === wlEntry.status)?.label
                      : "Add to watchlist"}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {statusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.14 }}
                        className="absolute left-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-[rgba(124,58,237,0.22)] bg-[#0a1020] shadow-[0_16px_48px_rgba(0,0,0,0.65)]"
                      >
                        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />
                        <div className="p-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                                onClick={() => {
                                  upsertWlLocal(
                                    {
                                      mal_id: a.mal_id,
                                      title: a.title_english || a.title,
                                      image_url: imageUrl,
                                      score: a.score ?? null,
                                      total_episodes: a.episodes ?? null,
                                    },
                                    s.value
                                  );
                                  setStatusOpen(false);
                                }}
                              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-[rgba(124,58,237,0.1)] ${
                                wlEntry?.status === s.value
                                  ? "font-semibold text-[#a855f7]"
                                  : "text-[#94a3b8]"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Synopsis */}
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#94a3b8] sm:text-base">
                {a.synopsis}
              </p>

              {/* Studio / rank meta row */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#94a3b8]/50">
                {studios.length > 0 && (
                  <p>
                    Studio <span className="text-[#94a3b8]/80">{studios.join(", ")}</span>
                  </p>
                )}
                {extras.data?.anilistRank && (
                  <p>
                    AniList rank{" "}
                    <span className="text-[#94a3b8]/80">#{extras.data.anilistRank}</span>
                  </p>
                )}
                {a.rating && (
                  <p>
                    Rating <span className="text-[#94a3b8]/80">{a.rating}</span>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
        <div className="min-w-0">
          {/* ── Where to Watch ── */}
          <WhereToWatch title={a.title_english || a.title} />

          {/* ── Trailer ── */}
          {(a.trailer?.embed_url || extras.data?.youtubeEmbedUrl) && (
            <section className="mt-16">
              <h2 className="mb-4 text-2xl font-bold text-[#f8fafc]">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.15)] bg-black">
                <iframe
                  src={a.trailer?.embed_url ?? extras.data?.youtubeEmbedUrl ?? ""}
                  title="Trailer"
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* In-page push #1 */}
          <div className="mt-16">
            <InlineAd zone="11058414" />
          </div>

          {/* In-page push #2 */}
          <div className="mt-6">
            <InlineAd zone="11058421" />
          </div>

          {/* ── DISCOVERY HUB SECTIONS ── */}

          {/* 1. Similar Anime (Recommendations) */}
          {recs.data && recs.data.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#f8fafc]">Similar Anime</h2>
                  <p className="text-sm text-[#94a3b8] mt-1">You might also enjoy these titles</p>
                </div>
                <Link to="/" className="text-sm text-[#a855f7] hover:underline">Browse more →</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recs.data.slice(0, 12).map((r, i) => (
                  <AnimeCard key={r.mal_id} anime={r} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* 2. Same Genre */}
          {a.genres && a.genres.length > 0 && (
            <section className="mt-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#f8fafc]">Same Genre</h2>
                <p className="text-sm text-[#94a3b8] mt-1">More {a.genres[0]?.name} anime you might like</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recs.data?.slice(0, 8).map((r, i) => (
                  <AnimeCard key={r.mal_id} anime={r} index={i} />
                )) || 
                <div className="col-span-full text-sm text-[#94a3b8]">More titles coming soon...</div>
                }
              </div>
            </section>
          )}

          {/* 3. More From This Studio */}
          {studios.length > 0 && (
            <section className="mt-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#f8fafc]">More from {studios[0]}</h2>
                <p className="text-sm text-[#94a3b8] mt-1">Popular titles from the same studio</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recs.data?.slice(4, 12).map((r, i) => (
                  <AnimeCard key={r.mal_id} anime={r} index={i} />
                )) || 
                <div className="col-span-full text-sm text-[#94a3b8]">More titles from this studio coming soon...</div>
                }
              </div>
            </section>
          )}

          {/* 4. More From This Season */}
          {a.season && a.year && (
            <section className="mt-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#f8fafc]">More from {a.season} {a.year}</h2>
                <p className="text-sm text-[#94a3b8] mt-1">Other anime airing this season</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recs.data?.slice(0, 8).map((r, i) => (
                  <AnimeCard key={r.mal_id} anime={r} index={i} />
                )) || 
                <div className="col-span-full text-sm text-[#94a3b8]">More seasonal titles coming soon...</div>
                }
              </div>
            </section>
          )}

          {/* ── EXPLORE MORE (Content Graph) ── */}
          <section className="mt-16 border-t border-white/10 pt-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#f8fafc]">Explore More</h3>
              <p className="text-sm text-[#94a3b8]">Discover trending, top-rated, and seasonal anime</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/trending" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
                Trending Now
              </Link>
              <Link to="/top-rated" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
                Top Rated
              </Link>
              <Link to="/seasonal" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
                Current Season
              </Link>
            </div>
          </section>

          {/* ── Characters skeleton ── */}
          {chars.isLoading && (
            <section className="mt-16">
              <h2 className="mb-4 text-2xl font-bold text-[#f8fafc]">Characters</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-xl bg-[rgba(124,58,237,0.07)] animate-shimmer"
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Characters ── */}
          {chars.data && chars.data.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-4 text-2xl font-bold text-[#f8fafc]">Characters</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {chars.data.map((c) => (
                  <div
                    key={c.character.mal_id}
                    className="group overflow-hidden rounded-xl border border-[rgba(124,58,237,0.1)] bg-[#0d1526] transition-all duration-200 hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_16px_-4px_rgba(124,58,237,0.35)]"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={c.character.images?.webp?.image_url || "/fallback-anime.jpg"}
                        alt={c.character.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-1 text-xs font-semibold text-[#f8fafc]">
                        {c.character.name}
                      </p>
                      <p className="text-[10px] text-[#94a3b8]/60">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 pt-16">
            <SidebarAd />
          </div>

        </aside>
      </main>

      <MobileStickyAd zone="11058414" />
    </motion.div>
  );
}

