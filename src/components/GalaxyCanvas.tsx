"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// GALAXY CANVAS
// Extracted from Hero.tsx for better maintainability
// ─────────────────────────────────────────────────────────────────────────────
export function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();
  const reducedRef = useRef(prefersReduced);

  useEffect(() => {
    reducedRef.current = prefersReduced;
  }, [prefersReduced]);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return () => {};

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      canvas.dataset.w = String(w);
      canvas.dataset.h = String(h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };

    // Stars
    const STAR_COUNT = 260;
    interface Star {
      x: number; y: number; r: number; baseOpacity: number;
      twinkleSpeed: number; twinklePhase: number; hue: number;
    }
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: rand(), y: rand(), r: rand() * 1.3 + 0.15,
      baseOpacity: rand() * 0.55 + 0.2,
      twinkleSpeed: rand() * 0.0008 + 0.0003,
      twinklePhase: rand() * Math.PI * 2,
      hue: rand() < 0.15 ? 260 + rand() * 60 : 0,
    }));

    // Particles
    const PARTICLE_COUNT = 55;
    interface Particle {
      x: number; y: number; r: number; opacity: number;
      vx: number; vy: number; ox: number; oy: number;
      oSpeedX: number; oSpeedY: number; oPhaseX: number; oPhaseY: number;
      oAmpX: number; oAmpY: number;
    }
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rand(), y: rand(), r: rand() * 1.8 + 0.6, opacity: rand() * 0.25 + 0.06,
      vx: (rand() - 0.5) * 0.000035, vy: (rand() - 0.5) * 0.000025,
      ox: 0, oy: 0, oSpeedX: rand() * 0.00015 + 0.00005, oSpeedY: rand() * 0.00012 + 0.00004,
      oPhaseX: rand() * Math.PI * 2, oPhaseY: rand() * Math.PI * 2,
      oAmpX: rand() * 0.018 + 0.004, oAmpY: rand() * 0.014 + 0.003,
    }));

    // Nebula
    interface Nebula {
      cx: number; cy: number; rx: number; ry: number; r: number; g: number; b: number;
      baseAlpha: number; breatheSpeed: number; breathePhase: number;
      driftSpeedX: number; driftSpeedY: number; driftPhaseX: number; driftPhaseY: number;
      driftAmpX: number; driftAmpY: number;
    }
    const nebulae: Nebula[] = [
      { cx: 0.55, cy: 0.42, rx: 0.65, ry: 0.38, r: 109, g: 40, b: 217, baseAlpha: 0.055, breatheSpeed: 0.00018, breathePhase: 0, driftSpeedX: 0.00006, driftSpeedY: 0.00004, driftPhaseX: 0, driftPhaseY: 1.2, driftAmpX: 0.04, driftAmpY: 0.025 },
      { cx: 0.28, cy: 0.58, rx: 0.5, ry: 0.3, r: 124, g: 58, b: 237, baseAlpha: 0.045, breatheSpeed: 0.00022, breathePhase: 1.1, driftSpeedX: 0.00007, driftSpeedY: 0.00005, driftPhaseX: 2.1, driftPhaseY: 0.5, driftAmpX: 0.035, driftAmpY: 0.02 },
      { cx: 0.78, cy: 0.24, rx: 0.38, ry: 0.28, r: 168, g: 85, b: 247, baseAlpha: 0.04, breatheSpeed: 0.00025, breathePhase: 2.3, driftSpeedX: 0.00008, driftSpeedY: 0.00006, driftPhaseX: 0.8, driftPhaseY: 3.1, driftAmpX: 0.03, driftAmpY: 0.022 },
      { cx: 0.18, cy: 0.72, rx: 0.32, ry: 0.24, r: 99, g: 102, b: 241, baseAlpha: 0.035, breatheSpeed: 0.0002, breathePhase: 3.5, driftSpeedX: 0.00005, driftSpeedY: 0.00007, driftPhaseX: 1.5, driftPhaseY: 2.4, driftAmpX: 0.025, driftAmpY: 0.03 },
      { cx: 0.88, cy: 0.65, rx: 0.28, ry: 0.22, r: 139, g: 92, b: 246, baseAlpha: 0.03, breatheSpeed: 0.00028, breathePhase: 4.2, driftSpeedX: 0.00009, driftSpeedY: 0.00005, driftPhaseX: 3.3, driftPhaseY: 0.9, driftAmpX: 0.02, driftAmpY: 0.018 },
      { cx: 0.5, cy: 0.12, rx: 0.45, ry: 0.2, r: 79, g: 70, b: 229, baseAlpha: 0.025, breatheSpeed: 0.00015, breathePhase: 5.1, driftSpeedX: 0.00004, driftSpeedY: 0.00003, driftPhaseX: 4.0, driftPhaseY: 1.8, driftAmpX: 0.03, driftAmpY: 0.015 },
    ];

    let animId: number;
    let t = 0;

    const draw = () => {
      const W = Number(canvas.dataset.w) || canvas.offsetWidth;
      const H = Number(canvas.dataset.h) || canvas.offsetHeight;
      const frozen = reducedRef.current;

      ctx.clearRect(0, 0, W, H);

      // Nebula
      for (const n of nebulae) {
        const breathe = frozen ? 1 : 1 + 0.18 * Math.sin(t * n.breatheSpeed + n.breathePhase);
        const dx = frozen ? 0 : n.driftAmpX * Math.sin(t * n.driftSpeedX + n.driftPhaseX);
        const dy = frozen ? 0 : n.driftAmpY * Math.cos(t * n.driftSpeedY + n.driftPhaseY);
        const cx = (n.cx + dx) * W;
        const cy = (n.cy + dy) * H;
        const rx = n.rx * W * breathe;
        const ry = n.ry * H * breathe;

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

      // Particles
      for (const p of particles) {
        if (!frozen) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          if (p.y < -0.02) p.y = 1.02;
          if (p.y > 1.02) p.y = -0.02;
        }
        const ox = frozen ? 0 : p.oAmpX * Math.sin(t * p.oSpeedX + p.oPhaseX);
        const oy = frozen ? 0 : p.oAmpY * Math.cos(t * p.oSpeedY + p.oPhaseY);
        const px = (p.x + ox) * W;
        const py = (p.y + oy) * H;

        const halo = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3.5);
        halo.addColorStop(0, `rgba(180,160,255,${p.opacity})`);
        halo.addColorStop(0.4, `rgba(160,130,255,${(p.opacity * 0.4).toFixed(4)})`);
        halo.addColorStop(1, "rgba(140,100,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${Math.min(p.opacity * 2.2, 0.55).toFixed(4)})`;
        ctx.fill();
      }

      // Stars
      for (const s of stars) {
        const twinkle = frozen ? s.baseOpacity : s.baseOpacity * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed * 1000 + s.twinklePhase));
        const sx = s.x * W;
        const sy = s.y * H;

        if (s.hue > 0) {
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 2.5);
          sg.addColorStop(0, `hsla(${s.hue},80%,85%,${twinkle.toFixed(3)})`);
          sg.addColorStop(1, `hsla(${s.hue},80%,85%,0)`);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.hue > 0 ? `hsla(${s.hue},70%,90%,${twinkle.toFixed(3)})` : `rgba(255,255,255,${twinkle.toFixed(3)})`;
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
  }, []);

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
