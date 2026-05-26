"use client";

import React from "react";
import { MonetagAdSlot } from "@/components/Ads/monetag/MonetagAdSlot";

const SCRIPT_SRC = "https://quge5.com/88/tag.min.js";
const ZONE = "243057";

export function SidebarAd() {
  return (
    <section className="rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(10,16,32,0.55)] p-3 shadow-[0_0_60px_rgba(124,58,237,0.10)] backdrop-blur-md">
      <MonetagAdSlot
        lazy
        minHeight={160}
        className="w-full"
        label="Sidebar ad"
        script={{
          scriptId: "monetag-sidebar-banner-243057",
          src: SCRIPT_SRC,
          zone: ZONE,
          cfasync: "false",
        }}
      />
    </section>
  );
}

export default SidebarAd;

