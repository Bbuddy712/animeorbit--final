import { createFileRoute } from "@tanstack/react-router";
import { Mail, Instagram, Send } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`AnimeOrbit Contact: ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:ds2629812@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#f8fafc] sm:text-5xl">
          Contact{" "}
          <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            Us
          </span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[#94a3b8]">
          Have questions, suggestions, or just want to say hello? We'd love to hear from you.
          Reach out through any of the channels below.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {/* Contact cards */}
          <a
            href="mailto:ds2629812@gmail.com"
            className="group rounded-2xl border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.05)] p-6 transition-all duration-200 hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.1)]"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#f8fafc]">Email</h3>
            <p className="mt-2 text-sm text-[#a855f7]">ds2629812@gmail.com</p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              We typically respond within 24 hours
            </p>
          </a>

          <a
            href="https://instagram.com/animeorbitofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.05)] p-6 transition-all duration-200 hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.1)]"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#f8fafc]">Instagram</h3>
            <p className="mt-2 text-sm text-[#a855f7]">@animeorbitofficial</p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Follow us for updates, anime news &amp; more
            </p>
          </a>
        </div>

        {/* Contact form */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#f8fafc]">Send a Message</h2>
          <p className="mt-2 text-sm text-[#94a3b8]">
            Fill out the form below and it will open your email client with the details pre-filled.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#94a3b8]">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.06)] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.06)] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#94a3b8]">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.06)] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                placeholder="What would you like to tell us?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(124,58,237,0.6)]"
            >
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
