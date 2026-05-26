"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}

type ScriptOptions = {
  /** Unique DOM id for the injected script */
  scriptId: string;
  /** External script src */
  src: string;
  /** Monetag zone */
  zone?: string;
  /** data-cfasync */
  cfasync?: "false" | "true";
  /** set additional attributes */
  attributes?: Record<string, string>;
};

type Props = {
  className?: string;
  /** Optional label for debugging */
  label?: string;
  /** Reserve layout to reduce jump */
  minHeight?: number;
  /** Lazy-load only when visible */
  lazy?: boolean;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** Render wrapper without injecting scripts until it becomes visible */
  script: ScriptOptions;
};

/**
 * Shared Monetag slot renderer.
 * - SSR-safe ("use client" + effects only)
 * - Duplicate-safe injection using stable scriptId
 * - Optional lazy-loading via IntersectionObserver
 */
export function MonetagAdSlot({
  className,
  script,
  minHeight = 120,
  lazy = true,
  threshold = 0.15,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldInject, setShouldInject] = useState(!lazy);

  const scriptKey = useMemo(() => script.scriptId, [script.scriptId]);

  useEffect(() => {
    if (!lazy) return;
    if (typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldInject(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [lazy, threshold]);

  useEffect(() => {
    if (!shouldInject) return;
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    // Global duplicate check.
    const existing = document.getElementById(scriptKey) as HTMLScriptElement | null;
    if (existing) return;

    const scriptEl = document.createElement("script");
    scriptEl.id = scriptKey;
    scriptEl.src = script.src;
    scriptEl.async = true;

    if (script.zone) {
      scriptEl.setAttribute("data-zone", script.zone);
    }
    scriptEl.setAttribute("data-cfasync", script.cfasync ?? "false");

    if (script.attributes) {
      for (const [k, v] of Object.entries(script.attributes)) {
        scriptEl.setAttribute(k, v);
      }
    }

    // Vendor expects script near the placement.
    container.appendChild(scriptEl);

    return () => {
      // Keep script if already injected elsewhere; do not aggressively remove.
      if (scriptEl.parentNode === container) {
        // Leave it mounted to avoid breaking the slot after unmount.
      }
    };
  }, [shouldInject, scriptKey, script]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ minHeight }}
    />
  );
}

