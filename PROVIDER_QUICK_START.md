# Quick Start: AnimeOrbit Provider System

## Installation (Already Done ✅)

All components, hooks, and utilities are ready to use! No npm install needed.

## Quick Integration Examples

### 1. Add Watch Button to Anime Detail Page

**File:** `src/routes/anime.$id.tsx`

```typescript
import { WatchButton } from "@/components/WatchButton";

export function AnimeDetail() {
  const { data: anime } = useRoute().useSearch();
  const title = anime.title_english || anime.title;

  return (
    <div className="space-y-8">
      {/* Existing content */}

      {/* Add this section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
          Watch Now
        </h2>
        <WatchButton
          animeTitle={title}
          malId={anime.mal_id}
          size="lg"
          providers={[
            "netflix",
            "crunchyroll",
            "hianime",
            "animepahe",
            "aniwatch",
          ]}
        />
      </section>

      {/* Keep existing WhereToWatch if you have it */}
      {/* <WhereToWatch title={title} /> */}
    </div>
  );
}
```

### 2. Use Enhanced Anime Card with Watch Button

**Replace AnimeCard imports in trending/recommendation sections:**

```typescript
// Before
import { AnimeCard } from "@/components/AnimeCard";

// After
import { AnimeCardEnhanced } from "@/components/AnimeCardEnhanced";

// Usage
{animes.map((anime, idx) => (
  <AnimeCardEnhanced
    key={anime.mal_id}
    anime={anime}
    index={idx}
    showWatchButton={true}  // Enable watch button on hover
    providers={["netflix", "crunchyroll", "hianime"]}
  />
))}
```

### 3. Access Provider Settings (Already in Navbar ✅)

Users can click the "Streaming" button in the navbar to:
- View all configured providers
- See their preferred mirrors
- Clear preferences to auto-detect
- Understand how the system works

### 4. Custom Watch Handler (Advanced)

If you need custom logic:

```typescript
import { useProviderSearchUrls, useOpenProvider } from "@/lib/provider-system";

export function CustomWatchButton({ animeTitle, malId }) {
  const { urls, isLoading } = useProviderSearchUrls(
    ["netflix", "crunchyroll", "hianime"],
    animeTitle
  );
  const { openProvider } = useOpenProvider();

  const bestProvider = Object.entries(urls)
    .filter(([, result]) => result?.isWorking)
    .map(([id]) => id)[0];

  const handleWatch = () => {
    if (!bestProvider) {
      alert("No providers available");
      return;
    }

    const url = urls[bestProvider]?.url;
    if (url) {
      openProvider(bestProvider, url);
    }
  };

  return (
    <button onClick={handleWatch} disabled={isLoading}>
      {isLoading ? "Loading..." : `Watch on ${bestProvider}`}
    </button>
  );
}
```

## Configuration

### Change Provider Order

Edit `src/lib/providers.config.ts`:

```typescript
export const DEFAULT_PROVIDERS = [
  "netflix",
  "crunchyroll",
  "hianime",      // Edit order here
  "animepahe",
  "aniwatch",
];
```

### Add/Remove Providers from UI

**Option A:** Edit provider lists

```typescript
// Only show official providers
export const DEFAULT_PROVIDERS = ["netflix", "crunchyroll"];

// Or customize per component
<WatchButton
  animeTitle={title}
  providers={["netflix", "crunchyroll"]}  // Custom list
/>
```

**Option B:** Add new provider to config

See "Adding a New Provider" in `PROVIDER_SYSTEM.md`

### Customize Colors

Edit provider colors in `PROVIDERS_CONFIG`:

```typescript
netflix: {
  color: "#E50914",  // Custom hex color
  glow: "shadow-[0_0_30px_-5px_#E50914]",  // Matching shadow
  // ... rest of config
}
```

### Update Mirror Domains

Edit mirrors array for each provider:

```typescript
hianime: {
  mirrors: [
    { domain: "https://hianime.ph", priority: 1, active: true },
    { domain: "https://hianime.se", priority: 2, active: true },
    // Add new mirrors here
  ],
  // ...
}
```

## Verification

### Check Everything Works

1. **Navbar**: Look for "Streaming" button in top right (desktop)
2. **Settings**: Click it and see provider preferences dialog
3. **Detail Page**: Visit any anime and look for "Watch Now" section
4. **Cards**: Hover over anime cards to see watch button (if enabled)

### Testing Provider Availability

```typescript
import { findWorkingDomain } from "@/lib/provider-system";

// In browser console
const domain = await findWorkingDomain("hianime");
console.log(domain); // Should log working domain or null
```

## Troubleshooting

### "No working providers" message
- Check internet connection
- Try clearing localStorage: `localStorage.clear()`
- Verify providers aren't blocked by ISP/VPN
- Wait a moment and try again (domain check takes ~4 seconds)

### Preference not saving
- Check if localStorage is enabled
- Check browser console for errors
- Private browsing may not support persistence

### Button not appearing
- Ensure `showWatchButton={true}` on AnimeCardEnhanced
- Check providers array is not empty
- Verify anime title is passed correctly

### Slow performance
- Checks are cached for 24 hours (localStorage)
- First check per provider takes ~4 seconds
- Clear cache if needed: `localStorage.clear()`

## Common Customizations

### Show only official providers

```typescript
<WatchButton
  animeTitle={title}
  providers={["netflix", "crunchyroll"]}
/>
```

### Show only community providers

```typescript
<WatchButton
  animeTitle={title}
  providers={["hianime", "animepahe", "aniwatch"]}
/>
```

### Small button for sidebars

```typescript
<WatchButton
  animeTitle={title}
  size="sm"
  showLabel={false}
/>
```

### Outlined variant

```typescript
<WatchButton
  animeTitle={title}
  variant="outline"
/>
```

## Clean Imports

For cleaner code, import from the convenience re-export:

```typescript
import {
  WatchButton,
  ProviderSettings,
  useProviderSearchUrls,
  findWorkingDomain,
  PROVIDERS_CONFIG,
} from "@/lib/provider-system";
```

Instead of importing from multiple files.

## Next Steps

1. ✅ Integration complete - start using WatchButton in your pages
2. 📚 Read `PROVIDER_SYSTEM.md` for advanced features
3. 🎨 Customize colors and providers to match your branding
4. 🧪 Test with different anime to ensure smooth experience
5. 📊 Monitor localStorage usage (should be minimal)

## Support

For issues or questions, refer to:
- `PROVIDER_SYSTEM.md` - Comprehensive documentation
- Component JSDoc comments - Inline documentation
- This file - Quick reference
