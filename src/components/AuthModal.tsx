import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X, Mail, Lock, LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";

export function AuthModal({
  open,
  onClose,
  defaultMode = "signin",
}: {
  open: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === "signup" ? await signUp(email, password) : await signIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success(
      mode === "signup" ? "Account created! Check your email to confirm." : "Welcome back!"
    );
    setEmail("");
    setPassword("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#071120]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[#0d1526] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#f8fafc]">
                    {mode === "signup" ? "Create Account" : "Welcome Back"}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(124,58,237,0.1)] text-[#94a3b8] transition hover:bg-[rgba(124,58,237,0.2)] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-sm text-[#94a3b8]">
                  {mode === "signup"
                    ? "Sign up to save your favorites and watchlist across devices."
                    : "Sign in to access your saved favorites and watchlist."}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="auth-email" className="block text-sm font-medium text-[#94a3b8]">
                      Email
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]/50" />
                      <input
                        id="auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.06)] py-3 pl-10 pr-4 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-medium text-[#94a3b8]"
                    >
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]/50" />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.06)] py-3 pl-10 pr-4 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === "signup" ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-[#94a3b8]">
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin");
                          setError(null);
                        }}
                        className="font-medium text-[#a855f7] hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setError(null);
                        }}
                        className="font-medium text-[#a855f7] hover:underline"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
