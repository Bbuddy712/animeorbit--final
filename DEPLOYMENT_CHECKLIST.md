# AnimeOrbit 2.0 - Final Deployment Checklist

This document ensures AnimeOrbit is production-ready before public launch.

## 1. Pre-Deployment Verification

### SEO & Indexing
- [ ] `robots.txt` is correct and points to sitemap
- [ ] Dynamic `sitemap.xml` is working (`/sitemap.xml`)
- [ ] All major pages have canonical URLs
- [ ] Open Graph tags are present on key pages
- [ ] Twitter Cards are implemented
- [ ] JSON-LD structured data exists on anime, homepage, genre, studio, and collection pages

### Analytics
- [ ] `VITE_GA_MEASUREMENT_ID` is set in environment variables
- [ ] `AnalyticsProvider` is mounted in the root layout
- [ ] Vercel Analytics is active (automatic on Vercel)
- [ ] Google Analytics 4 is receiving page views

### Routes & Functionality
- [ ] No broken routes (test: Home, Anime detail, Trending, Top Rated, Seasonal, Genre, Studio, Collection)
- [ ] No console errors in production build
- [ ] Loading skeletons are present on data-heavy pages
- [ ] 404 handling works (TanStack Router fallback)

## 2. Environment Variables (Vercel)

Required:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. Vercel Deployment Steps

1. Push all changes to `main` branch
2. Connect repository to Vercel (if not already)
3. Add environment variables in Vercel Dashboard
4. Deploy
5. Verify production URL loads correctly
6. Submit sitemap to Google Search Console

## 4. Post-Deployment Tasks

### Google Search Console
- [ ] Verify site ownership
- [ ] Submit sitemap: `https://animeorbit.com/sitemap.xml`
- [ ] Monitor Index Coverage
- [ ] Check for crawl errors

### Bing Webmaster Tools
- [ ] Verify site
- [ ] Submit sitemap

### Monitoring
- [ ] Set up alerts in Vercel for downtime/errors
- [ ] Monitor Core Web Vitals in Vercel Analytics
- [ ] Review Google Analytics for traffic sources and bounce rate

## 5. SEO Pages Status (as of June 2026)

| Page Type          | Status     | Indexed in Sitemap |
|--------------------|------------|--------------------|
| Home               | ✅ Ready   | Yes                |
| Anime Detail       | ✅ Ready   | Yes                |
| Trending           | ✅ Ready   | Yes                |
| Top Rated          | ✅ Ready   | Yes                |
| Seasonal           | ✅ Ready   | Yes                |
| Genre Hubs         | ✅ Ready   | Yes                |
| Studio Pages       | ✅ Ready   | Yes                |
| Collection Pages   | ✅ Ready   | Yes                |

## 6. Known Limitations (Future Improvements)

- Data fetching on Genre/Studio/Collection pages currently uses top anime (can be improved with proper filters)
- No custom 404 page yet (uses TanStack Router default)
- No error boundary wrapper yet

## 7. Final Sign-off

Before going live:

- [ ] All checklist items above are green
- [ ] Production build succeeds (`npm run build`)
- [ ] No console warnings in production
- [ ] Mobile experience feels good
- [ ] Core pages load under 3 seconds on 4G

**AnimeOrbit is ready for public traffic.**
