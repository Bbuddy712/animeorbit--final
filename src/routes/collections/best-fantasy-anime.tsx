import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/collections/best-fantasy-anime")({
  component: BestFantasyAnime,
  head: () => {
    const baseUrl = "https://animeorbit.com";
    return {
      meta: [
        { title: "Best Fantasy Anime of All Time | AnimeOrbit" },
        { name: "description", content: "Explore the greatest fantasy anime ever created. Epic worlds, magic systems, and unforgettable adventures." },
        { name: "keywords", content: "best fantasy anime, top fantasy, isekai, magic anime, fantasy recommendations" },
        { tagName: "link", rel: "canonical", href: `${baseUrl}/collections/best-fantasy-anime` },
        { property: "og:title", content: "Best Fantasy Anime of All Time | AnimeOrbit" },
        { property: "og:description", content: "The ultimate fantasy anime list. From Fullmetal Alchemist to Attack on Titan." },
        { property: "og:url", content: `${baseUrl}/collections/best-fantasy-anime` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function BestFantasyAnime() {
  const collectionAnime = useQuery({
    queryKey: ["collection", "best-fantasy-anime"],
    queryFn: () => jikanGetTopAnime({ data: { limit: 36 } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Best Fantasy Anime of All Time"
          subtitle="Epic worlds, powerful magic, and legendary adventures"
          action={
            <Link to="/collections" className="text-sm text-[#a855f7] hover:underline">
              Browse All Collections
            </Link>
          }
        />

        {collectionAnime.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : collectionAnime.data && collectionAnime.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {collectionAnime.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No data available right now.
          </div>
        )}

        <div className="mt-16 border-t border-white/10 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-[#f8fafc]">Explore More Collections</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/collections/best-shounen-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Best Shounen Anime
            </Link>
            <Link to="/collections/best-action-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Best Action Anime
            </Link>
            <Link to="/trending" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Trending Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
