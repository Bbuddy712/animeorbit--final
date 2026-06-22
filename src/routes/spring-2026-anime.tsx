import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { jikanGetSeasonNow } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/spring-2026-anime")({
  component: Spring2026Anime,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Spring 2026 Anime | New & Upcoming Anime | AnimeOrbit" },
        { name: "description", content: "Discover all the new anime airing in Spring 2026. Fresh seasons, new episodes, and highly anticipated releases." },
        { name: "keywords", content: "spring 2026 anime, new anime spring 2026, upcoming anime, spring anime season" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/spring-2026-anime` },
        { property: "og:title", content: "Spring 2026 Anime | AnimeOrbit" },
        { property: "og:description", content: "Explore the full lineup of Spring 2026 anime. New seasons and highly anticipated titles." },
        { property: "og:url", content: `${baseUrl}/spring-2026-anime` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function Spring2026Anime() {
  const seasonData = useQuery({
    queryKey: ["seasonal", "spring-2026"],
    queryFn: () => jikanGetSeasonNow({ data: { limit: 50 } }),
    staleTime: 15 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Spring 2026 Anime"
          subtitle="Fresh anime airing this Spring season"
          action={
            <Link to="/seasonal" className="text-sm text-[#a855f7] hover:underline">
              View All Seasonal Anime
            </Link>
          }
        />

        {seasonData.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : seasonData.data && seasonData.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {seasonData.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No data available for Spring 2026 yet.
          </div>
        )}

        <div className="mt-16 border-t border-white/10 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-[#f8fafc]">Explore More</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/trending" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Trending Now
            </Link>
            <Link to="/top-rated" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Top Rated
            </Link>
            <Link to="/collections/best-fantasy-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Best Fantasy Anime
            </Link>
            <Link to="/genre/action" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Action Anime
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
