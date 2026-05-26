"use client";

import React from "react";
import { useClientMonetagScript } from "@/hooks/ads/useClientMonetagScript";

const PUSH_NOTIFICATION = {
  id: "monetag-push-notification-tag-11058420",
  src: "https://5gvci.com/act/files/tag.min.js?z=11058420",
  attributes: {
    "data-cfasync": "false",
  },
};

const VIGNETTE_BANNER = {
  id: "monetag-vignette-11058422",
  src: "https://n6wxm.com/vignette.min.js",
  attributes: {
    "data-zone": "11058422",
    "data-cfasync": "false",
  },
};

// Injects required Monetag ad formats globally once.
// Mounted at app-root on the client.
export function MonetagGlobalAds() {
  useClientMonetagScript({ ...PUSH_NOTIFICATION });
  useClientMonetagScript({ ...VIGNETTE_BANNER });

  // No SSR markup required.
  return null;
}

