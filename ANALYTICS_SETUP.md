# Analytics Setup Guide for AnimeOrbit 2.0

This document explains how to set up analytics and monitoring for AnimeOrbit.

## 1. Google Analytics 4 (GA4)

### Setup Steps

1. Go to [Google Analytics](https://analytics.google.com) and create a new GA4 property.
2. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`).
3. Add it to your environment variables:

```bash
# .env or .env.local
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### How it works

- The app uses `react-ga4` for tracking.
- Page views are automatically tracked on route changes via TanStack Router.
- Located in `src/lib/analytics.ts` and `src/components/AnalyticsProvider.tsx`.

### What is tracked
- Page views
- Sessions
- Pages per session
- Session duration
- Traffic sources
- Top landing pages

---

## 2. Vercel Analytics (Core Web Vitals)

Vercel Analytics is already integrated and provides:

- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- TTFB (Time to First Byte)

No extra setup is needed if the project is deployed on Vercel.

---

## 3. Google Search Console

### Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://animeorbit.com`
3. Verify using one of these methods:
   - HTML file upload
   - HTML tag
   - DNS record (recommended for production)

### What to monitor
- Index coverage
- Crawl stats
- Search performance
- Mobile usability

**Important:** Make sure these are already working:
- `robots.txt` (points to sitemap)
- `sitemap.xml` (dynamic)
- Canonical URLs on all major pages

---

## 4. Bing Webmaster Tools

### Setup

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Verify using the provided method

Bing benefits from the same `robots.txt` and `sitemap.xml` setup as Google.

---

## 5. Environment Variables Summary

| Variable                    | Purpose                    | Required |
|----------------------------|----------------------------|----------|
| `VITE_GA_MEASUREMENT_ID`   | Google Analytics 4         | Yes      |

---

## 6. Where Analytics is Initialized

- `src/components/AnalyticsProvider.tsx` — Main provider
- `src/lib/analytics.ts` — GA4 helper functions

Add `<AnalyticsProvider />` near the root of your app (e.g., in your main layout or `App.tsx`).

---

## 7. Recommended Next Steps

1. Add your GA4 Measurement ID to environment variables
2. Deploy to Vercel (Vercel Analytics activates automatically)
3. Submit sitemap to Google Search Console
4. Monitor Core Web Vitals in Vercel Dashboard
5. Set up custom events later (e.g., "Anime Clicked", "Added to Watchlist")

---

**AnimeOrbit is now ready for data-driven growth.**
