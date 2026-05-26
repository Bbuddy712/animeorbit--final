import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Star,
  Plus,
  Heart,
  Clock,
  Zap,
  Sparkles,
  ChevronRight,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { BeginnerPreferences } from "@/lib/beginner.functions";
import { generateBeginnerPack } from "@/lib/beginner.functions";
import { Button } from "@/components/ui/button";

interface BeginnerPackCard {
  pack: string;
  title: string;
  description: string;
  recommendations: Array<{
    query: string;
    title: string;
    why: string;
    tags: string[];
  }>;
}

const PACK_ICONS: Record<string, string> = {
  action: "⚡",
  dark_thriller: "🌑",
  emotional: "💭",
  comedy: "😂",
  romance: "💕",
  fantasy: "🗡️",
  mind_games: "🧩",
  donghua: "🐉",
};

const PACK_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  action: { bg: "from-red-500/10", border: "border-red-500/30", glow: "hover:shadow-red-500/20" },
  dark_thriller: {
    bg: "from-slate-700/10",
    border: "border-slate-600/30",
    glow: "hover:shadow-slate-600/20",
  },
  emotional: {
    bg: "from-pink-500/10",
    border: "border-pink-500/30",
    glow: "hover:shadow-pink-500/20",
  },
  comedy: {
    bg: "from-yellow-500/10",
    border: "border-yellow-500/30",
    glow: "hover:shadow-yellow-500/20",
  },
  romance: {
    bg: "from-rose-500/10",
    border: "border-rose-500/30",
    glow: "hover:shadow-rose-500/20",
  },
  fantasy: {
    bg: "from-purple-500/10",
    border: "border-purple-500/30",
    glow: "hover:shadow-purple-500/20",
  },
  mind_games: {
    bg: "from-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "hover:shadow-cyan-500/20",
  },
  donghua: {
    bg: "from-orange-500/10",
    border: "border-orange-500/30",
    glow: "hover:shadow-orange-500/20",
  },
};

export function StarterPackView({
  preferences,
  onClose,
}: {
  preferences: BeginnerPreferences;
  onClose: () => void;
}) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const generatePackFn = useServerFn(generateBeginnerPack);

  const packIds = [
    "action",
    "dark_thriller",
    "emotional",
    "comedy",
    "romance",
    "fantasy",
    "mind_games",
    "donghua",
  ];

  const { data: packs = {}, isLoading } = useQuery({
    queryKey: ["beginner-packs", preferences],
    queryFn: async () => {
      const results: Record<string, BeginnerPackCard> = {};
      for (const packId of packIds) {
        try {
          const pack = await generatePackFn({
            data: { packType: packId, preferences },
          });
          results[packId] = pack;
        } catch (e) {
          console.error(`Failed to generate ${packId} pack:`, e);
        }
      }
      return results;
    },
    staleTime: 60 * 60 * 1000,
  });

  const selectedPackData = selectedPack ? packs[selectedPack] : null;
  const colors = selectedPack ? PACK_COLORS[selectedPack] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-5xl rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl my-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Your Starter Packs</h2>
              <p className="mt-1 text-sm text-slate-400">
                Pick a category to see beginner-friendly recommendations
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {!selectedPackData ? (
          <div className="space-y-6">
            {/* Grid of packs */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {packIds.map((packId) => {
                const pack = packs[packId];
                const color = PACK_COLORS[packId];
                const icon = PACK_ICONS[packId];

                return (
                  <motion.button
                    key={packId}
                    onClick={() => setSelectedPack(packId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative overflow-hidden rounded-2xl border-2 ${color.border} bg-gradient-to-br ${color.bg} p-4 text-left transition-all duration-300 hover:shadow-lg ${color.glow}`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition" />

                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{icon}</div>
                      <h3 className="font-bold text-white text-sm leading-tight">
                        {pack?.title || packId.replace(/_/g, " ").toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {pack?.description || "Loading..."}
                      </p>

                      {pack?.recommendations && (
                        <div className="mt-3 text-xs text-slate-500">
                          {pack.recommendations.length} anime
                        </div>
                      )}
                    </div>

                    <ChevronRight className="absolute top-2 right-2 h-4 w-4 text-slate-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </motion.button>
                );
              })}
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                  Generating your packs...
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Pack detail view */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Back button + title */}
            <button
              onClick={() => setSelectedPack(null)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
            >
              ← Back to packs
            </button>

            <div>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selectedPack ? PACK_ICONS[selectedPack] : ""}</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedPackData.title}</h2>
                  <p className="mt-1 text-slate-400">{selectedPackData.description}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              {selectedPackData.recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.query}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-5 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                          <Sparkles className="h-3 w-3" />
                          Perfect Start
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{rec.why}</p>

                      <div className="flex flex-wrap gap-2">
                        {rec.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.success("Added to Watch Later!")}
                        className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 p-3 text-white hover:from-violet-700 hover:to-purple-700 transition flex items-center justify-center"
                        title="Add to Watch Later"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.success("Added to Favorites!")}
                        className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-300 hover:border-white/20 hover:text-white transition flex items-center justify-center"
                        title="Add to Favorites"
                      >
                        <Heart className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedPack(null)} className="flex-1">
                View Other Packs
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                Start with {selectedPackData.recommendations[0]?.title}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
