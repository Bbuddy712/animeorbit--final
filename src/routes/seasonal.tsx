import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { jikanGetSeasonNow } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/seasonal")({
  component: SeasonalPage,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Current Season Anime | AnimeOrbit" },
        { name: "description", content: "Watch the latest anime airing this season. Fresh episodes every week." },
        { name: "keywords", content: "current season anime, seasonal anime, spring anime, summer anime, fall anime, winter anime" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/seasonal` },
        { property: "og:title", content: "Current Season Anime | AnimeOrbit" },
        { property: "og:description", content: "Discover what's airing this season. New episodes weekly." },
        { property: "og:url", content: `${baseUrl}/seasonal` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function SeasonalPage() {
  const seasonData = useQuery({
    queryKey: ["seasonal-page"],
    queryFn: () => jikanGetSeasonNow({ data: { limit: 50 } }),
    staleTime: 15 * 60 * 1000,
  });

  if (seasonData.isError) {
    return (
      <div className="min-h-screen bg-[#071120]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg text-[#94a3b8]">Failed to load seasonal anime. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Current Season Anime"
          subtitle="Fresh anime airing right now this season"
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
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
            No seasonal data available.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
