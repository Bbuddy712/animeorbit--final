/**
 * Browser-safe Supabase config — reads only VITE_* from the Vite-injected `.env`.
 * Never import server env or secret keys in client components.
 */

export type ClientSupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
};

function readVite(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = import.meta.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getClientSupabaseEnv(): ClientSupabaseEnv {
  const SUPABASE_URL = readVite("VITE_SUPABASE_URL");
  const SUPABASE_PUBLISHABLE_KEY = readVite("VITE_SUPABASE_PUBLISHABLE_KEY");

  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length) {
    throw new Error(
      `[env] Missing in .env: ${missing.join(", ")}. Run "npm run env:ensure" then set Supabase URL and anon key.`,
    );
  }

  return { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
}
