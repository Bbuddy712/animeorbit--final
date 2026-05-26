import { motion } from "framer-motion";
import { MonitorPlay, PanelsTopLeft, RectangleHorizontal, Sparkles } from "lucide-react";

type AdVariant = "banner" | "native" | "sidebar" | "sticky";

function getVariantMeta(variant: AdVariant) {
  switch (variant) {
    case "banner":
      return {
        icon: <PanelsTopLeft className="h-5 w-5 text-[#a855f7]" />,
        wrapperClassName: "",
        panelClassName: "min-h-[150px] rounded-[32px] p-6 sm:min-h-[180px] sm:p-8",
        title: "Homepage Banner Ad",
        description: "Responsive hero-ad placeholder for future Monetag or Adsterra banner scripts.",
      };
    case "native":
      return {
        icon: <RectangleHorizontal className="h-5 w-5 text-[#a855f7]" />,
        wrapperClassName: "w-[160px] shrink-0 sm:w-[190px] md:w-[200px]",
        panelClassName: "min-h-[290px] rounded-2xl p-4",
        title: "Native Ad Slot",
        description: "Inline native placement inserted into anime rows after every 6 cards.",
      };
    case "sidebar":
      return {
        icon: <MonitorPlay className="h-5 w-5 text-[#a855f7]" />,
        wrapperClassName: "w-full",
        panelClassName: "min-h-[420px] rounded-[28px] p-5",
        title: "Sidebar Ad Slot",
        description: "Desktop-only sidebar container for future anime-page ad scripts.",
      };
    case "sticky":
      return {
        icon: <Sparkles className="h-5 w-5 text-[#a855f7]" />,
        wrapperClassName: "w-full",
        panelClassName: "min-h-[88px] rounded-2xl px-4 py-3",
        title: "Sticky Footer Ad",
        description: "Mobile footer placement reserved for responsive ad scripts.",
      };
  }
}

export function AdPlaceholder({
  variant,
  slot,
  className = "",
}: {
  variant: AdVariant;
  slot: string;
  className?: string;
}) {
  const meta = getVariantMeta(variant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className={`${meta.wrapperClassName} ${className}`.trim()}
    >
      <div
        className={`group relative overflow-hidden border border-[rgba(124,58,237,0.18)] bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(7,17,32,0.96))] shadow-[0_12px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl ${meta.panelClassName}`}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/80 to-transparent" />
        <div className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-[#7c3aed]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 h-28 w-28 rounded-full bg-[#a855f7]/12 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(168,85,247,0.24)] bg-[rgba(124,58,237,0.12)] shadow-[0_0_20px_-12px_rgba(168,85,247,0.9)]">
              {meta.icon}
            </span>
            <span className="rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4b5fd]">
              Ad Space
            </span>
          </div>

          <div className="mt-5 flex-1">
            <h3 className="text-base font-semibold text-[#f8fafc]">{meta.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{meta.description}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-[rgba(168,85,247,0.28)] bg-[rgba(124,58,237,0.06)] p-3">
            <div
              data-ad-slot={slot}
              data-ad-variant={variant}
              className="flex min-h-[56px] items-center justify-center rounded-xl bg-[rgba(7,17,32,0.65)] px-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#cbd5e1]/70"
            >
              Future Monetag / Adsterra script: {slot}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MobileStickyFooterAd() {
  return (
    <>
      <div className="h-28 md:hidden" aria-hidden="true" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-7xl">
          <AdPlaceholder variant="sticky" slot="mobile-footer-sticky" />
        </div>
      </div>
    </>
  );
}
