export type Anime = {
  mal_id: number;
  title: string;
  title_english?: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
    webp: { image_url: string; large_image_url: string };
  };
  score?: number | null;
  rank?: number | null;
  popularity?: number | null;
  hianimeUrl?: string | null;
  luciferUrl?: string | null;
  crunchyrollUrl?: string | null;
  netflixUrl?: string | null;
  episodes?: number | null;
  synopsis?: string | null;
  genres: { mal_id: number; name: string }[];
  year?: number | null;
  trailer?: { youtube_id?: string | null; embed_url?: string | null };
  studios?: { name: string }[];
  status?: string | null;
  duration?: string | null;
  rating?: string | null;
};

export type Character = {
  character: { mal_id: number; name: string; images: { webp: { image_url: string } } };
  role: string;
};

export type StreamingLink = { name: string; url: string };

export type SearchHint = { query?: string; tags?: string[] };

export const GENRE_IDS: Record<string, number> = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Fantasy: 10,
  Horror: 14,
  Mystery: 7,
  Romance: 22,
  "Sci-Fi": 24,
  "Slice of Life": 36,
  Sports: 30,
  Supernatural: 37,
  Thriller: 41,
  Psychological: 40,
  Isekai: 62,
};
