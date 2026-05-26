"use client";

import React, { useEffect, useMemo, useRef } from "react";

declare global {
  interface Window {
    // Monetag script may attach globals; keep as unknown.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}

const SCRIPT_SRC = "https://quge5.com/88/tag.min.js";
const ZONE = "243057";
const SCRIPT_UNIQUE_ID = "monetag-tag.min.js-243057";

function getOrCreateScriptId() {
  return SCRIPT_UNIQUE_ID;
}

export default function MonetagBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scriptId = useMemo(() => getOrCreateScriptId(), []);

  useEffect(() => {
    // Client-side only
    const container = containerRef.current;
    if (!container) return;

    // Ensure we don't inject duplicate scripts.
    // If an existing script exists globally, do not inject again.
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-zone", ZONE);
    script.setAttribute("data-cfasync", "false");

    container.appendChild(script);

    return () => {
      // Cleanup only what we appended.
      // If another instance already injected and our ID exists, keep it.
      if (script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, [scriptId]);

  // SSR-safe: render a stable empty container.
  // The Monetag script will fill it on the client.
  return <div ref={containerRef} aria-hidden="true" />;
}

