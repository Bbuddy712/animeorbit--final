import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/studio/$name")({
  component: StudioPage,
  head: ({ params }) => {
    const studioName = params.name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const baseUrl = "https://animeorbit.com";
    const canonicalUrl = `${baseUrl}/studio/${params.name}`;

    return {
      meta: [
        { title: `${studioName} Anime | Watch ${studioName} Anime | AnimeOrbit` },
        { name: "description", content: `Explore anime produced by ${studioName}. Discover popular and acclaimed titles from this renowned studio.` },
        { name: "keywords", content: `${studioName} anime, best ${studioName} anime, watch anime by ${studioName}` },
        { tagName: "link", rel: "canonical", href: canonicalUrl },

        { property: "og:title", content: `${studioName} Anime | AnimeOrbit` },
        { property: "og:description", content: `Discover top anime from ${studioName}.` },
        { property: "og:url", content: canonicalUrl },
        { property: "og:type", content: "website" },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${studioName} Anime | AnimeOrbit` },
        { name: "twitter:description", content: `Best anime by ${studioName}.` },
      ],
    };
  },
});

function StudioPage() {
  const { name } = Route.useParams();

  const studioName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const studioAnime = useQuery({
    queryKey: ["studio", name],
    queryFn: () => jikanGetTopAnime({ data: { limit: 36 } }),
    staleTime: 10 * 60 * 1000,
  });

  if (studioAnime.isError) {
    return (
      <div className="min-h-screen bg-[#071120]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg text-[#94a3b8]">Failed to load studio anime. Please try again later.</p>
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
          title={`${studioName} Anime`}
          subtitle={`Explore acclaimed anime produced by ${studioName}`}
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
            </Link>
          }
        />

        {studioAnime.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-shimmer rounded-2xl bg-[#0f172a]" />
            ))}
          </div>
        ) : studioAnime.data && studioAnime.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {studioAnime.data.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#94a3b8]">
            No anime found for this studio.
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
