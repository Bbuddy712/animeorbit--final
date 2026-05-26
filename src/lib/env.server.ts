import { z } from "zod";
import { loadDotenv } from "./env/load-dotenv.server";
import { ENV_KEYS } from "./env/keys";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  YOUTUBE_API_KEY: z.string().min(1).optional(),
  ANILIST_CLIENT_ID: z.string().min(1).optional(),
  ANILIST_CLIENT_SECRET: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

function readProcess(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function buildRaw() {
  return {
    SUPABASE_URL: readProcess("SUPABASE_URL"),
    SUPABASE_PUBLISHABLE_KEY: readProcess("SUPABASE_PUBLISHABLE_KEY"),
    VITE_SUPABASE_URL: readProcess("VITE_SUPABASE_URL"),
    VITE_SUPABASE_PUBLISHABLE_KEY: readProcess("VITE_SUPABASE_PUBLISHABLE_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: readProcess("SUPABASE_SERVICE_ROLE_KEY"),
    GEMINI_API_KEY: readProcess("GEMINI_API_KEY"),
    OPENAI_API_KEY: readProcess("OPENAI_API_KEY"),
    YOUTUBE_API_KEY: readProcess("YOUTUBE_API_KEY"),
    ANILIST_CLIENT_ID: readProcess("ANILIST_CLIENT_ID"),
    ANILIST_CLIENT_SECRET: readProcess("ANILIST_CLIENT_SECRET"),
  };
}

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  loadDotenv();

  const parsed = serverEnvSchema.safeParse(buildRaw());
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`[env] Invalid .env configuration. Fix required variables in .env — ${issues}`);
  }

  cached = parsed.data;
  return cached;
}

export function validateEnvAtStartup(): void {
  try {
    getServerEnv();
  } catch (err) {
    console.error("[env]", err instanceof Error ? err.message : err);
    console.warn("[env] Server starting in degraded mode — Supabase features will be unavailable.");
    return;
  }

  const env = getServerEnv();
  const optional: { key: string; set: boolean }[] = [
    { key: "GEMINI_API_KEY", set: Boolean(env.GEMINI_API_KEY) },
    { key: "OPENAI_API_KEY", set: Boolean(env.OPENAI_API_KEY) },
    { key: "YOUTUBE_API_KEY", set: Boolean(env.YOUTUBE_API_KEY) },
    {
      key: "ANILIST_CLIENT_ID + ANILIST_CLIENT_SECRET",
      set: Boolean(env.ANILIST_CLIENT_ID && env.ANILIST_CLIENT_SECRET),
    },
  ];

  const missingOptional = optional.filter((o) => !o.set).map((o) => o.key);
  if (missingOptional.length) {
    console.warn(
      `[env] Optional keys not set in .env (features may use fallbacks): ${missingOptional.join(", ")}`,
    );
  }

  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    console.warn(
      "[env] Neither GEMINI_API_KEY nor OPENAI_API_KEY is set — AI Anime Finder will use rule-based fallback only.",
    );
  }

  console.info("[env] Loaded .env — required Supabase variables OK.");
}

export function getGeminiKey(): string | undefined {
  return getServerEnv().GEMINI_API_KEY;
}

export function getOpenAiKey(): string | undefined {
  return getServerEnv().OPENAI_API_KEY;
}

export function getYoutubeKey(): string | undefined {
  return getServerEnv().YOUTUBE_API_KEY;
}

export function getAnilistCredentials(): { clientId: string; clientSecret: string } | null {
  const { ANILIST_CLIENT_ID, ANILIST_CLIENT_SECRET } = getServerEnv();
  if (!ANILIST_CLIENT_ID || !ANILIST_CLIENT_SECRET) return null;
  return { clientId: ANILIST_CLIENT_ID, clientSecret: ANILIST_CLIENT_SECRET };
}

export { ENV_KEYS };
