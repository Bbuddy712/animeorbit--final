"use client";

import React from "react";
import { MonetagAdSlot } from "@/components/Ads/monetag/MonetagAdSlot";

const PUSH_SRC = "https://nap5k.com/tag.min.js";

type Props = {
  /** Use a push zone that your Monetag account supports for mobile sticky/placement */
  zone: string;
};

export function MobileStickyAd({ zone }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto w-full border-t border-[rgba(124,58,237,0.18)] bg-[#070f20]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 py-2">
          <MonetagAdSlot
            lazy={false}
            minHeight={70}
            className="w-full"
            label={`Mobile sticky ${zone}`}
            script={{
              scriptId: `monetag-mobile-sticky-${zone}`,
              src: PUSH_SRC,
              zone,
              cfasync: "false",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MobileStickyAd;

