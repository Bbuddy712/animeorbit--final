import { motion, useReducedMotion } from "framer-motion";
import { Search, Play, Compass, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Anime } from "@/lib/jikan";

// ─────────────────────────────────────────────────────────────────────────────
// GALAXY CANVAS
// Renders three independent layers on a single <canvas>:
//   1. Stars      — 260 points, individual twinkle via sin wave
//   2. Particles  — 55 slow-drifting dust motes with soft glow
//   3. Nebula fog — 6 large radial blobs that breathe and drift slowly
//
// All animation is driven by a single rAF loop.
// Respects prefers-reduced-motion: freezes all motion, keeps visuals static.
// ─────────────────────────────────────────────────────────────────────────────
function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();
  // Store reduced preference in a ref so the rAF closure always reads latest
  const reducedRef = useRef(prefersReduced);
  useEffect(() => {
    reducedRef.current = prefersReduced;
  }, [prefersReduced]);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return () => {};

    // ── Resize helper ──────────────────────────────────────────────────────
    const resize = () => {
      // Use device pixel ratio for crisp rendering on retina screens
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      // Store logical size for drawing
      canvas.dataset.w = String(w);
      canvas.dataset.h = String(h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Seeded random (deterministic layout) ──────────────────────────────
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };

    // ── Layer 1: Stars ─────────────────────────────────────────────────────
    const STAR_COUNT = 260;
    interface Star {
      x: number;
      y: number;
      r: number;
      baseOpacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
      // colour: mostly white, occasional blue-violet tint
      hue: number;
    }
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: rand(),
      y: rand(),
      r: rand() * 1.3 + 0.15,
      baseOpacity: rand() * 0.55 + 0.2,
      twinkleSpeed: rand() * 0.0008 + 0.0003,
      twinklePhase: rand() * Math.PI * 2,
      hue: rand() < 0.15 ? 260 + rand() * 60 : 0, // 15% purple-tinted
    }));

    // ── Layer 2: Drifting particles ────────────────────────────────────────
    const PARTICLE_COUNT = 55;
    interface Particle {
      x: number;
      y: number;
      r: number;
      opacity: number;
      vx: number;
      vy: number;
      // oscillation
      ox: number;
      oy: number;
      oSpeedX: number;
      oSpeedY: number;
      oPhaseX: number;
      oPhaseY: number;
      oAmpX: number;
      oAmpY: number;
    }
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rand(),
      y: rand(),
      r: rand() * 1.8 + 0.6,
      opacity: rand() * 0.25 + 0.06,
      vx: (rand() - 0.5) * 0.000035,
      vy: (rand() - 0.5) * 0.000025,
      ox: 0,
      oy: 0,
      oSpeedX: rand() * 0.00015 + 0.00005,
      oSpeedY: rand() * 0.00012 + 0.00004,
      oPhaseX: rand() * Math.PI * 2,
      oPhaseY: rand() * Math.PI * 2,
      oAmpX: rand() * 0.018 + 0.004,
      oAmpY: rand() * 0.014 + 0.003,
    }));

    // ── Layer 3: Nebula fog blobs ──────────────────────────────────────────
    interface Nebula {
      cx: number;
      cy: number; // base centre (0-1)
      rx: number;
      ry: number; // base radius (0-1)
      r: number;
      g: number;
      b: number; // colour
      baseAlpha: number;
      breatheSpeed: number;
      breathePhase: number;
      driftSpeedX: number;
      driftSpeedY: number;
      driftPhaseX: number;
      driftPhaseY: number;
      driftAmpX: number;
      driftAmpY: number;
    }
    const nebulae: Nebula[] = [
      // Milky way core — large central band
      {
        cx: 0.55,
        cy: 0.42,
        rx: 0.65,
        ry: 0.38,
        r: 109,
        g: 40,
        b: 217,
        baseAlpha: 0.055,
        breatheSpeed: 0.00018,
        breathePhase: 0,
        driftSpeedX: 0.00006,
        driftSpeedY: 0.00004,
        driftPhaseX: 0,
        driftPhaseY: 1.2,
        driftAmpX: 0.04,
        driftAmpY: 0.025,
      },
      // Left arm
      {
        cx: 0.28,
        cy: 0.58,
        rx: 0.5,
        ry: 0.3,
        r: 124,
        g: 58,
        b: 237,
        baseAlpha: 0.045,
        breatheSpeed: 0.00022,
        breathePhase: 1.1,
        driftSpeedX: 0.00007,
        driftSpeedY: 0.00005,
        driftPhaseX: 2.1,
        driftPhaseY: 0.5,
        driftAmpX: 0.035,
        driftAmpY: 0.02,
      },
      // Upper right violet cloud
      {
        cx: 0.78,
        cy: 0.24,
        rx: 0.38,
        ry: 0.28,
        r: 168,
        g: 85,
        b: 247,
        baseAlpha: 0.04,
        breatheSpeed: 0.00025,
        breathePhase: 2.3,
        driftSpeedX: 0.00008,
        driftSpeedY: 0.00006,
        driftPhaseX: 0.8,
        driftPhaseY: 3.1,
        driftAmpX: 0.03,
        driftAmpY: 0.022,
      },
      // Lower left indigo
      {
        cx: 0.18,
        cy: 0.72,
        rx: 0.32,
        ry: 0.24,
        r: 99,
        g: 102,
        b: 241,
        baseAlpha: 0.035,
        breatheSpeed: 0.0002,
        breathePhase: 3.5,
        driftSpeedX: 0.00005,
        driftSpeedY: 0.00007,
        driftPhaseX: 1.5,
        driftPhaseY: 2.4,
        driftAmpX: 0.025,
        driftAmpY: 0.03,
      },
      // Far right deep purple
      {
        cx: 0.88,
        cy: 0.65,
        rx: 0.28,
        ry: 0.22,
        r: 139,
        g: 92,
        b: 246,
        baseAlpha: 0.03,
        breatheSpeed: 0.00028,
        breathePhase: 4.2,
        driftSpeedX: 0.00009,
        driftSpeedY: 0.00005,
        driftPhaseX: 3.3,
        driftPhaseY: 0.9,
        driftAmpX: 0.02,
        driftAmpY: 0.018,
      },
      // Top centre faint blue
      {
        cx: 0.5,
        cy: 0.12,
        rx: 0.45,
        ry: 0.2,
        r: 79,
        g: 70,
        b: 229,
        baseAlpha: 0.025,
        breatheSpeed: 0.00015,
        breathePhase: 5.1,
        driftSpeedX: 0.00004,
        driftSpeedY: 0.00003,
        driftPhaseX: 4.0,
        driftPhaseY: 1.8,
        driftAmpX: 0.03,
        driftAmpY: 0.015,
      },
    ];

    // ── Draw loop ──────────────────────────────────────────────────────────
    let animId: number;
    let t = 0;

    const draw = () => {
      const W = Number(canvas.dataset.w) || canvas.offsetWidth;
      const H = Number(canvas.dataset.h) || canvas.offsetHeight;
      const frozen = reducedRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Nebula fog ──────────────────────────────────────────────────────
      for (const n of nebulae) {
        const breathe = frozen ? 1 : 1 + 0.18 * Math.sin(t * n.breatheSpeed + n.breathePhase);
        const dx = frozen ? 0 : n.driftAmpX * Math.sin(t * n.driftSpeedX + n.driftPhaseX);
        const dy = frozen ? 0 : n.driftAmpY * Math.cos(t * n.driftSpeedY + n.driftPhaseY);

        const cx = (n.cx + dx) * W;
        const cy = (n.cy + dy) * H;
        const rx = n.rx * W * breathe;
        const ry = n.ry * H * breathe;

        // Elliptical radial gradient — save/restore for transform
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, ry / rx);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${(n.baseAlpha * breathe).toFixed(4)})`);
        grad.addColorStop(0.4, `rgba(${n.r},${n.g},${n.b},${(n.baseAlpha * 0.5).toFixed(4)})`);
        grad.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Drifting particles ──────────────────────────────────────────────
      for (const p of particles) {
        if (!frozen) {
          p.x += p.vx;
          p.y += p.vy;
          // Wrap around edges
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          if (p.y < -0.02) p.y = 1.02;
          if (p.y > 1.02) p.y = -0.02;
        }

        const ox = frozen ? 0 : p.oAmpX * Math.sin(t * p.oSpeedX + p.oPhaseX);
        const oy = frozen ? 0 : p.oAmpY * Math.cos(t * p.oSpeedY + p.oPhaseY);
        const px = (p.x + ox) * W;
        const py = (p.y + oy) * H;

        // Soft glow: outer halo + bright core
        const halo = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3.5);
        halo.addColorStop(0, `rgba(180,160,255,${p.opacity})`);
        halo.addColorStop(0.4, `rgba(160,130,255,${(p.opacity * 0.4).toFixed(4)})`);
        halo.addColorStop(1, "rgba(140,100,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core dot
        ctx.beginPath();
        ctx.arc(px, py, p.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${Math.min(p.opacity * 2.2, 0.55).toFixed(4)})`;
        ctx.fill();
      }

      // ── Stars ───────────────────────────────────────────────────────────
      for (const s of stars) {
        const twinkle = frozen
          ? s.baseOpacity
          : s.baseOpacity * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed * 1000 + s.twinklePhase));

        const sx = s.x * W;
        const sy = s.y * H;

        if (s.hue > 0) {
          // Coloured star — tiny radial glow
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 2.5);
          sg.addColorStop(0, `hsla(${s.hue},80%,85%,${twinkle.toFixed(3)})`);
          sg.addColorStop(1, `hsla(${s.hue},80%,85%,0)`);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle =
          s.hue > 0
            ? `hsla(${s.hue},70%,90%,${twinkle.toFixed(3)})`
            : `rgba(255,255,255,${twinkle.toFixed(3)})`;
        ctx.fill();
      }

      t += 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []); // setup never changes — stable ref

  useEffect(() => {
    const cleanup = setup();
    return cleanup;
  }, [setup]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    />
  );
}

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
      "recommend",
      "suggest",
      "what to watch",
      "best anime",
      "similar to",
      "show me",
      "like",
      "for fans of",
      "need an anime",
      "should i watch",
      "anime for",
      "good anime",
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
      {/* ── Static base: deep space gradient ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_200%_110%_at_50%_-15%,#0c1d38_0%,#030b18_55%)]" />

      {/* ── Animated galaxy canvas (stars + particles + nebula) ── */}
      <GalaxyCanvas />

      {/* ── Anime slide — ghost texture, barely visible ── */}
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

      {/* ── CSS-animated nebula orbs (complement the canvas) ── */}
      {/* These are large, very blurred divs — GPU composited, zero JS cost */}
      <div
        className="pointer-events-none absolute left-[5%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/[0.055] blur-[120px]"
        style={{ animation: "hero-orb-a 18s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#a855f7]/[0.045] blur-[110px]"
        style={{ animation: "hero-orb-b 22s ease-in-out infinite", animationDelay: "4s" }}
      />
      <div
        className="pointer-events-none absolute bottom-[15%] left-[22%] h-[380px] w-[380px] rounded-full bg-[#6d28d9]/[0.05] blur-[100px]"
        style={{ animation: "hero-orb-c 26s ease-in-out infinite", animationDelay: "8s" }}
      />
      <div
        className="pointer-events-none absolute bottom-[22%] right-[12%] h-[320px] w-[320px] rounded-full bg-[#4f46e5]/[0.04] blur-[90px]"
        style={{ animation: "hero-orb-a 30s ease-in-out infinite", animationDelay: "2s" }}
      />

      {/* ── Vignette overlay ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_110%_at_50%_50%,transparent_35%,rgba(3,11,24,0.6)_100%)]" />

      {/* ── Bottom page-blend fade ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#071120] via-[#071120]/55 to-transparent" />

      {/* ── Purple top accent ── */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-80" />

      {/* ── CONTENT — perfectly centered ── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.12)] px-5 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#a855f7] animate-glow-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a855f7]">
              AI-Powered Discovery
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 text-5xl font-black leading-[1.0] tracking-[-0.03em] text-[#f8fafc] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Your Next Anime
            <br />
            <span className="mt-1 block bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              Starts Here.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.7 }}
            className="mb-10 max-w-xl text-base leading-relaxed text-[#94a3b8] sm:text-lg"
          >
            Premium anime discovery powered by AI. Curated watchlists, live recommendations, and
            cinematic browsing — all in one place.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56, duration: 0.6 }}
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
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime, characters, studios..."
                className="flex-1 bg-transparent text-sm text-[#f8fafc] outline-none placeholder:text-[#94a3b8]/55"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl btn-neon px-5 py-2.5 text-sm font-semibold"
            >
              Search
            </button>
          </motion.form>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#trending"
              className="inline-flex items-center gap-2.5 rounded-xl btn-neon px-7 py-3.5 text-sm font-semibold"
            >
              <Play className="h-4 w-4 fill-white" />
              Start Watching
            </a>
            <a
              href="#genres"
              className="inline-flex items-center gap-2.5 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] px-7 py-3.5 text-sm font-semibold text-[#f8fafc] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.18)]"
            >
              <Compass className="h-4 w-4" />
              Explore Genres
            </a>
          </motion.div>

          {/* Slide dots + now featuring */}
          {active && (
            <motion.div
              key={active.mal_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-14 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2">
                {slides.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`rounded-full transition-all duration-500 ${
                      i === idx
                        ? "h-1.5 w-8 bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]"
                        : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="rounded-full border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.07)] px-3 py-1 uppercase tracking-[0.22em] text-[#94a3b8]/80">
                  Now Featuring
                </span>
                <span className="max-w-[240px] truncate text-[#94a3b8]/70">
                  {active.title_english || active.title}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
