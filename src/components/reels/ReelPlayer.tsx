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

  // Guard against undefined reel (prevents crash)
  if (!reel) {
    console.error("[ReelPlayer] reel is undefined");
    return null;
  }

  // === TEMP DEBUG LOGS ===
  console.log("[ReelPlayer] reel =", reel);
  console.log("[ReelPlayer] videoUrl =", reel?.videoUrl);

  useEffect(() => {
    try {
      const video = videoRef.current;
      if (!video) return;

      console.log("[VIDEO SRC after mount]", video.src);

      if (isActive && !hasError) {
        console.log("[PLAY ATTEMPT] isActive=", isActive, "src=", video.src);
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("[PLAY SUCCESS]"))
            .catch((err) => console.error("[PLAY ERROR]", err));
        }
      } else {
        video.pause();
      }
    } catch (err) {
      console.error("[ReelPlayer useEffect error]", err);
    }
  }, [isActive, hasError]);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [reel.id]);

  const handleLoadedData = () => {
    console.log("[LOADED DATA]", reel.title);
    setIsLoading(false);
  };

  const handleError = () => {
    try {
      const video = videoRef.current;
      console.error("[VIDEO ERROR]", {
        title: reel.title,
        src: video?.src,
        error: video?.error,
        networkState: video?.networkState,
        readyState: video?.readyState,
      });
      setHasError(true);
      setIsLoading(false);
    } catch (err) {
      console.error("[handleError error]", err);
    }
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        poster={reel.thumbnail}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onWaiting={handleWaiting}
      />

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {/* TEMPORARILY DISABLED ERROR FALLBACK FOR DEBUGGING
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <div className="mb-3 text-center">
            <p className="text-sm">Failed to load video</p>
            <p className="mt-1 text-xs text-white/60">{reel.animeTitle}</p>
          </div>
          {reel.thumbnail && (
            <img
              src={reel.thumbnail}
              alt={reel.title}
              className="max-h-[60%] rounded object-cover"
            />
          )}
        </div>
      )}
      */}
    </div>
  );
}

export const ReelPlayer = memo(ReelPlayerComponent);
