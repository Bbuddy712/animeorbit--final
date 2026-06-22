import type { Reel } from "@/types/reel";

// Mock data for development
// TODO: Replace with real API when backend is ready
const mockReels: Reel[] = [
  {
    id: "reel_1",
    title: "Epic Fight Scene - Jujutsu Kaisen",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // placeholder
    thumbnail: "https://picsum.photos/id/1015/300/400",
    animeTitle: "Jujutsu Kaisen",
    likes: 124000,
    views: 2450000,
  },
  {
    id: "reel_2",
    title: "Gojo Satoru Domain Expansion",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/id/1005/300/400",
    animeTitle: "Jujutsu Kaisen",
    likes: 89000,
    views: 1870000,
  },
  {
    id: "reel_3",
    title: "Demon Slayer - Tanjiro Water Breathing",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://picsum.photos/id/1016/300/400",
    animeTitle: "Demon Slayer",
    likes: 156000,
    views: 3120000,
  },
];

export async function getReels(page: number = 1, limit: number = 10): Promise<Reel[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For MVP, return the same mock data with pagination simulation
  const start = (page - 1) * limit;
  return mockReels.slice(start, start + limit);
}

export async function likeReel(reelId: string): Promise<void> {
  // Mock like action
  console.log(`Liked reel: ${reelId}`);
  await new Promise((resolve) => setTimeout(resolve, 100));
}
