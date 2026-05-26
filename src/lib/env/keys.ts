/** All keys that must exist in the root `.env` file. */
export const ENV_KEYS = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "YOUTUBE_API_KEY",
  "ANILIST_CLIENT_ID",
  "ANILIST_CLIENT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

/** Server-only secrets — never expose via VITE_ prefix or client bundles. */
export const SERVER_SECRET_KEYS = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "YOUTUBE_API_KEY",
  "ANILIST_CLIENT_ID",
  "ANILIST_CLIENT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/** Safe for Vite client bundle (public Supabase anon credentials). */
export const CLIENT_PUBLIC_KEYS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;
