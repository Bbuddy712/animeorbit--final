import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { jikanGetTrending } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/trending")({
  component: TrendingPage,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Trending Anime Right Now | AnimeOrbit" },
        { name: "description", content: "Discover the most popular and trending anime this week. Updated daily with the hottest titles everyone is watching." },
        { name: "keywords", content: "trending anime, popular anime, what to watch, current trending anime" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/trending` },
        { property: "og:title", content: "Trending Anime Right Now | AnimeOrbit" },
        { property: "og:description", content: "See what's hot right now in anime. Updated daily." },
        { property: "og:url", content: `${baseUrl}/trending` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function TrendingPage() {
  const trending = useQuery({
    queryKey: ["trending-page"],
    queryFn: () => jikanGetTrending({ data: { limit: 50 } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Trending Anime Right Now"
          subtitle="The hottest anime everyone is watching this week"
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
            </Link>
          }
        />

        {trending.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : trending.data && trending.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trending.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No trending data available right now.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
