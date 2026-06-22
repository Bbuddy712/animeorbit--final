import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Sparkles, Trophy, Calendar } from "lucide-react";
import {
  jikanGetTrending,
  jikanGetTopAnime,
  jikanGetSeasonNow,
  jikanGetRandom,
} from "@/lib/jikan.functions";
import { Suspense, lazy } from "react";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AnimeRow } from "@/components/AnimeRow";
import { Footer } from "@/components/Footer";
import { TopBannerAd } from "@/components/Ads/TopBannerAd";
import { InlineAd } from "@/components/Ads/InlineAd";
import { MobileStickyAd } from "@/components/Ads/MobileStickyAd";
import { AdvertiseCard } from "@/components/Ads/AdvertiseCard";
import { Link } from "@tanstack/react-router";

const MostWatchedCarousel = lazy(() => import("@/components/MostWatchedCarousel").then((m) => ({ default: m.MostWatchedCarousel })));
const GenreGrid = lazy(() => import("@/components/GenreGrid").then((m) => ({ default: m.GenreGrid })));
const DailyPick = lazy(() => import("@/components/DailyPick").then((m) => ({ default: m.DailyPick })));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "AnimeOrbit - Watch Anime Online | Free Anime Streaming" },
        { name: "description", content: "Watch the latest anime episodes, trending shows, and classics for free with English subtitles on AnimeOrbit. Discover new anime every day." },
        { name: "keywords", content: "watch anime, free anime, anime streaming, latest anime, trending anime, anime online" },
        { tagName: "link", rel: "canonical", href: baseUrl },
        { property: "og:title", content: "AnimeOrbit - Watch Anime Online | Free Anime Streaming" },
        { property: "og:description", content: "Stream the best anime with English subtitles. New episodes daily." },
        { property: "og:image", content: `${baseUrl}/og-image.jpg` },
        { property: "og:type", content: "website" },
        { property: "og:url", content: baseUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "AnimeOrbit - Watch Anime Online" },
        { name: "twitter:description", content: "Free anime streaming with English subtitles." },
        { name: "twitter:image", content: `${baseUrl}/og-image.jpg` },
      ],
    };
  },
});

function Index() {
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => jikanGetTrending({ data: { limit: 14 } }),
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    refetchInterval: 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  const top = useQuery({
    queryKey: ["top"],
    queryFn: () => jikanGetTopAnime({ data: { limit: 14 } }),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const season = useQuery({
    queryKey: ["season"],
    queryFn: () => jikanGetSeasonNow({ data: { limit: 14 } }),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const random = useQuery({
    queryKey: ["random"],
    queryFn: () => jikanGetRandom(),
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TopBannerAd />
        </div>
      </section>
      <main>
        <Hero slides={trending.data ?? []} />

        <div className="mt-6">
          <InlineAd zone="11058414" />
        </div>

        <Suspense fallback={null}>
          <MostWatchedCarousel />
        </Suspense>

        <AnimeRow
          id="trending"
          title="Trending Now"
          subtitle="What everyone's watching this week"
          items={trending.data ?? []}
          loading={trending.isLoading}
          icon={<Flame className="w-7 h-7 text-neon-pink" />}
        />

        <div className="mt-6">
          <InlineAd zone="11058421" />
        </div>

        <Suspense fallback={null}>
          <GenreGrid />
        </Suspense>

        <AnimeRow
          id="top-airing"
          title="Top Airing Now"
          subtitle="Fresh anime currently streaming this season"
          items={season.data ?? []}
          loading={season.isLoading}
          icon={<Sparkles className="w-7 h-7 text-neon-blue" />}
        />

        <AnimeRow
          id="top-rated"
          title="Top Rated of All Time"
          subtitle="The legends — highest scored on MAL"
          items={top.data ?? []}
          loading={top.isLoading}
          icon={<Trophy className="w-7 h-7 text-accent" />}
        />

        <Suspense fallback={null}>
          <DailyPick initial={random.data ?? null} />
        </Suspense>

        {/* Discovery Hub Links */}
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link to="/trending" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1526]/80 p-5 transition hover:border-[#7c3aed]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#a855f7]">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-[#f8fafc] group-hover:text-[#a855f7]">Trending Now</div>
                <div className="text-sm text-[#94a3b8]">What's hot this week</div>
              </div>
            </Link>

            <Link to="/top-rated" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1526]/80 p-5 transition hover:border-[#7c3aed]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#a855f7]">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-[#f8fafc] group-hover:text-[#a855f7]">Top Rated</div>
                <div className="text-sm text-[#94a3b8]">The best of all time</div>
              </div>
            </Link>

            <Link to="/seasonal" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1526]/80 p-5 transition hover:border-[#7c3aed]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#a855f7]">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-[#f8fafc] group-hover:text-[#a855f7]">Current Season</div>
                <div className="text-sm text-[#94a3b8]">What's airing now</div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <AdvertiseCard />
      <Footer />
      <MobileStickyAd zone="11058414" />

      {/* Homepage Structured Data */}
      <HomeStructuredData />
    </div>
  );
}

function HomeStructuredData() {
  const baseUrl = "https://animeorbit.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "AnimeOrbit",
        "description": "Watch anime online for free with English subtitles.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
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
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
