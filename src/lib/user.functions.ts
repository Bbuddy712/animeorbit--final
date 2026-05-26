import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnimeRef = z.object({
  mal_id: z.number().int(),
  title: z.string().min(1).max(300),
  image_url: z.string().url().optional().nullable(),
  score: z.number().optional().nullable(),
  total_episodes: z.number().int().optional().nullable(),
});

// Favorites
export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AnimeRef.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("mal_id", data.mal_id)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      mal_id: data.mal_id,
      title: data.title,
      image_url: data.image_url ?? null,
      score: data.score ?? null,
    });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

// Watchlist
export const listWatchlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("watchlist")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertWatchlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    AnimeRef.extend({
      status: z.enum(["plan_to_watch", "watching", "completed", "on_hold", "dropped"]),
      episodes_watched: z.number().int().min(0).max(9999).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("watchlist").upsert(
      {
        user_id: userId,
        mal_id: data.mal_id,
        title: data.title,
        image_url: data.image_url ?? null,
        total_episodes: data.total_episodes ?? null,
        status: data.status,
        episodes_watched: data.episodes_watched ?? 0,
        score: data.score ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,mal_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeWatchlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ mal_id: z.number().int() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("watchlist")
      .delete()
      .eq("user_id", context.userId)
      .eq("mal_id", data.mal_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Recently viewed
export const trackRecentlyViewed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AnimeRef.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("recently_viewed").upsert(
      {
        user_id: context.userId,
        mal_id: data.mal_id,
        title: data.title,
        image_url: data.image_url ?? null,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,mal_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRecentlyViewed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("recently_viewed")
      .select("*")
      .order("viewed_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
