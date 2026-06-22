import { useEffect, useRef } from "react";
import type { Reel } from "@/types/reel";

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelPlayer({ reel, isActive }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        poster={reel.thumbnail}
      />
    </div>
  );
}
