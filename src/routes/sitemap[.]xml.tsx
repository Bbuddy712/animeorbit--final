import { createFileRoute } from "@tanstack/react-router";
import { jikanGetTopAnime } from "@/lib/jikan.functions";

export const Route = createFileRoute("/sitemap.xml")({
  component: Sitemap,
});

async function generateSitemap() {
  const baseUrl = "https://animeorbit.com";
  const today = new Date().toISOString().split("T")[0];

  // Fetch popular anime for sitemap (scalable approach)
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

  // Anime pages
  if (popularAnime && popularAnime.length > 0) {
    popularAnime.forEach((anime: any) => {
      const lastmod = anime.aired?.from ? new Date(anime.aired.from).toISOString().split("T")[0] : today;
      urls.push(`
        <url>
          <loc>${baseUrl}/anime/${anime.mal_id}</loc>
          <lastmod>${lastmod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`);
    });
  }

  // Future pages (placeholders for when built)
  const futurePages = [
    { path: "/trending", priority: "0.7" },
    { path: "/top-rated", priority: "0.7" },
    { path: "/seasonal", priority: "0.75" },
  ];

  futurePages.forEach((page) => {
    urls.push(`
      <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${page.priority}</priority>
      </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return sitemap;
}

function Sitemap() {
  // This component won't render HTML because we return XML in loader
  return null;
}

// Handle XML response
Route.options.loader = async () => {
  const sitemap = await generateSitemap();
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
