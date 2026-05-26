/**
 * Ensures project root `.env` exists with all required keys.
 * Run automatically via npm predev / prebuild.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = resolve(ROOT, ".env");

const REQUIRED_KEYS = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "YOUTUBE_API_KEY",
  "ANILIST_CLIENT_ID",
  "ANILIST_CLIENT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

const SYNC_PAIRS = [
  ["VITE_SUPABASE_URL", "SUPABASE_URL"],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"],
];

function parseEnv(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function serializeEnv(map) {
  const header = `# AnimeOrbit — single environment file (do not commit secrets to git)\n`;
  const blocks = [
    ["# AI (Gemini primary; OpenAI optional fallback)", ["GEMINI_API_KEY", "OPENAI_API_KEY"]],
    ["# Optional APIs", ["YOUTUBE_API_KEY", "ANILIST_CLIENT_ID", "ANILIST_CLIENT_SECRET"]],
    [
      "# Supabase",
      [
        "SUPABASE_URL",
        "SUPABASE_PUBLISHABLE_KEY",
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_PUBLISHABLE_KEY",
      ],
    ],
  ];

  const written = new Set();
  let out = header;

  for (const [comment, keys] of blocks) {
    out += `\n${comment}\n`;
    for (const key of keys) {
      if (!REQUIRED_KEYS.includes(key)) continue;
      const value = map.get(key) ?? "";
      out += `${key}=${value.includes(" ") ? `"${value}"` : value}\n`;
      written.add(key);
    }
  }

  for (const key of REQUIRED_KEYS) {
    if (written.has(key)) continue;
    out += `${key}=\n`;
  }

  return out.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function unquote(value) {
  if (!value) return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function main() {
  let map = new Map();

  if (existsSync(ENV_PATH)) {
    map = parseEnv(readFileSync(ENV_PATH, "utf8"));
  }

  let changed = !existsSync(ENV_PATH);

  for (const key of REQUIRED_KEYS) {
    if (!map.has(key)) {
      map.set(key, "");
      changed = true;
    }
  }

  for (const [viteKey, baseKey] of SYNC_PAIRS) {
    const viteVal = unquote(map.get(viteKey) ?? "");
    const baseVal = unquote(map.get(baseKey) ?? "");
    if (!viteVal && baseVal) {
      map.set(viteKey, baseVal);
      changed = true;
    } else if (!baseVal && viteVal) {
      map.set(baseKey, viteVal);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(ENV_PATH, serializeEnv(map), "utf8");
    console.log("[ensure-env] Updated .env with required keys.");
  } else {
    console.log("[ensure-env] .env is up to date.");
  }
}

main();
