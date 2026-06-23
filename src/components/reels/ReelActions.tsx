import type { Reel } from "@/types/reel";
import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";

interface ReelActionsProps {
  reel: Reel;
}

export function ReelActions({ reel }: ReelActionsProps) {
  // Defensive guard to prevent runtime crash
  if (!reel) {
    console.error("[ReelActions] reel is undefined");
    return null;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: `Check out this clip from ${reel.animeTitle}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <LikeButton likes={reel.likes} />
        <ShareButton onShare={handleShare} />
      </div>

      <div className="text-right text-sm text-white/70">
        <div>{(reel.views / 1000000).toFixed(1)}M views</div>
      </div>
    </div>
  );
}
