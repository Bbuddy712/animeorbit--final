import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { initGA, trackPageView } from "@/lib/analytics";
import { Analytics } from "@vercel/analytics/react";

export function AnalyticsProvider() {
  const router = useRouter();

  useEffect(() => {
    // Initialize Google Analytics 4
    initGA();

    // Track initial page view
    trackPageView(window.location.pathname);
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const unsubscribe = router.subscribe("onLoad", () => {
      trackPageView(window.location.pathname);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <>
      {/* Vercel Analytics for Core Web Vitals */}
      <Analytics />
    </>
  );
}
