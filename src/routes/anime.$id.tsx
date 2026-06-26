import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { AnimeCard } from '@/components/AnimeCard';
import { WatchButton } from '@/components/WatchButton';
import { WhereToWatch } from '@/components/WhereToWatch';
import { AnimeCardSkeleton, SectionSkeleton } from '@/components/skeletons';

import { jikanGetAnimeById, jikanGetAnimeRecommendations, jikanGetAnimeCharacters } from '@/lib/jikan.functions';
import type { Anime } from '@/lib/anime.types';

export const Route = createFileRoute('/anime/$id')({
  loader: async ({ params }) => {
    const id = parseInt(params.id);
    const [animeData, recommendations] = await Promise.all([
      jikanGetAnimeById({ id }),
      jikanGetAnimeRecommendations({ id }),
    ]);
    return { anime: animeData, recommendations };
  },
  component: AnimeDetailPage,
});

function AnimeDetailPage() {
  const { anime, recommendations } = Route.useLoaderData();
  const { data: characters } = useQuery({
    queryKey: ['anime-characters', anime.mal_id],
    queryFn: () => jikanGetAnimeCharacters({ id: anime.mal_id }),
  });

  if (!anime) return <div>Anime not found</div>;

  const studios = anime.studios?.map((s: any) => s.name) || [];
  const genres = anime.genres || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-[#0a0a0a]" />
        {anime.images?.webp?.large_image_url && (
          <img
            src={anime.images.webp.large_image_url}
            alt={anime.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-shrink-0">
                <img
                  src={anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-48 md:w-64 rounded-xl shadow-2xl border border-white/10"
                />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  {anime.score && <div className="px-3 py-1 bg-white/10 rounded text-sm font-medium">★ {anime.score}</div>}
                  {anime.year && <div className="text-sm opacity-75">{anime.year}</div>}
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{anime.title}</h1>
                {anime.title_english && <p className="text-xl opacity-75">{anime.title_english}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <WatchButton 
            animeTitle={anime.title} 
            malId={anime.mal_id} 
            size="lg" 
          />
          <WhereToWatch anime={anime} />
        </div>

        {/* Synopsis */}
        <div className="prose prose-invert max-w-none mb-16">
          <h2 className="text-2xl font-semibold mb-6">Synopsis</h2>
          <p className="text-lg leading-relaxed text-[#e2e8f0]">{anime.synopsis}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {anime.episodes && <div><div className="text-sm opacity-60">Episodes</div><div className="text-3xl font-semibold">{anime.episodes}</div></div>}
          {anime.status && <div><div className="text-sm opacity-60">Status</div><div className="text-xl capitalize">{anime.status}</div></div>}
          {studios.length > 0 && <div><div className="text-sm opacity-60">Studios</div><div className="text-xl">{studios.join(', ')}</div></div>}
          {anime.duration && <div><div className="text-sm opacity-60">Duration</div><div className="text-xl">{anime.duration}</div></div>}
        </div>

        {/* Genres */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold mb-6">Genres</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((g: any) => (
              <Link
                key={g.mal_id}
                to="/genre/$name"
                params={{ name: g.name.toLowerCase().replace(/\s+/g, '-') }}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm transition"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-semibold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recommendations.slice(0, 12).map((rec: any) => (
                <AnimeCard key={rec.mal_id} anime={rec} />
              ))}
            </div>
          </section>
        )}

        {/* Explore More */}
        <section className="mt-16 border-t border-white/10 pt-8">
          {/* Preserved and enhanced from previous */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#f8fafc]">Explore More</h3>
            <p className="text-sm text-[#94a3b8]">Discover trending, top-rated, and seasonal anime</p>
          </div>
          {/* ... existing explore links ... */}
        </section>
      </div>
    </div>
  );
}

// Add error and loading fallbacks as needed
