import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#071120]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#f8fafc] sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-[#94a3b8]">Last updated: May 2026</p>

        <div className="mt-12 space-y-10 text-[#94a3b8]">
          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">1. Acceptance of Terms</h2>
            <p className="mt-3 leading-relaxed">
              By accessing and using AnimeOrbit ("the Service"), you accept and agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">2. Description of Service</h2>
            <p className="mt-3 leading-relaxed">
              AnimeOrbit is an AI-powered anime discovery platform that provides anime
              recommendations, trending information, search functionality, and watchlist management.
              The Service uses data from third-party APIs, including the Jikan API (an unofficial
              MyAnimeList API).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">3. User Accounts</h2>
            <p className="mt-3 leading-relaxed">
              Some features of the Service, such as saving favorites and managing watchlists,
              require you to create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities that occur under
              your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">4. Acceptable Use</h2>
            <p className="mt-3 leading-relaxed">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-6">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or its servers</li>
              <li>Scrape, crawl, or use automated means to access the Service without permission</li>
              <li>Upload or transmit malicious code or content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">5. Intellectual Property</h2>
            <p className="mt-3 leading-relaxed">
              All anime data, images, and related content are the property of their respective
              owners and are sourced from MyAnimeList via the Jikan API. AnimeOrbit does not claim
              ownership of any anime-related media or content. The AnimeOrbit name, logo, and
              platform design are our intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">6. Disclaimer of Warranties</h2>
            <p className="mt-3 leading-relaxed">
              The Service is provided "as is" and "as available" without any warranties of any
              kind, either express or implied. We do not guarantee that the Service will be
              uninterrupted, error-free, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">7. Limitation of Liability</h2>
            <p className="mt-3 leading-relaxed">
              To the fullest extent permitted by law, AnimeOrbit shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising out of or
              related to your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">8. Changes to Terms</h2>
            <p className="mt-3 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the Service after any changes
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f8fafc]">9. Contact</h2>
            <p className="mt-3 leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:ds2629812@gmail.com"
                className="text-[#a855f7] underline decoration-[#a855f7]/30 hover:decoration-[#a855f7]"
              >
                ds2629812@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
