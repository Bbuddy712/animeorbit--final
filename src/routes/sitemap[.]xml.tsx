import { createFileRoute } from "@tanstack/react-router";
import { jikanGetTopAnime } from "@/lib/jikan.functions";

export const Route = createFileRoute("/sitemap.xml")({
  component: Sitemap,
});

async function generateSitemap() {
  const baseUrl = "https://animeorbit.com";
  const today = new Date().toISOString().split("T")[0];

  // Fetch popular anime for sitemap
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

  // Discovery Pages (High Priority for Traffic)
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
