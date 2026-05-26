import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Anime } from "@/lib/jikan";
import { aiMoodToQuery } from "@/lib/ai.functions";
import { jikanSmartRecommendations } from "@/lib/jikan.functions";
import { AnimeCard } from "./AnimeCard";

const MOODS = [
  "Dark & psychological",
  "Wholesome",
  "Action-packed",
  "Sad romance",
  "Like Naruto",
  "Best beginner anime",
];

export function AiFinder() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [echoed, setEchoed] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const moodFn = useServerFn(aiMoodToQuery);
  const smartFn = useServerFn(jikanSmartRecommendations);

  async function run(prompt: string) {
    if (!prompt.trim()) return;
    setLoading(true);
    setEchoed(prompt);
    setReasoning(null);
    try {
      const ai = await moodFn({ data: { prompt } });
      setReasoning(ai.reasoning);
      const data = await smartFn({
        data: { prompt, limit: 8, hints: { query: ai.query, tags: ai.tags } },
      });
      setResults(data);
    } catch {
      const data = await smartFn({ data: { prompt, limit: 8 } });
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ai-finder" className="relative py-16 sm:py-24">
      {/* Subtle purple ambient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.1),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#a855f7] animate-glow-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a855f7]">
              AI Anime Finder
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-[#f8fafc] sm:text-5xl">
            Tell us your{" "}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              mood
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-[#94a3b8]">
            Describe what you feel like watching — our AI finds anime that matches the vibe.
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
          className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(15,23,42,0.9)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. dark psychological anime with a twist..."
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[#f8fafc] outline-none placeholder:text-[#94a3b8]/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl btn-neon px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask AI
          </button>
        </motion.form>

        {/* Mood chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setInput(m);
                run(m);
              }}
              className="rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.07)] px-3.5 py-1.5 text-xs font-medium text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.15)] hover:text-white"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Results */}
        {echoed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <p className="mb-1 text-sm text-[#94a3b8]">
              Picks for <span className="font-semibold text-[#f8fafc]">"{echoed}"</span>
            </p>
            {reasoning && <p className="mb-5 text-xs italic text-[#a855f7]/70">{reasoning}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-[#0f172a] animate-shimmer" />
                  ))
                : results.map((a, i) => <AnimeCard key={a.mal_id} anime={a} index={i} />)}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
