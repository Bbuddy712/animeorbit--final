# AnimeOrbit Deployment Guide

This guide provides step-by-step instructions for running and deploying the AnimeOrbit website.

## Prerequisites

- Node.js 18+ and npm/pnpm/bun
- A Supabase account and project
- (Optional) Gemini API key or OpenAI API key for AI features
- (Optional) YouTube API key for trailer embeds

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Required: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Optional: AI Providers (at least one recommended)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional: YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Optional: AniList
ANILIST_CLIENT_ID=your_anilist_client_id
ANILIST_CLIENT_SECRET=your_anilist_client_secret
```

### 3. Set Up Supabase Database

Run the migration script in your Supabase SQL editor or use the Supabase CLI:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually run the SQL from supabase/migrations/
```

The migration creates:

- `profiles` table (user profiles)
- `favorites` table (user's favorite anime)
- `watchlist` table (user's watchlist with status)
- `recently_viewed` table (recently viewed anime)

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8080` (or next available port).

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings > Environment Variables
   - Add all the variables from your `.env` file
   - Make sure to add both regular and `VITE_` prefixed versions

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Cloudflare Workers

This project is configured for Cloudflare Workers deployment via the `@cloudflare/vite-plugin`.

1. **Install Wrangler**

   ```bash
   npm install -g wrangler
   ```

2. **Login**

   ```bash
   wrangler login
   ```

3. **Deploy**

   ```bash
   npm run build
   wrangler pages deploy dist
   ```

4. **Set Environment Variables**
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_PUBLISHABLE_KEY
   # ... repeat for all secrets
   ```

### Option 3: Netlify

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**

   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables**
   - Go to Netlify Dashboard > Site Settings > Environment Variables
   - Add all variables from `.env`

### Option 4: Docker

1. **Create Dockerfile** (if not present)

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   CMD ["npm", "run", "preview"]
   ```

2. **Build and Run**
   ```bash
   docker build -t anime-orbit .
   docker run -p 8080:8080 --env-file .env anime-orbit
   ```

## Supabase Setup Details

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a region close to your users
4. Set a strong database password
5. Wait for the project to be ready

### 2. Get API Credentials

1. Go to Project Settings > API
2. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Run Database Migrations

The migration file is at `supabase/migrations/20260519153311_306a6b62-1ef1-425d-97e7-6cc414c6e2b5.sql`

Run it in the Supabase SQL Editor or via CLI.

### 4. Enable Authentication (Optional)

If you want user authentication:

1. Go to Authentication > Providers
2. Enable Email/Password provider
3. Configure other providers (Google, GitHub, etc.) as needed

## Google AdSense Approval

To prepare for Google AdSense approval:

### 1. Content Requirements

- ✅ Unique, original content (anime discovery platform)
- ✅ Sufficient pages (home, search, anime details, my-list, privacy, terms)
- ✅ Regular updates (anime data updates automatically via API)

### 2. Technical Requirements

- ✅ Fast loading (optimized with Vite)
- ✅ Mobile-responsive (Tailwind CSS with mobile-first design)
- ✅ SSL/HTTPS (enabled by default on Vercel/Cloudflare)
- ✅ robots.txt (created at `/public/robots.txt`)
- ✅ sitemap.xml (created at `/public/sitemap.xml`)

### 3. Legal Requirements

- ✅ Privacy Policy (`/privacy`)
- ✅ Terms of Service (`/terms`)
- ✅ Contact information (add to footer or contact page)

### 4. Navigation Requirements

- ✅ Clear navigation (Navbar with links)
- ✅ Working internal links
- ✅ No broken links

### 5. After Deployment

1. Submit your sitemap to Google Search Console
2. Monitor for crawl errors
3. Ensure consistent traffic for at least 3 months
4. Apply for AdSense when you have 50+ unique visitors/day

## Performance Optimization

The project includes several optimizations:

1. **Code Splitting**: TanStack Router automatically splits code by route
2. **Image Optimization**: Lazy loading with `loading="lazy"`
3. **Query Caching**: React Query with appropriate stale times
4. **CSS Optimization**: Tailwind CSS with purging
5. **Build Optimization**: Vite's production build with minification

## Troubleshooting

### Dev Server Won't Start

- Ensure all dependencies are installed: `npm install`
- Check that `.env` file exists and is properly formatted
- Verify port 8080 is not in use

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`
- Verify all environment variables are set

### Supabase Connection Issues

- Verify SUPABASE_URL is correct
- Check that anon/public key is valid
- Ensure RLS policies are not blocking queries
- Check Supabase dashboard for any service outages

### API Rate Limiting

- Jikan API has rate limits (4 requests/second)
- Implement caching in production
- Consider using a proxy or CDN for API calls

## Monitoring and Analytics

### Add Google Analytics

1. Create a Google Analytics property
2. Add GA tracking ID to environment: `VITE_GA_TRACKING_ID=GA-XXXXXXXXX`
3. Update `src/routes/__root.tsx` to include GA script

### Add Error Tracking (Sentry)

1. Install Sentry: `npm install @sentry/react @sentry/vite-plugin`
2. Configure in `vite.config.ts`
3. Add to `src/start.ts` or `src/server.ts`

## Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Use environment variables for all secrets
- [ ] Enable RLS (Row Level Security) on Supabase tables
- [ ] Use service role key only on server-side
- [ ] Implement rate limiting for API routes
- [ ] Enable HTTPS in production
- [ ] Keep dependencies updated: `npm audit fix`

## Support

For issues or questions:

- Check the [README.md](README.md) for project overview
- Review Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
- Check TanStack Start docs at [tanstack.com/start](https://tanstack.com/start)

## License

This project is provided as-is for educational and personal use.
