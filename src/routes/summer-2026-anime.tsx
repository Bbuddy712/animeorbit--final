import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikanGetSeasonNow } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/summer-2026-anime")({
  component: Summer2026Anime,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Summer 2026 Anime | New Anime Season | AnimeOrbit" },
        { name: "description", content: "Check out all the exciting new anime airing in Summer 2026. Big premieres and highly anticipated sequels." },
        { name: "keywords", content: "summer 2026 anime, new summer anime, summer anime season" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/summer-2026-anime` },
        { property: "og:title", content: "Summer 2026 Anime | AnimeOrbit" },
        { property: "og:description", content: "Discover the Summer 2026 anime lineup." },
        { property: "og:url", content: `${baseUrl}/summer-2026-anime` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function Summer2026Anime() {
  const seasonData = useQuery({
    queryKey: ["seasonal", "summer-2026"],
    queryFn: () => jikanGetSeasonNow({ data: { limit: 50 } }),
    staleTime: 15 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Summer 2026 Anime"
          subtitle="Hot new anime dropping this summer"
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
            No data available for Summer 2026 yet.
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
            <Link to="/spring-2026-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Spring 2026 Anime
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
