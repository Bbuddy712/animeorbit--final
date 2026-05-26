import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Loader2, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { jikanSearchAnime } from "@/lib/jikan.functions";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { MonetagInPagePush } from "@/components/Ads/MonetagInPagePush";

type SearchSchema = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchSchema => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(q ?? "");

  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => jikanSearchAnime({ data: { q: q ?? "", limit: 24 } }),
    enabled: !!q,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/search", search: { q: input.trim() } });
  }

  function clear() {
    setInput("");
    navigate({ to: "/search", search: { q: "" } });
  }

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      {/* Ambient nebula */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(124,58,237,0.08),transparent_40%)] z-0" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#f8fafc] sm:text-4xl">
            Search{" "}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              anime
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-[#94a3b8]">Find titles, characters, studios and more</p>
        </motion.div>

        {/* In-page push #1 */}
        <div className="mt-10">
          <MonetagInPagePush zone="11058414" />
        </div>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          onSubmit={submit}
          className="mb-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(13,21,38,0.88)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-[rgba(124,58,237,0.07)] px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[#94a3b8]" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="Title, character, studio..."
              className="flex-1 bg-transparent text-sm text-[#f8fafc] outline-none placeholder:text-[#94a3b8]/55"
            />
            {input && (
              <button
                type="button"
                onClick={clear}
                className="text-[#94a3b8]/50 transition-colors hover:text-[#f8fafc]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl btn-neon px-5 py-2.5 text-sm font-semibold"
          >
            Search
          </button>
        </motion.form>

        {/* Empty state */}
        {!q && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)]">
              <Sparkles className="h-7 w-7 text-[#7c3aed]" />
            </div>
            <p className="text-[#94a3b8]">Start typing to discover anime.</p>
          </motion.div>
        )}

        {/* Loading */}
        {q && results.isLoading && (
          <div className="flex items-center gap-3 py-8 text-sm text-[#94a3b8]">
            <Loader2 className="h-4 w-4 animate-spin text-[#7c3aed]" />
            Searching for "{q}"…
          </div>
        )}

        {/* Results */}
        {q && results.data && results.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mb-6 text-sm text-[#94a3b8]">
              <span className="font-semibold text-[#f8fafc]">{results.data.length}</span> results
              for "{q}"
            </p>

            <div className="mb-6">
              {/* In-page push #2 */}
              <MonetagInPagePush zone="11058421" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.data.map((a, i) => (
                <AnimeCard key={a.mal_id} anime={a} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* No results */}
        {q && !results.isLoading && results.data?.length === 0 && (
          <div className="rounded-2xl border border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.05)] p-10 text-center">
            <p className="text-[#94a3b8]">No results found for "{q}"</p>
            <p className="mt-1 text-sm text-[#94a3b8]/60">Try a different title or keyword</p>
          </div>
        )}
      </main>
    </div>
  );
}

