import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Search, ListChecks, Menu, X, User, LogOut, Play } from "lucide-react";
import { LocalWatchlistMenu } from "@/components/LocalWatchlistMenu";
import { useAuth } from "@/components/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const NAV_LINKS = [
  { label: "Trending", to: "/trending" },
  { label: "Genres", to: "/", hash: "genres" },
  { label: "AI Finder", to: "/ai-finder" },
  { label: "Reels", to: "/reels" },
] as const;

export function Navbar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [routerState.location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      setListOpen(false);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? "mt-2" : "mt-3"}`}
        >
          <div
            className={`flex items-center justify-between gap-4 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(7,17,32,0.85)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 ${scrolled ? "px-4 py-2.5 md:px-5" : "px-4 py-3 md:px-6"}`}
          >
            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] shadow-[0_0_18px_rgba(124,58,237,0.5)]">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[17px] font-bold tracking-tight text-[#f8fafc]">
                Anime
                <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
                  Orbit
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 text-sm md:flex lg:gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  hash={link.hash}
                  className="group relative py-1 text-[#94a3b8] transition-colors duration-200 hover:text-[#f8fafc]"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <Link
                to="/search"
                search={{ q: "" }}
                className="group relative py-1 text-[#94a3b8] transition-colors duration-200 hover:text-[#f8fafc]"
              >
                Search
                <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/search", search: { q: "" } })}
                className="hidden items-center gap-2 rounded-xl btn-neon px-4 py-2 text-sm font-semibold md:inline-flex"
                aria-label="Search anime"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search</span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="hidden items-center gap-2 rounded-xl btn-neon px-4 py-2 text-sm font-semibold md:inline-flex"
                  title={user.email ?? "Account"}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="hidden items-center gap-2 rounded-xl btn-neon px-4 py-2 text-sm font-semibold md:inline-flex"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign In</span>
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setListOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-xl btn-neon px-4 py-2 text-sm font-semibold"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">My List</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${listOpen ? "rotate-180" : ""}`} />
                </button>
                <LocalWatchlistMenu open={listOpen} onOpenChange={setListOpen} />
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] text-[#94a3b8] transition hover:bg-[rgba(124,58,237,0.15)] hover:text-white md:hidden"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.14 }}
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-[#071120]/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-4 top-[5rem] z-50 md:hidden"
            >
              <div className="overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(7,17,32,0.97)] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                      Navigation
                    </p>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(124,58,237,0.1)] text-[#94a3b8] hover:bg-[rgba(124,58,237,0.2)] hover:text-white transition"
                      aria-label="Close navigation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-1.5">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        hash={link.hash}
                        className="flex items-center rounded-xl border border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.06)] px-4 py-3.5 text-sm font-medium text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/search"
                      search={{ q: "" }}
                      className="flex items-center rounded-xl border border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.06)] px-4 py-3.5 text-sm font-medium text-[#94a3b8] transition hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      Search
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setListOpen(true);
                      setMobileOpen(false);
                    }}
                    className="mt-3 w-full rounded-xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-4 py-3.5 text-sm font-semibold text-[#f8fafc] transition hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white"
                  >
                    My List
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/search", search: { q: "" } });
                      setMobileOpen(false);
                    }}
                    className="mt-3 w-full rounded-xl btn-neon px-4 py-3.5 text-sm font-semibold"
                  >
                    Quick Search
                  </button>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="mt-3 w-full rounded-xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-4 py-3.5 text-sm font-semibold text-[#f8fafc] transition hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthOpen(true);
                        setMobileOpen(false);
                      }}
                      className="mt-3 w-full rounded-xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.08)] px-4 py-3.5 text-sm font-semibold text-[#f8fafc] transition hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
