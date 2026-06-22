import { useInfiniteQuery } from "@tanstack/react-query";
import { getReels } from "@/services/reelsService";
import type { Reel } from "@/types/reel";

export function useReels() {
  return useInfiniteQuery<Reel[]>({
    queryKey: ["reels"],
    queryFn: ({ pageParam = 1 }) => getReels(pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      // Simple pagination logic for mock data
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
