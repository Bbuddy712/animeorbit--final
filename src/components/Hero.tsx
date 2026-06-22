import { motion } from "framer-motion";
import { Search, Play, Compass, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Anime } from "@/lib/jikan";
import { GalaxyCanvas } from "./GalaxyCanvas";

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
export function Hero({ slides }: { slides: Anime[] }) {
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function isRecommendationQuery(value: string): boolean {
    const text = value.trim().toLowerCase();
    if (!text) return false;
    const triggers = [
      "recommend", "suggest", "what to watch", "best anime", "similar to",
      "show me", "like", "for fans of", "need an anime", "should i watch",
      "anime for", "good anime",
    ];
    return triggers.some((trigger) => text.includes(trigger));
  }

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % Math.min(slides.length, 5)), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const active = slides[idx];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030b18]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_200%_110%_at_50%_-15%,#0c1d38_0%,#030b18_55%)]" />
      <GalaxyCanvas />

      {/* Background images */}
      <div className="absolute inset-0 opacity-[0.06]">
        {slides.slice(0, 5).map((s, i) => (
          <motion.div
            key={s.mal_id}
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={s.images.webp.large_image_url}
              alt=""
              className="h-full w-full scale-110 object-cover blur-3xl"
            />
          </motion.div>
        ))}
      </div>

      {/* Nebula orbs */}
      <div className="pointer-events-none absolute left-[5%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/[0.055] blur-[120px]" style={{ animation: "hero-orb-a 18s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute right-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#a855f7]/[0.045] blur-[110px]" style={{ animation: "hero-orb-b 22s ease-in-out infinite", animationDelay: "4s" }} />
      <div className="pointer-events-none absolute bottom-[15%] left-[22%] h-[380px] w-[380px] rounded-full bg-[#6d28d9]/[0.05] blur-[100px]" style={{ animation: "hero-orb-c 26s ease-in-out infinite", animationDelay: "8s" }} />
      <div className="pointer-events-none absolute bottom-[22%] right-[12%] h-[320px] w-[320px] rounded-full bg-[#4f46e5]/[0.04] blur-[90px]" style={{ animation: "hero-orb-a 30s ease-in-out infinite", animationDelay: "2s" }} />

      {/* Vignette & overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_110%_at_50%_50%,transparent_35%,rgba(3,11,24,0.6)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#071120] via-[#071120]/55 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-80" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.12)] px-5 py-2 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#a855f7] animate-glow-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a855f7]">AI-Powered Discovery</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-6 text-5xl font-black leading-[1.0] tracking-[-0.03em] text-[#f8fafc] sm:text-6xl md:text-7xl lg:text-8xl">
            Your Next Anime<br />
            <span className="mt-1 block bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">Starts Here.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.7 }} className="mb-10 max-w-xl text-base leading-relaxed text-[#94a3b8] sm:text-lg">
            Premium anime discovery powered by AI. Curated watchlists, live recommendations, and cinematic browsing — all in one place.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56, duration: 0.6 }}
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = query.trim();
              if (!trimmed) return;
              if (isRecommendationQuery(trimmed)) {
                document.getElementById("ai-finder")?.scrollIntoView({ behavior: "smooth" });
                return;
              }
              navigate({ to: "/search", search: { q: trimmed } });
            }}
            className="mb-8 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.25)] bg-[rgba(15,23,42,0.75)] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,58,237,0.08)] backdrop-blur-2xl"
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-[rgba(124,58,237,0.08)] px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-[#94a3b8]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anime, characters, studios..." className="flex-1 bg-transparent text-sm text-[#f8fafc] outline-none placeholder:text-[#94a3b8]/55" />
            </div>
            <button type="submit" className="shrink-0 rounded-xl btn-neon px-5 py-2.5 text-sm font-semibold">Search</button>
          </motion.form>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.66, duration: 0.6 }} className="flex flex-wrap items-center justify-center gap-4">
            <a href="#trending" className="inline-flex items-center gap-2.5 rounded-xl btn-neon px-7 py-3.5 text-sm font-semibold"><Play className="h-4 w-4 fill-white" /> Start Watching</a>
            <a href="#genres" className="inline-flex items-center gap-2.5 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] px-7 py-3.5 text-sm font-semibold text-[#f8fafc] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.18)]"><Compass className="h-4 w-4" /> Explore Genres</a>
          </motion.div>

          {/* Slide indicator */}
          {active && (
            <motion.div key={active.mal_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="mt-14 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                {slides.slice(0, 5).map((_, i) => (
                  <button key={i} type="button" onClick={() => setIdx(i)} className={`rounded-full transition-all duration-500 ${i === idx ? "h-1.5 w-8 bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]" : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.07)] px-3 py-1 uppercase tracking-[0.22em] text-[#94a3b8]/80">Now Featuring</span>
                <span className="max-w-[240px] truncate text-[#94a3b8]/70">{active.title_english || active.title}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
