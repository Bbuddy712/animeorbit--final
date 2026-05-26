import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Anime } from "@/lib/jikan";
import { AnimeCard } from "./AnimeCard";
import MonetagBanner from "@/components/Ads/MonetagBanner";

export function AnimeRow({
  id,
  title,
  subtitle,
  items,
  icon,
  loading,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  items: Anime[];
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScrollable(el.scrollWidth > el.clientWidth + 20);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [items.length, loading]);

  useEffect(() => {
    if (!scrollable || loading) return;
    const interval = window.setInterval(() => {
      if (!paused && containerRef.current) {
        const target = containerRef.current.scrollLeft + containerRef.current.clientWidth * 0.72;
        if (target >= containerRef.current.scrollWidth - containerRef.current.clientWidth) {
          containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          containerRef.current.scrollTo({ left: target, behavior: "smooth" });
        }
      }
    }, 5500);
    return () => window.clearInterval(interval);
  }, [paused, scrollable, loading]);

  const scrollBy = (d: number) => containerRef.current?.scrollBy({ left: d, behavior: "smooth" });

  return (
    <section id={id} className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              {icon}
              <h2 className="text-2xl font-bold tracking-tight text-[#f8fafc] sm:text-3xl">
                {title}
              </h2>
            </div>
            {subtitle && <p className="max-w-2xl text-sm text-[#94a3b8]">{subtitle}</p>}
          </div>

          {scrollable && !loading && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-containerRef.current!.clientWidth * 0.65)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.15)] hover:text-white"
                aria-label="Scroll previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(containerRef.current!.clientWidth * 0.65)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.15)] hover:text-white"
                aria-label="Scroll next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </motion.div>

        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#071120] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#071120] to-transparent" />
          <div
            ref={containerRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="-mx-4 overflow-x-auto scroll-smooth px-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          >
            <div className="flex gap-3 pb-4 sm:gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] w-[170px] shrink-0 rounded-xl bg-[#0f172a] animate-shimmer sm:w-[200px]"
                    />
                  ))
                : items.flatMap((a, i) => {
                    const nodes = [<AnimeCard key={a.mal_id} anime={a} index={i} />];

                    if ((i + 1) % 6 === 0 && i !== items.length - 1) {
                      nodes.push(
                        <MonetagBanner key={`monetag-inline-${id ?? title}-${i}`} />
                      );
                    }

                    return nodes;
                  })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
