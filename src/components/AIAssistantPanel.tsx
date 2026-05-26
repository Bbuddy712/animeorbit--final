import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, X, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { AIProvider, ChatMessage } from "@/lib/chat.functions";
import { chatWithAI, getAISuggestions } from "@/lib/chat.functions";

const SUGGESTED_QUERIES = [
  "Recommend anime like Death Note",
  "Best beginner anime",
  "Emotional anime recommendations",
  "Short anime under 13 episodes",
  "Donghua suggestions",
];

export function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFn = useServerFn(chatWithAI);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const text = (message ?? input).trim();
    if (!text) return;

    // Capture history at send-time to avoid stale closure issues
    const historySnapshot = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Prevent duplicate/empty assistant bubbles from rapid sends
    if (loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
    };

    const assistantId = `msg-${Date.now()}-assistant`;

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        provider,
      },
    ]);

    setInput("");
    setLoading(true);

    // Client-side timeout to avoid "loading forever"
    const controller = new AbortController();
    const TIMEOUT_MS = 45_000;

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await chatFn({
        data: {
          message: text,
          provider,
          conversationHistory: historySnapshot,
        },
        // Pass abort signal if the underlying client supports it
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        toast.error("AI temporarily unavailable");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "AI temporarily unavailable. Please try again shortly." }
              : m,
          ),
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        );
      }

      // If the stream completed but nothing arrived, show fallback text
      setMessages((prev) => {
        const a = prev.find((m) => m.id === assistantId);
        if (!a) return prev;
        if (a.content.trim().length > 0) return prev;
        return prev.map((m) =>
          m.id === assistantId ? { ...m, content: "AI temporarily unavailable." } : m,
        );
      });
    } catch (e) {
      console.error("Chat error:", e);
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "AI temporarily unavailable (timed out)."
          : "AI temporarily unavailable";

      toast.error(msg);

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: msg } : m)),
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-white shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">Ask AnimeOrbit AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] rounded-[24px] border border-white/10 bg-slate-950/95 shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  AnimeOrbit AI
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by {provider === "openai" ? "ChatGPT" : "Gemini"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowProviderPicker(!showProviderPicker)}
                  className="text-xs px-2 py-1 rounded border border-white/10 text-slate-300 hover:border-white/20 transition"
                >
                  Switch AI
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Provider picker */}
            {showProviderPicker && (
              <div className="border-b border-white/10 p-3 space-y-2">
                {(["openai", "gemini"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProvider(p);
                      setShowProviderPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      provider === p
                        ? "bg-violet-500/20 border border-violet-500/50 text-white"
                        : "border border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {p === "openai" ? "🤖 ChatGPT" : "✨ Gemini"}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-4">
                  <MessageCircle className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-sm">Ask me about anime recommendations!</p>
                  <div className="space-y-2">
                    {SUGGESTED_QUERIES.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendMessage(q)}
                        className="block w-full text-xs px-3 py-2 rounded border border-white/10 text-slate-400 hover:border-white/20 hover:text-white transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white"
                          : "bg-white/10 border border-white/20 text-slate-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-slate-300 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about anime..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
