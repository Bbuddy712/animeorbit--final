# AnimeOrbit Intelligent Streaming Provider System

## Overview

A comprehensive streaming provider system that intelligently detects working anime streaming providers and remembers user preferences. Supports both official services (Netflix, Crunchyroll) and community platforms with automatic domain checking and fallback mechanisms.

## Features

✅ **Official Provider Prioritization**: Netflix, Crunchyroll, and Lucifer Donghua are always shown first
✅ **Community Providers**: AnimePahe, HiAnime, AnimeNana, AniWatch, 9anime with multiple mirrors
✅ **Automatic Domain Checking**: Validates provider availability with timeout protection
✅ **Smart Fallback**: Automatically switches to working mirrors if primary domain fails
✅ **Preference Persistence**: Remembers user's preferred mirror in localStorage
✅ **Multi-Mirror Support**: Shows available mirrors in a modal for users to choose
✅ **Search URL Generation**: Auto-generates provider search URLs using `encodeURIComponent()`
✅ **New Tab Opening**: All links open in new tabs with `window.open(url, "_blank")`
✅ **Clean Modern UI**: Provider icons, badges (Official/Community), and animations
✅ **Reusable System**: Works across anime cards, detail pages, and any component

## Architecture

### Core Files

1. **`src/lib/providers.config.ts`** - Central provider configuration
2. **`src/lib/provider-checker.ts`** - Domain validation and preference management
3. **`src/hooks/use-provider.tsx`** - React hooks for provider operations
4. **`src/components/WatchButton.tsx`** - Main watch button component
5. **`src/components/ProviderSelectorModal.tsx`** - Mirror selection modal
6. **`src/components/ProviderSettings.tsx`** - Settings UI
7. **`src/components/AnimeCardEnhanced.tsx`** - Enhanced card with watch button

### Provider Configuration

All providers are defined in `src/lib/providers.config.ts`:

```typescript
export const PROVIDERS_CONFIG: Record<string, StreamingProviderConfig> = {
  netflix: { ... },
  crunchyroll: { ... },
  hianime: { ... },
  animepahe: { ... },
  // ... more providers
}
```

Each provider has:
- `id`: Unique identifier
- `name`: Display name
- `type`: subscription/free/ad-supported
- `color`: Brand color for UI
- `glow`: Tailwind shadow for glow effect
- `initials`: 1-2 letter badge
- `hasDub/hasSub`: Language support
- `quality`: 4K/HD/SD
- `isOfficial`: Mark official services
- `mirrors`: Array of mirror domains with priority
- `searchUrlPattern`: Function to generate search URLs

### Domain Checking System

The `src/lib/provider-checker.ts` module handles:

```typescript
// Check if a domain is available
const isWorking = await checkDomainAvailability("https://hianime.ph");

// Find first working domain for a provider
const domain = await findWorkingDomain("hianime");

// Get all working mirrors for a provider
const mirrors = await getWorkingMirrors("aniwatch");

// Build search URL with working domain
const url = await buildProviderSearchUrl("netflix", "Attack on Titan");
```

**Features:**
- 4-second timeout per domain check
- Automatic fallback to GET if HEAD fails
- localStorage caching with 24-hour TTL
- Parallel multi-provider checking
- User preference persistence

### React Hooks

Use in any component:

```typescript
// Get single provider domain
const { domain, isLoading, error, setPreferred } = useProviderDomain("netflix");

// Get multiple provider domains
const { domains, isLoading, error } = useProviderDomains([
  "netflix",
  "crunchyroll",
  "hianime",
]);

// Get search URLs for providers
const { urls, isLoading, error } = useProviderSearchUrls(
  ["netflix", "crunchyroll"],
  "Attack on Titan"
);

// Get all working mirrors for a provider
const { mirrors, isLoading, error } = useProviderMirrors("aniwatch");

// Open provider in new tab with preference tracking
const { openProvider } = useOpenProvider();
openProvider("netflix", "https://netflix.com/search?q=...", "https://netflix.com");
```

## Usage Examples

### 1. Using WatchButton Component

```typescript
import { WatchButton } from "@/components/WatchButton";

export function MyComponent() {
  return (
    <WatchButton
      animeTitle="Attack on Titan"
      malId={16498}
      providers={["netflix", "crunchyroll", "hianime"]}
      size="md"
      showLabel={true}
      variant="default"
    />
  );
}
```

**Props:**
- `animeTitle`: Anime title (required)
- `malId`: MyAnimeList ID (optional)
- `providers`: Array of provider IDs (default: official + top community)
- `size`: "sm" | "md" | "lg" (default: "md")
- `showLabel`: Show provider name (default: true)
- `variant`: "default" | "outline" | "ghost" (default: "default")

### 2. Using Enhanced Anime Card

```typescript
import { AnimeCardEnhanced } from "@/components/AnimeCardEnhanced";
import type { Anime } from "@/lib/jikan";

export function TrendingSection({ animes }: { animes: Anime[] }) {
  return (
    <div className="flex gap-4">
      {animes.map((anime, idx) => (
        <AnimeCardEnhanced
          key={anime.mal_id}
          anime={anime}
          index={idx}
          showWatchButton={true}
          providers={["netflix", "crunchyroll", "hianime"]}
        />
      ))}
    </div>
  );
}
```

### 3. Provider Settings in Navbar

Already integrated! The `ProviderSettings` component is added to the Navbar. Users can:
- See all configured providers
- View their preferences
- Clear preferences to auto-detect mirrors
- Understand how the system works

### 4. Manual Provider Operations

```typescript
import {
  findWorkingDomain,
  getWorkingMirrors,
  buildProviderSearchUrl,
  getProviderPreference,
  setProviderPreference,
} from "@/lib/provider-checker";

// Example: Custom watch handler
async function handleWatch(providerId: string, animeTitle: string) {
  try {
    // Find working domain
    const domain = await findWorkingDomain(providerId);
    if (!domain) {
      alert("Provider not available");
      return;
    }

    // Build search URL
    const url = await buildProviderSearchUrl(providerId, animeTitle);
    if (!url) {
      alert("Could not build search URL");
      return;
    }

    // Save preference
    setProviderPreference(providerId, domain);

    // Open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Failed to open provider:", error);
  }
}
```

### 5. Integrate into Detail Page

Add to `/anime/$id.tsx`:

```typescript
import { WatchButton } from "@/components/WatchButton";

export function AnimeDetail() {
  const { anime } = useRoute().useSearch();

  return (
    <div className="space-y-6">
      {/* Existing content */}

      {/* Add watch button */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Watch Now</h2>
        <WatchButton
          animeTitle={anime.title}
          malId={anime.mal_id}
          providers={[
            "netflix",
            "crunchyroll",
            "hianime",
            "animepahe",
            "aniwatch",
          ]}
          size="lg"
        />
      </div>

      {/* Existing WhereToWatch component can coexist */}
      <WhereToWatch title={anime.title} />
    </div>
  );
}
```

## Supported Providers

### Official Services (Prioritized)
- **Netflix**: `https://www.netflix.com/search?q={title}`
- **Crunchyroll**: `https://www.crunchyroll.com/search?q={title}`
- **Lucifer Donghua**: `https://luciferdonghua.in/search?q={title}`

### Community Providers
- **HiAnime**: 3 mirrors (ph, se, lc)
- **AnimePahe**: `https://animepahe.pw/anime?q={title}`
- **AnimeNana**: `https://animenana.com/search?keyword={title}`
- **AniWatch**: 3 mirrors (at, ro, jp)
- **9anime**: `https://9anime.org.lv/search?keyword={title}`

## Customization

### Adding a New Provider

1. Add to `PROVIDERS_CONFIG` in `src/lib/providers.config.ts`:

```typescript
export const PROVIDERS_CONFIG: Record<string, StreamingProviderConfig> = {
  // ... existing providers

  newprovider: {
    id: "newprovider",
    name: "New Provider",
    type: "free",
    regions: ["global"],
    color: "#FF0000",
    glow: "shadow-[0_0_30px_-5px_#FF0000]",
    initials: "NP",
    hasDub: true,
    hasSub: true,
    quality: "HD",
    isOfficial: false,
    mirrors: [
      {
        domain: "https://newprovider.com",
        priority: 1,
        active: true,
        description: "Primary",
      },
      {
        domain: "https://newprovider.alt.com",
        priority: 2,
        active: true,
        description: "Fallback",
      },
    ],
    searchUrlPattern: (title) =>
      `https://newprovider.com/search?q=${encodeURIComponent(title)}`,
    description: "New provider description",
  },
};
```

2. Add to appropriate provider list:

```typescript
export const COMMUNITY_PROVIDERS = [
  "hianime",
  "animepahe",
  "animenana",
  "aniwatch",
  "9anime",
  "newprovider", // Add here
];
```

### Customizing Colors

Update the `color` and `glow` fields for each provider:

```typescript
netflix: {
  color: "#E50914",              // Hex color
  glow: "shadow-[0_0_30px_-5px_#E50914]", // Tailwind shadow
  // ...
}
```

## Performance Considerations

1. **Domain Checks are Cached**: Results cached for 24 hours in localStorage
2. **Parallel Checking**: Multiple providers checked simultaneously
3. **Timeout Protection**: 4-second timeout prevents hanging
4. **Lazy Evaluation**: Domains only checked when needed
5. **React Query Compatible**: Can integrate with React Query for request deduplication

## Browser Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage support required
- Requires CORS-enabled provider domains
- Some providers may block automated checks (handled gracefully)

## Error Handling

The system gracefully handles:
- ❌ Domain timeouts → Falls back to next mirror
- ❌ Network errors → Returns cached result or primary domain
- ❌ All mirrors down → Returns primary as fallback
- ❌ localStorage unavailable → Works without persistence

## Security & Privacy

- ✅ No sensitive data stored
- ✅ User preferences stored locally only
- ✅ Opens links in new tab with `noopener,noreferrer`
- ✅ No external API calls beyond domain checks
- ✅ All URL building done client-side

## Troubleshooting

### No providers available
- Check browser console for errors
- Verify internet connection
- Ensure providers aren't blocked by ISP/VPN
- Check localStorage limits

### Slow domain checks
- Checks run in parallel, not sequentially
- Results are cached for 24 hours
- Clear cache: `localStorage.clear()`

### Preference not saving
- Check if localStorage is enabled
- Check browser's storage limits
- Private browsing may not support persistence

## Future Enhancements

- [ ] Database-based caching for domain status
- [ ] API endpoint for provider availability
- [ ] Regional provider filtering
- [ ] Deep-link resolution for specific anime
- [ ] Provider rating/review system
- [ ] Scheduled mirror health checks
