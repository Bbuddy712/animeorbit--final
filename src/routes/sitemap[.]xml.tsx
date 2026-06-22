import { createFileRoute } from "@tanstack/react-router";
import { jikanGetTopAnime } from "@/lib/jikan.functions";

export const Route = createFileRoute("/sitemap.xml")({
  component: Sitemap,
});

async function generateSitemap() {
  const baseUrl = "https://animeorbit.com";
  const today = new Date().toISOString().split("T")[0];

  const popularAnime = await jikanGetTopAnime({ data: { limit: 100 } });

  const urls: string[] = [];

  // Home
  urls.push(`
    <url>
      <loc>${baseUrl}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`);

  // Core Discovery Pages
  const discoveryPages = [
    { path: "/trending", priority: "0.85", changefreq: "daily" },
    { path: "/top-rated", priority: "0.8", changefreq: "weekly" },
    { path: "/seasonal", priority: "0.85", changefreq: "daily" },
  ];

  discoveryPages.forEach((page) => {
    urls.push(`
      <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
      </url>`);
  });

  // Seasonal Landing Pages (High Priority)
  const seasonalPages = [
    { path: "/spring-2026-anime", priority: "0.8", changefreq: "daily" },
    { path: "/summer-2026-anime", priority: "0.8", changefreq: "daily" },
    { path: "/fall-2026-anime", priority: "0.8", changefreq: "daily" },
    { path: "/winter-2026-anime", priority: "0.8", changefreq: "daily" },
  ];

  seasonalPages.forEach((page) => {
    urls.push(`
      <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
      </url>`);
  });

  // Expanded Genre Pages
  const popularGenres = [
    "action", "comedy", "romance", "fantasy", "sci-fi", "horror",
    "slice-of-life", "drama", "mystery", "adventure"
  ];
  popularGenres.forEach((genre) => {
    urls.push(`
      <url>
        <loc>${baseUrl}/genre/${genre}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`);
  });

  // Expanded Studio Pages
  const popularStudios = [
    "mappa", "madhouse", "bones", "kyoto-animation", "toei-animation",
    "ufotable", "wit-studio", "trigger"
  ];
  popularStudios.forEach((studio) => {
    urls.push(`
      <url>
        <loc>${baseUrl}/studio/${studio}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.65</priority>
      </url>`);
  });

  // Expanded Collection Pages
  const collections = [
    "best-romance-anime",
    "best-action-anime",
    "best-isekai-anime",
    "best-comedy-anime",
    "best-horror-anime",
    "best-fantasy-anime",
    "best-shounen-anime",
    "best-sci-fi-anime",
  ];

  collections.forEach((slug) => {
    urls.push(`
      <url>
        <loc>${baseUrl}/collections/${slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.75</priority>
      </url>`);
  });

  // Anime pages
  if (popularAnime && popularAnime.length > 0) {
    popularAnime.forEach((anime: any) => {
      const lastmod = anime.aired?.from ? new Date(anime.aired.from).toISOString().split("T")[0] : today;
      urls.push(`
        <url>
          <loc>${baseUrl}/anime/${anime.mal_id}</loc>
          <lastmod>${lastmod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.75</priority>
        </url>`);
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return sitemap;
}

function Sitemap() {
  return null;
}

Route.options.loader = async () => {
  const sitemap = await generateSitemap();
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
