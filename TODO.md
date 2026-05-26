# TODO — AnimeOrbit ads upgrade

- [ ] Inspect existing ad components and determine Monetag script/zone constraints (done)
- [ ] Create shared duplicate-safe + lazy Monetag slot component (`MonetagAdSlot`)
- [ ] Create reusable wrapper components:
  - [ ] `TopBannerAd`
  - [ ] `SidebarAd`
  - [ ] `InlineAd`
  - [ ] `MobileStickyAd`
  - [ ] `AdvertiseCard`
- [ ] Update routes to use new wrappers while keeping existing Monetag zones working:
  - [ ] `src/routes/index.tsx`
  - [ ] `src/routes/anime.$id.tsx`
- [ ] Add an “Advertise With Us” section in an appropriate page area
- [ ] Ensure SSR/route safety (no script injection from SSR root)
- [ ] Ensure lazy-loading does not break ad rendering
- [x] Run `npm run build` and fix any TS/React issues
- [x] Optionally run `npm run lint`


