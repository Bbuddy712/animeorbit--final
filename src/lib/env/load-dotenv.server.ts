import { config } from "dotenv";

let loaded = false;

/** Load root `.env` into process.env (server-only). */
export function loadDotenv(): void {
  if (loaded) return;
  const result = config({ path: ".env" });
  if (result.error && (result.error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.warn("[env] Failed to load .env:", result.error.message);
  }
  loaded = true;
}
