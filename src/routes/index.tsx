import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Sparkles, Trophy } from "lucide-react";
import {
  jikanGetTrending,
  jikanGetTopAnime,
  jikanGetSeasonNow,
  jikanGetRandom,
} from "@/lib/jikan.functions";
import { aiTrendingByRegion } from "@/lib/search.functions";
import { Suspense, lazy } from "react";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AnimeRow } from "@/components/AnimeRow";
import { Footer } from "@/components/Footer";
import { TopBannerAd } from "@/components/Ads/TopBannerAd";
import { InlineAd } from "@/components/Ads/InlineAd";
import { MobileStickyAd } from "@/components/Ads/MobileStickyAd";
import { AdvertiseCard } from "@/components/Ads/AdvertiseCard";



const MostWatchedCarousel = lazy(() => import("@/components/MostWatchedCarousel").then((m) => ({ default: m.MostWatchedCarousel })));
const GenreGrid = lazy(() => import("@/components/GenreGrid").then((m) => ({ default: m.GenreGrid })));
const DailyPick = lazy(() => import("@/components/DailyPick").then((m) => ({ default: m.DailyPick })));


export const Route = createFileRoute("/")({
  component: Index,
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

  // Region queries are currently unused in this route.
  // Keeping them removed avoids React Query option/type incompatibilities.

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
      </main>


      <AdvertiseCard />
      <Footer />
      <MobileStickyAd zone="11058414" />
    </div>

  );
}
