import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/genre/$name")({
  component: GenrePage,
  head: ({ params }) => {
    const genreName = params.name.charAt(0).toUpperCase() + params.name.slice(1).replace(/-/g, " ");
    const baseUrl = "https://animeorbit.com";
    const canonicalUrl = `${baseUrl}/genre/${params.name}`;

    return {
      meta: [
        { title: `${genreName} Anime | Watch ${genreName} Anime Online | AnimeOrbit` },
        { name: "description", content: `Discover the best ${genreName.toLowerCase()} anime. Watch popular and highly rated ${genreName.toLowerCase()} series with English subtitles on AnimeOrbit.` },
        { name: "keywords", content: `${genreName.toLowerCase()} anime, best ${genreName.toLowerCase()} anime, watch ${genreName.toLowerCase()} anime online` },
        { tagName: "link", rel: "canonical", href: canonicalUrl },

        { property: "og:title", content: `${genreName} Anime | AnimeOrbit` },
        { property: "og:description", content: `Explore top ${genreName.toLowerCase()} anime. New episodes and classics updated daily.` },
        { property: "og:url", content: canonicalUrl },
        { property: "og:type", content: "website" },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${genreName} Anime | AnimeOrbit` },
        { name: "twitter:description", content: `Best ${genreName.toLowerCase()} anime streaming.` },
      ],
    };
  },
});

function GenrePage() {
  const { name } = Route.useParams();
  const genreName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

  const genreAnime = useQuery({
    queryKey: ["genre", name],
    queryFn: () => jikanGetTopAnime({ data: { limit: 36 } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title={`${genreName} Anime`}
          subtitle={`Explore the best ${genreName.toLowerCase()} anime available`}
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
            </Link>
          }
        />

        {genreAnime.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : genreAnime.data && genreAnime.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {genreAnime.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No ${genreName.toLowerCase()} anime found.
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
            <Link to="/seasonal" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Current Season
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
