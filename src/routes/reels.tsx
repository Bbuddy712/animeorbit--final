import { createFileRoute } from "@tanstack/react-router";
import { ReelsFeed } from "@/components/reels/ReelsFeed";

export const Route = createFileRoute("/reels")({
  component: ReelsPage,
});

function ReelsPage() {
  return (
    <div className="min-h-screen bg-black">
      <ReelsFeed />
    </div>
  );
}
