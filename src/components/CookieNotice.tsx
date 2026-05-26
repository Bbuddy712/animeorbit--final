import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "animeorbit.cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-lg overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[#0d1526]/95 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:left-auto sm:right-6 sm:bottom-6"
        >
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#a855f7]" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-[#94a3b8]">
                  We use cookies and local storage to enhance your experience. By continuing to use
                  AnimeOrbit, you agree to our{" "}
                  <Link
                    to="/privacy"
                    className="text-[#a855f7] underline decoration-[#a855f7]/30 hover:decoration-[#a855f7]"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/terms"
                    className="text-[#a855f7] underline decoration-[#a855f7]/30 hover:decoration-[#a855f7]"
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={accept}
                    className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-4 py-1.5 text-xs font-semibold text-white transition-shadow hover:shadow-[0_0_16px_rgba(124,58,237,0.4)]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-lg border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.08)] px-4 py-1.5 text-xs font-medium text-[#94a3b8] transition hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 text-[#94a3b8]/50 transition hover:text-[#94a3b8]"
                aria-label="Close cookie notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
