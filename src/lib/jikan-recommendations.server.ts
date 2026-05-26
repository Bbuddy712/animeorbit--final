import type { Anime, SearchHint } from "@/lib/anime.types";
import { GENRE_IDS } from "@/lib/anime.types";
import { jikanApi } from "@/lib/jikan-api.server";

const REFUSAL_MARKERS = [
  "i cannot",
  "i can't",
  "i am unable",
  "i'm unable",
  "as an ai",
  "as a language model",
  "moderation",
  "policy",
  "warning",
  "tags:",
  "system message",
];

const WORD_FIXES: Record<string, string> = {
  romnce: "romance",
  romace: "romance",
  romantc: "romance",
  psycological: "psychological",
  physchological: "psychological",
  phychological: "psychological",
  fantacy: "fantasy",
  fantsy: "fantasy",
  advanture: "adventure",
  naroto: "naruto",
  narotu: "naruto",
  shonen: "shounen",
  levelling: "leveling",
  levelingg: "leveling",
};

const TITLE_INTENTS: Record<string, { queries: string[]; genres: number[] }> = {
  "solo leveling": {
    queries: ["solo leveling", "overlord", "sword art online", "tower of god"],
    genres: [GENRE_IDS.Action, GENRE_IDS.Fantasy],
  },
  naruto: {
    queries: ["naruto", "bleach", "hunter x hunter", "black clover"],
    genres: [GENRE_IDS.Action, GENRE_IDS.Adventure],
  },
  "death note": {
    queries: ["death note", "monster", "code geass", "parasyte"],
    genres: [GENRE_IDS.Psychological, GENRE_IDS.Thriller],
  },
};

const MOOD_INTENTS = [
  {
    keys: ["sad romance", "emotional romance", "sad love", "romance drama", "tearjerker"],
    genres: [GENRE_IDS.Romance, GENRE_IDS.Drama],
    queries: ["your lie in april", "clannad", "fruits basket"],
  },
  {
    keys: [
      "dark psychological",
      "psychological",
      "dark anime",
      "thriller",
      "mind game",
      "mind bending",
    ],
    genres: [GENRE_IDS.Psychological, GENRE_IDS.Thriller, GENRE_IDS.Mystery],
    queries: ["death note", "monster", "parasyte"],
  },
  {
    keys: ["action fantasy", "overpowered", "overpowered mc", "op mc", "power fantasy", "level up"],
    genres: [GENRE_IDS.Action, GENRE_IDS.Fantasy],
    queries: ["solo leveling", "overlord", "that time i got reincarnated as a slime"],
  },
  {
    keys: ["romance", "love story", "romantic"],
    genres: [GENRE_IDS.Romance],
    queries: ["kaguya-sama", "fruits basket", "horimiya"],
  },
  {
    keys: ["action", "fight", "battle", "shounen", "shonen"],
    genres: [GENRE_IDS.Action],
    queries: ["jujutsu kaisen", "demon slayer", "hunter x hunter"],
  },
  {
    keys: ["isekai", "another world"],
    genres: [GENRE_IDS.Isekai, GENRE_IDS.Fantasy],
    queries: ["re:zero", "mushoku tensei", "overlord"],
  },
  {
    keys: ["wholesome", "comfort", "cozy", "slice of life"],
    genres: [GENRE_IDS["Slice of Life"], GENRE_IDS.Comedy],
    queries: ["yuru camp", "barakamon", "non non biyori"],
  },
];

const PROTAGONIST_HINTS: { keys: string[]; signal: string[] }[] = [
  {
    keys: ["overpowered", "op mc", "power fantasy", "level up", "strongest"],
    signal: ["solo leveling", "overlord", "one punch man", "mushoku tensei"],
  },
  {
    keys: ["antihero", "dark mc", "morally grey", "villain"],
    signal: ["death note", "code geass", "monster", "berserk"],
  },
  {
    keys: ["female lead", "girl mc", "shoujo"],
    signal: ["fruits basket", "nana", "yona of the dawn"],
  },
  {
    keys: ["underdog", "weak to strong", "training"],
    signal: ["my hero academia", "black clover", "naruto"],
  },
  {
    keys: ["genius", "smart mc", "strategist"],
    signal: ["death note", "classroom of the elite", "no game no life"],
  },
];

const MOOD_TAGS: { keys: string[]; tags: string[] }[] = [
  { keys: ["dark", "gritty", "brutal", "violent"], tags: ["dark", "violence"] },
  { keys: ["wholesome", "comfort", "cozy", "healing"], tags: ["wholesome", "healing"] },
  { keys: ["sad", "tearjerker", "emotional", "cry"], tags: ["emotional", "tragedy"] },
  { keys: ["funny", "comedy", "hilarious"], tags: ["comedy"] },
  { keys: ["epic", "grand", "adventure"], tags: ["epic", "adventure"] },
  { keys: ["romantic", "love", "romance"], tags: ["romance"] },
  { keys: ["mind bending", "psychological", "twist"], tags: ["psychological", "mystery"] },
];

type Profile = {
  genres: Set<number>;
  tags: Set<string>;
  protagonist: Set<string>;
  titleSignals: string[];
  rawText: string;
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => WORD_FIXES[word] ?? word)
    .join(" ")
    .trim();
}

function isRefusalText(value = "") {
  const normalized = value.toLowerCase();
  return REFUSAL_MARKERS.some((marker) => normalized.includes(marker));
}

async function safeAnimeRequest(source: Promise<Anime[]>) {
  try {
    return await source;
  } catch (error) {
    console.warn("Anime search source failed:", error);
    return [];
  }
}

function buildProfile(text: string, extraGenres: number[] = []): Profile {
  const genres = new Set<number>(extraGenres);
  const tags = new Set<string>();
  const protagonist = new Set<string>();
  const titleSignals: string[] = [];

  for (const [name, id] of Object.entries(GENRE_IDS)) {
    if (text.includes(name.toLowerCase())) genres.add(id);
  }
  for (const intent of MOOD_INTENTS) {
    if (intent.keys.some((k) => text.includes(k))) intent.genres.forEach((g) => genres.add(g));
  }
  for (const m of MOOD_TAGS) {
    if (m.keys.some((k) => text.includes(k))) m.tags.forEach((t) => tags.add(t));
  }
  for (const p of PROTAGONIST_HINTS) {
    if (p.keys.some((k) => text.includes(k))) {
      p.signal.forEach((s) => protagonist.add(s));
      titleSignals.push(...p.signal);
    }
  }
  for (const [title, intent] of Object.entries(TITLE_INTENTS)) {
    if (text.includes(title)) {
      intent.genres.forEach((g) => genres.add(g));
      titleSignals.push(...intent.queries);
    }
  }
  return { genres, tags, protagonist, titleSignals, rawText: text };
}

function scoreAnime(anime: Anime, profile: Profile): number {
  let score = 0;
  const animeGenres = new Set((anime.genres ?? []).map((g) => g.mal_id));

  let genreOverlap = 0;
  profile.genres.forEach((g) => {
    if (animeGenres.has(g)) genreOverlap++;
  });
  if (profile.genres.size) score += (genreOverlap / profile.genres.size) * 40;

  const synopsis = (anime.synopsis ?? "").toLowerCase();
  let tagHits = 0;
  profile.tags.forEach((t) => {
    if (synopsis.includes(t)) tagHits++;
  });
  score += tagHits * 6;

  const animeTitle = normalizeSearchText(anime.title_english || anime.title);
  for (const sig of profile.titleSignals) {
    const ns = normalizeSearchText(sig);
    if (animeTitle.includes(ns) || ns.includes(animeTitle)) {
      score += 25;
      break;
    }
  }

  if (typeof anime.score === "number") score += anime.score * 2;

  if (typeof anime.popularity === "number" && anime.popularity > 0) {
    score += Math.max(0, 10 - Math.log10(anime.popularity) * 2.5);
  }

  return score;
}

async function gatherCandidates(profile: Profile, queries: string[]): Promise<Anime[]> {
  const pool: Anime[] = [];
  const seen = new Set<number>();
  const push = (list: Anime[]) => {
    for (const a of list) {
      if (!a?.mal_id || seen.has(a.mal_id)) continue;
      pool.push(a);
      seen.add(a.mal_id);
    }
  };

  const tasks: Promise<Anime[]>[] = [];
  for (const q of queries.slice(0, 4)) {
    if (q) tasks.push(safeAnimeRequest(jikanApi.searchAnime(q, 10)));
  }
  if (profile.genres.size) {
    tasks.push(safeAnimeRequest(jikanApi.getByGenres([...profile.genres].slice(0, 3), 15)));
  }
  for (const sig of profile.titleSignals.slice(0, 3)) {
    tasks.push(safeAnimeRequest(jikanApi.searchAnime(sig, 6)));
  }

  const batches = await Promise.all(tasks);
  batches.forEach(push);

  const seed = pool[0];
  if (seed) {
    const recs = await safeAnimeRequest(jikanApi.getAnimeRecommendations(seed.mal_id));
    push(recs);
  }

  if (pool.length < 8) push(await safeAnimeRequest(jikanApi.getTopAnime(12)));
  return pool;
}

export async function getSmartAnimeRecommendations(
  input: string,
  limit = 8,
  hints: SearchHint = {},
) {
  const rawPrompt = input.trim();
  const safeHintQuery = hints.query && !isRefusalText(hints.query) ? hints.query : "";
  const safeTags = (hints.tags ?? []).filter((tag) => !isRefusalText(tag)).join(" ");
  const combined = normalizeSearchText(`${rawPrompt} ${safeHintQuery} ${safeTags}`);
  const profile = buildProfile(combined);

  const queries = [normalizeSearchText(rawPrompt), safeHintQuery, ...profile.titleSignals].filter(
    Boolean,
  );

  const candidates = await gatherCandidates(profile, queries);

  const ranked = candidates
    .map((a) => ({ a, s: scoreAnime(a, profile) }))
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);

  if (ranked.length === 0) {
    return await safeAnimeRequest(jikanApi.getTopAnime(limit));
  }
  return ranked.slice(0, limit);
}
