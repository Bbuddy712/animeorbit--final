import { motion } from "framer-motion";
import { Tv2, ExternalLink } from "lucide-react";

const PROVIDERS = [
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    label: "Official",
    url: (title: string) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
    color: "#F47521",
    initials: "CR",
  },
  {
    id: "netflix",
    name: "Netflix",
    label: "Official",
    url: (title: string) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    color: "#E50914",
    initials: "N",
  },
  {
    id: "animenana",
    name: "AnimeNana",
    label: "Community",
    url: (title: string) => `https://animenana.com/search?keyword=${encodeURIComponent(title)}`,
    color: "#FF1493",
    initials: "AN",
  },
  {
    id: "animepahe",
    name: "AnimePahe",
    label: "Community",
    url: (title: string) => `https://animepahe.pw/anime?q=${encodeURIComponent(title)}`,
    color: "#E94B3C",
    initials: "AP",
  },
  {
    id: "hianime-ph",
    name: "HiAnime PH",
    label: "Community",
    url: (title: string) => `https://hianime.ph/search?keyword=${encodeURIComponent(title)}`,
    color: "#8B5CF6",
    initials: "HA",
  },
  {
    id: "hianime-se",
    name: "HiAnime SE",
    label: "Community",
    url: (title: string) => `https://hianime.se/search?keyword=${encodeURIComponent(title)}`,
    color: "#8B5CF6",
    initials: "HA",
  },
  {
    id: "hianime-lc",
    name: "HiAnime LC",
    label: "Community",
    url: (title: string) => `https://hianime.lc/search?keyword=${encodeURIComponent(title)}`,
    color: "#8B5CF6",
    initials: "HA",
  },
  {
    id: "aniwatch-at",
    name: "AniWatch AT",
    label: "Community",
    url: (title: string) => `https://aniwatch.co.at/search?keyword=${encodeURIComponent(title)}`,
    color: "#00D4FF",
    initials: "AW",
  },
  {
    id: "aniwatch-ro",
    name: "AniWatch RO",
    label: "Community",
    url: (title: string) => `https://aniwatchtv.com.ro/search?keyword=${encodeURIComponent(title)}`,
    color: "#00D4FF",
    initials: "AW",
  },
  {
    id: "aniwatch-jp",
    name: "AniWatch JP",
    label: "Community",
    url: (title: string) => `https://jp-animenities.com/search?keyword=${encodeURIComponent(title)}`,
    color: "#00D4FF",
    initials: "AW",
  },
  {
    id: "9anime",
    name: "9anime",
    label: "Community",
    url: (title: string) => `https://9anime.org.lv/search?keyword=${encodeURIComponent(title)}`,
    color: "#6366F1",
    initials: "9A",
  },
];

export function WhereToWatch({ title }: { title: string }) {
  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 section-badge">
            <Tv2 className="h-3 w-3" />
            Where to watch
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#f8fafc] sm:text-3xl">
            Streaming sites
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-[#94a3b8]">
            Click any provider below to open the search page directly in a new tab.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map((provider, index) => (
          <motion.a
            key={provider.id}
            href={provider.url(title)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900/95"
            style={{ backdropFilter: "blur(22px)" }}
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent opacity-100" aria-hidden />

            <div className="relative z-10 flex items-start gap-3.5">
              <div
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
                style={{ background: provider.color, width: "3.25rem", height: "3.25rem" }}
              >
                {provider.initials}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="truncate text-[15px] font-semibold text-[#f8fafc]">
                    {provider.name}
                  </p>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                    {provider.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#94a3b8]/60">
                  Search page will open in a new tab.
                </p>
              </div>
            </div>

            <div className="flex-1" />

            <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#111827]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#c7d2fe]">
                Search
              </span>
              <ExternalLink className="h-4 w-4 text-[#94a3b8] transition-colors duration-200 group-hover:text-[#a855f7]" />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-[rgba(124,58,237,0.1)] bg-[rgba(124,58,237,0.04)] p-4 text-sm text-[#94a3b8]/60">
        Direct links only. No auto-detection or provider scanning. Click any item to search the anime title on that streaming site.
      </div>
    </section>
  );
}
