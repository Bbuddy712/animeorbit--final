/**
 * Provider System - Convenience re-exports
 * Import from this file instead of multiple files for cleaner code
 *
 * @example
 * import {
 *   WatchButton,
 *   ProviderSettings,
 *   useProviderSearchUrls,
 *   findWorkingDomain,
 * } from "@/lib/provider-system";
 */

// Components
export { WatchButton } from "@/components/WatchButton";
export type { WatchButtonProps } from "@/components/WatchButton";

export { ProviderSelectorModal } from "@/components/ProviderSelectorModal";
export type { ProviderSelectorModalProps } from "@/components/ProviderSelectorModal";

export { ProviderSettings } from "@/components/ProviderSettings";
export type { ProviderSettingsProps } from "@/components/ProviderSettings";

export { AnimeCardEnhanced } from "@/components/AnimeCardEnhanced";
export type { AnimeCardEnhancedProps } from "@/components/AnimeCardEnhanced";

// Configuration
export {
  PROVIDERS_CONFIG,
  DEFAULT_PROVIDERS,
  DONGHUA_PROVIDERS,
  OFFICIAL_PROVIDERS,
  COMMUNITY_PROVIDERS,
  getProviderConfig,
  getAllProviderIds,
  getProvidersForRegion,
  getProviderMirrors,
  buildProviderSearchUrl,
  updateProviderMirrorStatus,
} from "@/lib/providers.config";

export type {
  ProviderType,
  ProviderRegion,
  ProviderMirror,
  StreamingProviderConfig,
} from "@/lib/providers.config";

// Domain Checking
export {
  checkDomainAvailability,
  findWorkingDomain,
  findWorkingDomainsForProviders,
  getWorkingMirrors,
  buildProviderSearchUrl as buildProviderSearchUrlWithCheck,
  getProviderPreference,
  setProviderPreference,
  clearProviderPreference,
} from "@/lib/provider-checker";

export type {
  ProviderCheckResult,
  ProviderPreference,
} from "@/lib/provider-checker";

// Hooks
export {
  useProviderDomain,
  useProviderDomains,
  useProviderSearchUrls,
  useProviderMirrors,
  useOpenProvider,
} from "@/hooks/use-provider";

export type {
  ProviderSearchUrl,
  ProviderSearchUrls,
} from "@/hooks/use-provider";
