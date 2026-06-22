import { supabase } from "@/lib/supabase";
import type { Reel } from "@/types/reel";

// ============================================
// MOCK DATA (Fallback) - First reel now uses real Cloudinary video
// ============================================
const mockReels: Reel[] = [
  {
    id: "reel_1",
    title: "Cloudinary Test Reel",
    videoUrl: "https://res.cloudinary.com/dqgzopdky/video/upload/EDIT_4k_hrd1bo.mp4",
    thumbnail: "https://res.cloudinary.com/dqgzopdky/video/upload/EDIT_4k_hrd1bo.jpg",
    animeTitle: "Demon Slayer",
    likes: 0,
    views: 0,
  },
  {
    id: "reel_2",
    title: "Gojo Satoru Domain Expansion",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/id/1005/300/400",
    animeTitle: "Jujutsu Kaisen",
    likes: 89000,
    views: 1870000,
  },
  {
    id: "reel_3",
    title: "Demon Slayer - Tanjiro Water Breathing",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/id/1016/300/400",
    animeTitle: "Demon Slayer",
    likes: 156000,
    views: 3120000,
  },
];

// ============================================
// getReels
// ============================================
export async function getReels(page: number = 1, limit: number = 10): Promise<Reel[]> {
  try {
    const { data, error } = await supabase
      .from("reels")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((reel: any) => ({
        id: reel.id,
        title: reel.title,
        videoUrl: reel.video_url,
        thumbnail: reel.thumbnail_url || "",
        animeTitle: reel.anime_title,
        likes: reel.likes || 0,
        views: reel.views || 0,
      }));
    }
  } catch (err) {
    console.warn("Supabase getReels failed, falling back to mock data", err);
  }

  // Fallback to mock data
  await new Promise((resolve) => setTimeout(resolve, 300));
  const start = (page - 1) * limit;
  return mockReels.slice(start, start + limit);
}

// ============================================
// incrementViews
// ============================================
export async function incrementViews(id: string): Promise<void> {
  try {
    const { data, error: selectError } = await supabase
      .from("reels")
      .select("views")
      .eq("id", id)
      .single();

    if (selectError) throw selectError;

    const newViews = (data?.views || 0) + 1;

    const { error: updateError } = await supabase
      .from("reels")
      .update({ views: newViews })
      .eq("id", id);

    if (updateError) throw updateError;
  } catch (err) {
    console.warn("incrementViews failed", err);
  }
}

// ============================================
// toggleLike
// ============================================
export async function toggleLike(reelId: string, userId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from("likes")
      .select("*")
      .eq("reel_id", reelId)
      .eq("user_id", userId)
      .single();

    if (data) {
      await supabase.from("likes").delete().eq("reel_id", reelId).eq("user_id", userId);
    } else {
      await supabase.from("likes").insert({ reel_id: reelId, user_id: userId });
    }
  } catch (err) {
    console.warn("toggleLike failed", err);
  }
}

// ============================================
// bookmarkReel
// ============================================
export async function bookmarkReel(reelId: string, userId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("reel_id", reelId)
      .eq("user_id", userId)
      .single();

    if (data) {
      await supabase.from("bookmarks").delete().eq("reel_id", reelId).eq("user_id", userId);
    } else {
      await supabase.from("bookmarks").insert({ reel_id: reelId, user_id: userId });
    }
  } catch (err) {
    console.warn("bookmarkReel failed", err);
  }
}

// ============================================
// saveWatchHistory
// ============================================
export async function saveWatchHistory(reelId: string, userId: string): Promise<void> {
  try {
    await supabase.from("watch_history").insert({
      reel_id: reelId,
      user_id: userId,
    });
  } catch (err) {
    console.warn("saveWatchHistory failed", err);
  }
}

// ============================================
// getComments
// ============================================
export async function getComments(reelId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("reel_id", reelId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("getComments failed", err);
    return [];
  }
}

// ============================================
// addComment
// ============================================
export async function addComment(reelId: string, userId: string, comment: string) {
  try {
    const { error } = await supabase.from("comments").insert({
      reel_id: reelId,
      user_id: userId,
      comment,
    });

    if (error) throw error;
  } catch (err) {
    console.warn("addComment failed", err);
  }
}
