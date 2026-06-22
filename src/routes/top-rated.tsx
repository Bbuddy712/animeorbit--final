import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/top-rated")({
  component: TopRatedPage,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Top Rated Anime of All Time | AnimeOrbit" },
        { name: "description", content: "Explore the highest rated anime ever made. The best of the best according to millions of fans." },
        { name: "keywords", content: "top rated anime, best anime, highest scored anime, must watch anime" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/top-rated` },
        { property: "og:title", content: "Top Rated Anime of All Time | AnimeOrbit" },
        { property: "og:description", content: "The greatest anime of all time, ranked by fans worldwide." },
        { property: "og:url", content: `${baseUrl}/top-rated` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function TopRatedPage() {
  const topAnime = useQuery({
    queryKey: ["top-rated-page"],
    queryFn: () => jikanGetTopAnime({ data: { limit: 50 } }),
    staleTime: 30 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Top Rated Anime of All Time"
          subtitle="The greatest anime ever created, as voted by fans worldwide"
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
            </Link>
          }
        />

        {topAnime.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : topAnime.data && topAnime.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topAnime.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No data available.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
