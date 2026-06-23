import { useEffect, useRef, useState, useCallback } from "react";
import { useReels } from "@/hooks/useReels";
import { ReelPlayer } from "./ReelPlayer";
import { ReelActions } from "./ReelActions";
import type { Reel } from "@/types/reel";

export function ReelsFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const reels: Reel[] = data?.pages.flat() ?? [];

  // Improved intersection handler: only activate the reel with highest visibility
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let maxRatio = 0;
    let bestIndex = activeIndex;

    entries.forEach((entry) => {
      if (entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        const index = Number(entry.target.getAttribute("data-index"));
        if (!isNaN(index)) {
          bestIndex = index;
        }
      }
    });

    if (bestIndex !== activeIndex && maxRatio > 0.25) {
      setActiveIndex(bestIndex);
    }
  }, [activeIndex]);

  // Intersection Observer with multiple thresholds for smoother behavior
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0.25, 0.5, 0.75, 1],
    });

    observerRef.current = observer;

    const reelElements = containerRef.current?.querySelectorAll(".reel-container");
    reelElements?.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [reels.length, handleIntersection]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !hasNextPage || isFetchingNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        fetchNextPage();
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          data-index={index}
          className="reel-container relative h-screen w-full snap-start"
        >
          <ReelPlayer reel={reel} isActive={index === activeIndex} />

          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="mb-4">
              <p className="text-sm font-semibold text-white/90">{reel.animeTitle}</p>
              <h2 className="text-xl font-bold text-white">{reel.title}</h2>
            </div>

            <ReelActions reel={reel} />
          </div>
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="flex h-20 items-center justify-center text-white/60">
          Loading more reels...
        </div>
      )}
    </div>
  );
}