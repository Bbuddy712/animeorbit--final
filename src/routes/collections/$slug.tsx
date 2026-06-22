import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikanGetTopAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionPage,
  head: ({ params }) => {
    const slug = params.slug;
    const titleMap: Record<string, string> = {
      "best-romance-anime": "Best Romance Anime of All Time",
      "best-action-anime": "Best Action Anime of All Time",
      "best-isekai-anime": "Best Isekai Anime",
      "best-comedy-anime": "Best Comedy Anime",
      "best-horror-anime": "Best Horror Anime",
    };

    const pageTitle = titleMap[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const baseUrl = "https://animeorbit.com";
    const canonicalUrl = `${baseUrl}/collections/${slug}`;

    return {
      meta: [
        { title: `${pageTitle} | AnimeOrbit` },
        { name: "description", content: `Discover the best ${slug.replace(/-/g, " ")} on AnimeOrbit. Curated lists of must-watch anime.` },
        { name: "keywords", content: `${slug.replace(/-/g, " ")}, best anime, must watch anime` },
        { tagName: "link", rel: "canonical", href: canonicalUrl },

        { property: "og:title", content: `${pageTitle} | AnimeOrbit` },
        { property: "og:description", content: `Explore our curated collection of the best anime in this category.` },
        { property: "og:url", content: canonicalUrl },

        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function CollectionPage() {
  const { slug } = Route.useParams();

  const titleMap: Record<string, string> = {
    "best-romance-anime": "Best Romance Anime of All Time",
    "best-action-anime": "Best Action Anime of All Time",
    "best-isekai-anime": "Best Isekai Anime",
    "best-comedy-anime": "Best Comedy Anime",
    "best-horror-anime": "Best Horror Anime",
  };

  const pageTitle = titleMap[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const collectionAnime = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => jikanGetTopAnime({ data: { limit: 36 } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title={pageTitle}
          subtitle="Curated collection of must-watch anime"
          action={
            <Link to="/" className="text-sm text-[#a855f7] hover:underline">
              Back to Home
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
            No anime found in this collection.
          </div>
        )}

        <div className="mt-16 border-t border-white/10 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-[#f8fafc]">Explore More Collections</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/collections/best-action-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Best Action Anime
            </Link>
            <Link to="/collections/best-romance-anime" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Best Romance Anime
            </Link>
            <Link to="/trending" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Trending Now
            </Link>
            <Link to="/top-rated" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10">
              Top Rated
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
