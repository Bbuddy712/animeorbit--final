"use client";

import React from "react";
import { MonetagAdSlot } from "@/components/Ads/monetag/MonetagAdSlot";

// Existing in-page push uses:
// - src: https://nap5k.com/tag.min.js
// - zone: per placement
const PUSH_SRC = "https://nap5k.com/tag.min.js";

type Props = {
  zone: string;
  className?: string;
  minHeight?: number;
};

export function InlineAd({ zone, className, minHeight = 120 }: Props) {
  return (
    <section
      className={
        className ??
        "mt-6 rounded-2xl border border-[rgba(124,58,237,0.14)] bg-[rgba(10,16,32,0.35)] p-3 backdrop-blur-md"
      }
    >
      <MonetagAdSlot
        lazy
        minHeight={minHeight}
        className="w-full"
        label={`Inline push ${zone}`}
        script={{
          scriptId: `monetag-inline-push-${zone}`,
          src: PUSH_SRC,
          zone,
          cfasync: "false",
        }}
      />
    </section>
  );
}

export default InlineAd;

