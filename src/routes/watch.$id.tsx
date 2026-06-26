import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimePlayer } from '@/components/player/AnimePlayer';
import { EpisodeSelector } from '@/components/player/EpisodeSelector';
import { ServerSelector } from '@/components/player/ServerSelector';
import { PlayerControls } from '@/components/player/PlayerControls';

export const Route = createFileRoute('/watch/$id')({
  loader: async ({ params }) => {
    // Fetch anime + episode data
    return { id: params.id };
  },
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useLoaderData();
  // TODO: Fetch full anime/episode data

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Player */}
        <AnimePlayer />

        <div className="flex flex-col lg:flex-row gap-8 p-6">
          {/* Sidebar */}
          <div className="lg:w-80">
            <EpisodeSelector />
            <ServerSelector />
          </div>

          {/* Info */}
          <div className="flex-1">
            <PlayerControls />
            {/* Related, recommendations */}
          </div>
        </div>
      </div>
    </div>
  );
}
