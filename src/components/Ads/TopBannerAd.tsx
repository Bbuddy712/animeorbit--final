"use client";

import React from "react";
import { MonetagAdSlot } from "@/components/Ads/monetag/MonetagAdSlot";

// Existing banner integration in this repo uses:
// - src: https://quge5.com/88/tag.min.js
// - zone: 243057
const SCRIPT_SRC = "https://quge5.com/88/tag.min.js";
const ZONE = "243057";

export function TopBannerAd() {
  return (
    <section className="rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(10,16,32,0.55)] p-3 shadow-[0_0_60px_rgba(124,58,237,0.12)] backdrop-blur-md">
      <div className="mx-auto flex items-center justify-center">
        <MonetagAdSlot
          lazy
          minHeight={92}
          className="w-full"
          label="Top leaderboard"
          script={{
            scriptId: "monetag-top-banner-243057",
            src: SCRIPT_SRC,
            zone: ZONE,
            cfasync: "false",
          }}
        />
      </div>
    </section>
  );
}

export default TopBannerAd;

