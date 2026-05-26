import { Sparkles, Twitter, Instagram, Github } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(124,58,237,0.12)]">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.25)] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] shadow-[0_0_16px_rgba(124,58,237,0.45)]">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-[#f8fafc]">
                Anime
                <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
                  Orbit
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[#94a3b8]">
              The AI-powered anime discovery platform. Built for fans, by fans. Find your next
              obsession in seconds.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.07)] text-[#94a3b8] transition-all duration-200 hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.14)] hover:text-[#f8fafc]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8]/60">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94a3b8]">
              {[
                { label: "Trending", href: "#trending" },
                { label: "Top Rated", href: "#top-rated" },
                { label: "Genres", href: "#genres" },
                { label: "AI Finder", href: "#ai-finder" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors duration-150 hover:text-[#f8fafc]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}

              {/* External domain shortcut */}
              <li>
                <a
                  href="https://luciferdonghua.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-150 hover:text-[#f8fafc]"
                >
                  hi anime
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8]/60">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94a3b8]">
              <li>
                <Link to="/about" className="transition-colors duration-150 hover:text-[#f8fafc]">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors duration-150 hover:text-[#f8fafc]">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors duration-150 hover:text-[#f8fafc]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors duration-150 hover:text-[#f8fafc]">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(124,58,237,0.08)] pt-6 text-xs text-[#94a3b8]/45">
          <span>© {new Date().getFullYear()} AnimeOrbit. Data via Jikan / MyAnimeList.</span>
          <span>Made with ✨ for anime fans</span>
        </div>
      </div>
    </footer>
  );
}

