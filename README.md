# AnimeOrbit

AI-powered anime discovery built with TanStack Start, Supabase, and Jikan.

## Environment (`.env` only)

This project uses a **single** environment file at the project root: **`.env`**.

On `npm run dev` or `npm run build`, `scripts/ensure-env.mjs` runs automatically and adds any missing keys with empty values.

### Required in `.env`

| Variable                        | Purpose                          |
| ------------------------------- | -------------------------------- |
| `SUPABASE_URL`                  | Supabase project URL (server)    |
| `SUPABASE_PUBLISHABLE_KEY`      | Supabase anon key (server)       |
| `VITE_SUPABASE_URL`             | Same URL for browser client      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same anon key for browser client |

### Optional in `.env`

| Variable                                      | Purpose                     |
| --------------------------------------------- | --------------------------- |
| `GEMINI_API_KEY`                              | Primary AI (Anime Finder)   |
| `OPENAI_API_KEY`                              | Fallback AI if Gemini unset |
| `YOUTUBE_API_KEY`                             | Trailer search fallback     |
| `ANILIST_CLIENT_ID` / `ANILIST_CLIENT_SECRET` | Extra anime metadata        |

**Security:** `GEMINI_API_KEY`, `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, and AniList secrets are **never** prefixed with `VITE_` and are only read on the server from `process.env`.

## Setup

```bash
npm install
npm run env:ensure   # create/update .env keys
# Edit .env with your Supabase + API keys
npm run dev
```

## Architecture

| Layer          | Description                                            |
| -------------- | ------------------------------------------------------ |
| **Client**     | React 19 — only `VITE_SUPABASE_*` in bundle            |
| **Server**     | TanStack Start server functions — all secret APIs      |
| **Auth**       | Supabase Auth + RLS                                    |
| **Anime data** | Jikan v4 (cached, throttled server-side)               |
| **AI**         | Gemini primary → OpenAI fallback → rule-based fallback |

## Deploy

### Vercel

1. Import the repo.
2. Add the same variables from your local `.env` in **Project → Settings → Environment Variables**.
3. Build: `npm run build`

### Cloudflare Workers

Set secrets in Wrangler / dashboard to match `.env`.

## Scripts

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run env:ensure` | Ensure `.env` exists with all standard keys |
| `npm run dev`        | Dev server (runs `env:ensure` first)        |
| `npm run build`      | Production build                            |
