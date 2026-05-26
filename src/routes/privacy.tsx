import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#f8fafc] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#94a3b8]">Last updated: May 2026</p>

        <div className="mt-12 space-y-10 text-[#94a3b8]">
          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">1. Information We Collect</h2>
            <p className="mt-3 leading-relaxed">
              AnimeOrbit collects minimal personal information. When you use our platform, we may
              collect basic usage data such as pages visited, search queries, and watchlist
              preferences to improve your experience. We do not sell or share personal data with
              third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">2. How We Use Your Data</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 leading-relaxed">
              <li>To provide and improve our anime discovery features</li>
              <li>To personalize your recommendations and watchlist</li>
              <li>To analyze usage patterns and improve platform performance</li>
              <li>To communicate important updates about the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">3. Cookies & Local Storage</h2>
            <p className="mt-3 leading-relaxed">
              We use browser local storage to save your watchlist preferences and theme settings
              locally on your device. We may use cookies for authentication purposes if you create
              an account. You can clear this data at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">4. Third-Party Services</h2>
            <p className="mt-3 leading-relaxed">
              AnimeOrbit uses the Jikan API to fetch anime data from MyAnimeList. When you use our
              search or browse features, queries are sent to these external services. Please refer
              to{" "}
              <a
                href="https://myanimelist.net/about/privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a855f7] underline decoration-[#a855f7]/30 hover:decoration-[#a855f7]"
              >
                MyAnimeList's Privacy Policy
              </a>{" "}
              for their data handling practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">5. Data Security</h2>
            <p className="mt-3 leading-relaxed">
              We implement appropriate security measures to protect your information. All data
              transmission is encrypted using HTTPS. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">6. Contact</h2>
            <p className="mt-3 leading-relaxed">
              If you have questions about this Privacy Policy, please reach out through our GitHub
              repository or contact us directly.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
