import { useInfiniteQuery } from "@tanstack/react-query";
import { getReels } from "@/services/reelsService";
import type { Reel } from "@/types/reel";

export function useReels() {
  return useInfiniteQuery<Reel[]>({
    queryKey: ["reels"],
    queryFn: ({ pageParam = 1 }) => getReels(pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      // Prevent duplicate fetches
      if (!lastPage || lastPage.length === 0) {
        return undefined;
      }
      // Return next page number only if we got a full page
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
