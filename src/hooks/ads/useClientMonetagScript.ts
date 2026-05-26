"use client";

import { useEffect, useMemo } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}

type ScriptOptions = {
  id: string;
  src: string;
  async?: boolean;
  attributes?: Record<string, string>;
};

// Client-safe singleton script injector.
// - Prevents duplicate injection by document.getElementById(id)
// - Only runs in browser ("use client" + effect)
// - Does not attempt to remove global scripts on unmount
export function useClientMonetagScript({ id, src, async = true, attributes }: ScriptOptions) {
  const stableOptions = useMemo(() => ({ id, src, async, attributes }), [id, src, async, attributes]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.getElementById(stableOptions.id) as HTMLScriptElement | null;
    if (existing) return;

    const script = document.createElement("script");
    script.id = stableOptions.id;
    script.src = stableOptions.src;
    script.async = stableOptions.async;

    if (stableOptions.attributes) {
      for (const [k, v] of Object.entries(stableOptions.attributes)) {
        script.setAttribute(k, v);
      }
    }

    document.head.appendChild(script);

    return () => {
      // Do not remove to avoid breaking other slots/routes.
      // Monetag/vignette scripts are expected to persist.
    };
  }, [stableOptions]);
}

