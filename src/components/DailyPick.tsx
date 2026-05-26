import { motion } from "framer-motion";
import { Star, Calendar, Tv, Shuffle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Anime } from "@/lib/jikan";
import { jikanGetRandom } from "@/lib/jikan.functions";

export function DailyPick({ initial }: { initial: Anime | null }) {
  const [pick, setPick] = useState<Anime | null>(initial);
  const [loading, setLoading] = useState(false);
  const randomFn = useServerFn(jikanGetRandom);

  async function shuffle() {
    setLoading(true);
    try {
      setPick(await randomFn());
    } catch {
      /* keep current */
    } finally {
      setLoading(false);
    }
  }

  if (!pick) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[#0f172a]"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={pick.images.webp.large_image_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full scale-110 object-cover opacity-15 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/88 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />
          </div>

          {/* Purple left accent bar */}
          <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#7c3aed] to-[#a855f7]" />

          <div className="relative grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[220px_1fr]">
            {/* Poster */}
            <motion.img
              key={pick.mal_id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={pick.images.webp.large_image_url}
              alt={pick.title}
              className="mx-auto w-full max-w-[200px] rounded-xl shadow-[0_0_36px_rgba(124,58,237,0.3),0_16px_48px_rgba(0,0,0,0.6)] md:mx-0"
            />

            {/* Info */}
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.12)] px-3 py-1">
                <Shuffle className="h-3 w-3 text-[#a855f7]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a855f7]">
                  Daily Random Pick
                </span>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-[#f8fafc] sm:text-3xl">
                {pick.title_english || pick.title}
              </h3>

              <div className="mb-4 flex flex-wrap gap-3 text-xs text-[#94a3b8]">
                {pick.score && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[#a855f7] text-[#a855f7]" />
                    {pick.score.toFixed(1)}
                  </span>
                )}
                {pick.episodes && (
                  <span className="inline-flex items-center gap-1">
                    <Tv className="h-3 w-3" />
                    {pick.episodes} episodes
                  </span>
                )}
                {pick.year && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {pick.year}
                  </span>
                )}
              </div>

              <p className="mb-5 max-w-2xl line-clamp-3 text-sm leading-relaxed text-[#94a3b8]">
                {pick.synopsis || "No synopsis available."}
              </p>

              <div className="mb-5 flex flex-wrap gap-2">
                {pick.genres?.slice(0, 4).map((g) => (
                  <span
                    key={g.mal_id}
                    className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#94a3b8]"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={shuffle}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl btn-neon px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shuffle className="h-4 w-4" />
                )}
                Shuffle Another
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
