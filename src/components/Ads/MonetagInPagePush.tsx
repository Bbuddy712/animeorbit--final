"use client";

import React, { useEffect, useMemo, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}

type Props = {
  zone: string;
  idPrefix?: string;
  className?: string;
};

// In-page push ads injected into a reserved container.
// We prevent duplicates using a stable script id.
export function MonetagInPagePush({ zone, idPrefix = "monetag-inpage-push", className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scriptId = useMemo(() => {
    return `${idPrefix}-${zone}`;
  }, [idPrefix, zone]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://nap5k.com/tag.min.js";
    script.async = true;
    script.setAttribute("data-zone", zone);
    script.setAttribute("data-cfasync", "false");

    // Vendor expects script element in DOM near placement.
    container.appendChild(script);

    return () => {
      // Keep script if already injected globally (same id). Otherwise remove.
      if (script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, [scriptId, zone]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      // Reserve layout to reduce jump.
      style={{ minHeight: 120 }}
    />
  );
}

export default MonetagInPagePush;

