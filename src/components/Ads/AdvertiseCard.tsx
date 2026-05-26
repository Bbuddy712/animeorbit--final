"use client";

import React from "react";

export function AdvertiseCard() {
  const email = "ds2629812@gmail.com";
  return (
    <section className="mt-10 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(10,16,32,0.55)] p-6 shadow-[0_0_60px_rgba(124,58,237,0.10)] backdrop-blur-md">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-[#f8fafc]">Advertise With Us</h2>
        <p className="text-sm text-[#94a3b8]">
          Want your anime-related product featured on AnimeOrbit?
        </p>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.14)] px-4 py-2.5 text-sm font-semibold text-[#f8fafc] backdrop-blur-md transition-all hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.22)]"
        >
          <span className="text-[#a855f7]">✉</span>
          {email}
        </a>
      </div>
    </section>
  );
}

export default AdvertiseCard;

