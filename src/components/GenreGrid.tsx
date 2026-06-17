import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  Swords,
  Heart,
  Ghost,
  Laugh,
  Sparkles,
  Wand2,
  Brain,
  Coffee,
  Skull,
  Rocket,
} from "lucide-react";

const GENRES = [
  { name: "Action", icon: Swords, bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.28)" },
  { name: "Romance", icon: Heart, bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)" },
  { name: "Horror", icon: Ghost, bg: "rgba(30,41,59,0.6)", border: "rgba(71,85,105,0.35)" },
  { name: "Comedy", icon: Laugh, bg: "rgba(180,120,0,0.12)", border: "rgba(200,140,0,0.22)" },
  { name: "Fantasy", icon: Sparkles, bg: "rgba(109,40,217,0.18)", border: "rgba(139,92,246,0.3)" },
  { name: "Isekai", icon: Wand2, bg: "rgba(37,99,235,0.12)", border: "rgba(59,130,246,0.25)" },
  { name: "Psychological", icon: Brain, bg: "rgba(5,150,105,0.12)", border: "rgba(16,185,129,0.22)" },
  { name: "Slice of Life", icon: Coffee, bg: "rgba(161,98,7,0.12)", border: "rgba(202,138,4,0.22)" },
  { name: "Thriller", icon: Skull, bg: "rgba(51,65,85,0.5)", border: "rgba(100,116,139,0.3)" },
  { name: "Sci-Fi", icon: Rocket, bg: "rgba(14,116,144,0.12)", border: "rgba(6,182,212,0.25)" },
];

export function GenreGrid() {
  const navigate = useNavigate();

  return (
    <section id="genres" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-[#f8fafc] sm:text-5xl">
            Explore{" "}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              Every Genre
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-[#94a3b8]">
            From heart-pounding action to slow-burn romance — find your vibe.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
          {GENRES.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.button
                key={g.name}
                type="button"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 120, damping: 18 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate({ to: "/search", search: { q: g.name } })}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[#0f172a] shadow-sm transition-all duration-300 hover:shadow-xl"
                style={{
                  borderColor: g.border,
                  background: `linear-gradient(135deg, #0f172a 0%, ${g.bg} 100%)`,
                }}
              >
                {/* Subtle purple glow on hover */}
                <div className="absolute inset-0 bg-[rgba(124,58,237,0)] transition-all duration-300 group-hover:bg-[rgba(124,58,237,0.08)]" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="rounded-full bg-white/5 p-3 transition-all duration-300 group-hover:bg-white/10">
                    <Icon className="h-7 w-7 text-[#94a3b8] transition-all duration-300 group-hover:scale-110 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-[#94a3b8] transition-colors group-hover:text-white">
                    {g.name}
                  </span>
                </div>

                {/* Enhanced bottom accent line */}
                <div className="absolute inset-x-0 bottom-0 h-[3px] scale-x-0 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed] transition-transform duration-300 group-hover:scale-x-100" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
