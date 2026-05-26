import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart, Zap, Globe } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#f8fafc] sm:text-5xl">
          About{" "}
          <span className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            AnimeOrbit
          </span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[#94a3b8]">
          AnimeOrbit is an AI-powered anime discovery platform designed to help fans find their next
          favorite series. Whether you're a seasoned otaku or just starting your anime journey, we
          make it easy to explore trending titles, discover hidden gems, and build your perfect
          watchlist.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {[
            {
              icon: Sparkles,
              title: "AI-Powered Discovery",
              description:
                "Our intelligent recommendation engine learns your preferences and suggests anime tailored to your taste.",
            },
            {
              icon: Zap,
              title: "Real-Time Trends",
              description:
                "Stay up to date with what's trending in the anime community, powered by live data from MyAnimeList.",
            },
            {
              icon: Heart,
              title: "Built for Fans",
              description:
                "Created by anime enthusiasts who understand what makes a great discovery experience.",
            },
            {
              icon: Globe,
              title: "Comprehensive Database",
              description:
                "Access detailed information on thousands of anime titles, characters, studios, and more.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.05)] p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#f8fafc]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">{description}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#f8fafc]">Data Sources</h2>
          <p className="mt-4 text-[#94a3b8]">
            AnimeOrbit uses the{" "}
            <a
              href="https://jikan.moe/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a855f7] underline decoration-[#a855f7]/30 hover:decoration-[#a855f7]"
            >
              Jikan API
            </a>{" "}
            (an unofficial MyAnimeList API) to provide comprehensive anime data including titles,
            synopses, ratings, characters, and more. All data is sourced from MyAnimeList, the
            world's largest anime database.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
