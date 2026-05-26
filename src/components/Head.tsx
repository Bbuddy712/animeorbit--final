import React from "react";

/**
 * Root-level head content.
 *
 * Kept intentionally minimal and SSR-safe.
 */
export function HeadContent() {
  // Using plain elements so SSR works without any client-only side effects.
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}

/**
 * Root-level scripts.
 *
 * Must be SSR-compatible; any client-side script should be gated inside this component
 * (or removed entirely). For now, we keep it empty.
 */
export function Scripts() {
  return null;
}

