import { useEffect, useRef, useState, memo } from "react";
import type { Reel } from "@/types/reel";

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
}

function ReelPlayerComponent({ reel, isActive }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!reel) return null;

  // Reset state when reel changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [reel.id]);

  // Control playback - only active reel plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !hasError) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, hasError]);

  const handleLoadedData = () => setIsLoading(false);
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  const handleWaiting = () => setIsLoading(true);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnail}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={handleLoadedData}
        onError={handleError}
        onWaiting={handleWaiting}
      />

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 text-white text-center p-4">
          <img src={reel.thumbnail} alt={reel.title} className="max-h-[50%] object-contain opacity-70 rounded" />
          <p className="mt-4 text-sm">Failed to load video</p>
          <p className="text-xs text-white/60 mt-1">{reel.animeTitle}</p>
        </div>
      )}
    </div>
  );
}

export const ReelPlayer = memo(ReelPlayerComponent);
