{/* ── EXPLORE MORE (Content Graph) ── */}
<section className="mt-16 border-t border-white/10 pt-8">
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-[#f8fafc]">
      Explore More
    </h3>
    <p className="text-sm text-[#94a3b8]">
      Discover trending, top-rated, and seasonal anime
    </p>
  </div>

  {(() => {
    const genreSlug =
      a.genres?.[0]?.name
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    const studioSlug =
      studios?.[0]
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    return (
      <div className="flex flex-wrap gap-3">
        <Link
          to="/trending"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10"
        >
          Trending Now
        </Link>

        <Link
          to="/top-rated"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10"
        >
          Top Rated
        </Link>

        <Link
          to="/seasonal"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10"
        >
          Current Season
        </Link>

        {genreSlug && (
          <Link
            to={`/genre/${encodeURIComponent(genreSlug)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10"
          >
            More {a.genres[0].name} Anime
          </Link>
        )}

        {studioSlug && (
          <Link
            to={`/studio/${encodeURIComponent(studioSlug)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f8fafc] transition hover:border-[#7c3aed]/40 hover:bg-white/10"
          >
            More from {studios[0]}
          </Link>
        )}
      </div>
    );
  })()}
</section>
