"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ProviderSelectorModal } from "@/components/ProviderSelectorModal";
import {
  getProviderConfig,
  OFFICIAL_PROVIDERS,
  COMMUNITY_PROVIDERS,
} from "@/lib/providers.config";
import { useProviderSearchUrls, useOpenProvider } from "@/hooks/use-provider";

export interface WatchButtonProps {
  animeTitle: string;
  malId?: number;
  providers?: string[];
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export function WatchButton({
  animeTitle,
  malId,
  providers = ["netflix", "crunchyroll", "hianime", "animepahe", "aniwatch"],
  size = "md",
  showLabel = true,
  variant = "default",
}: WatchButtonProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showMirrorSelector, setShowMirrorSelector] = useState(false);
  const { urls, isLoading } = useProviderSearchUrls(providers, animeTitle);
  const { openProvider } = useOpenProvider();

  // Categorize providers by type
  const officialProviders = useMemo(
    () => providers.filter((p) => OFFICIAL_PROVIDERS.includes(p)),
    [providers],
  );

  const communityProviders = useMemo(
    () => providers.filter((p) => COMMUNITY_PROVIDERS.includes(p)),
    [providers],
  );

  // Get working providers
  const workingProviders = useMemo(() => {
    return Object.entries(urls)
      .filter(([, result]) => result && result.isWorking)
      .map(([id]) => id);
  }, [urls]);

  // Get first working official provider or first working community provider
  const defaultProvider = useMemo(() => {
    return (
      officialProviders.find((p) => workingProviders.includes(p)) ||
      communityProviders.find((p) => workingProviders.includes(p)) ||
      workingProviders[0] ||
      null
    );
  }, [officialProviders, communityProviders, workingProviders]);

  const handleWatchClick = (providerId: string) => {
    const config = getProviderConfig(providerId);
    const providerUrl = urls[providerId];

    if (!config || !providerUrl?.url) return;

    // If provider has multiple mirrors, show selector
    if ((config.mirrors?.length ?? 0) > 1) {
      setSelectedProvider(providerId);
      setShowMirrorSelector(true);
    } else {
      // Single mirror, open directly
      openProvider(providerId, providerUrl.url, config.mirrors?.[0]?.domain);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs gap-1.5",
    md: "h-10 text-sm gap-2",
    lg: "h-12 text-base gap-2.5",
  };

  if (isLoading) {
    return (
      <Button disabled size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showLabel && "Loading..."}
      </Button>
    );
  }

  if (workingProviders.length === 0) {
    return (
      <Button disabled size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}>
        <Play className="h-4 w-4" />
        {showLabel && "No Providers Available"}
      </Button>
    );
  }

  if (workingProviders.length === 1 && defaultProvider) {
    const config = getProviderConfig(defaultProvider);
    const providerUrl = urls[defaultProvider];

    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => handleWatchClick(defaultProvider)}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
            className={`${sizeClasses[size]} ${
              variant === "default"
                ? `bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#a855f7]/90 hover:to-[#7c3aed]/90 text-white`
                : ""
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            {showLabel && (
              <span>
                Watch on {config?.name}
                {config?.isOfficial && (
                  <Badge className="ml-1.5 px-1.5 py-0 h-5 bg-blue-500/20 text-blue-300 border-0">
                    Official
                  </Badge>
                )}
              </span>
            )}
          </Button>
        </motion.div>

        {selectedProvider && (
          <ProviderSelectorModal
            open={showMirrorSelector}
            onOpenChange={setShowMirrorSelector}
            providerId={selectedProvider}
            animeTitle={animeTitle}
          />
        )}
      </>
    );
  }

  // Multiple providers available - show dropdown
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
              className={`${sizeClasses[size]} ${
                variant === "default"
                  ? `bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#a855f7]/90 hover:to-[#7c3aed]/90 text-white`
                  : ""
              }`}
            >
              <Play className="h-4 w-4 fill-current" />
              {showLabel && <span>Watch</span>}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            {officialProviders.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-[#a855f7]">
                  Official
                </DropdownMenuLabel>
                {officialProviders.map((providerId) => {
                  const config = getProviderConfig(providerId);
                  const providerUrl = urls[providerId];
                  const isWorking = providerUrl?.isWorking;

                  if (!config) return null;

                  return (
                    <DropdownMenuItem
                      key={providerId}
                      onClick={() => handleWatchClick(providerId)}
                      disabled={!isWorking}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className={isWorking ? "" : "opacity-50"}>
                        {config.name}
                      </span>
                      {isWorking && (
                        <Badge
                          variant="outline"
                          className="ml-2 h-5 px-1.5 text-xs bg-blue-500/10 text-blue-300 border-blue-500/30"
                        >
                          Available
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}

                {communityProviders.length > 0 && (
                  <DropdownMenuSeparator className="my-2" />
                )}
              </>
            )}

            {communityProviders.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-[#a855f7]">
                  Community
                </DropdownMenuLabel>
                {communityProviders.map((providerId) => {
                  const config = getProviderConfig(providerId);
                  const providerUrl = urls[providerId];
                  const isWorking = providerUrl?.isWorking;

                  if (!config) return null;

                  return (
                    <DropdownMenuItem
                      key={providerId}
                      onClick={() => handleWatchClick(providerId)}
                      disabled={!isWorking}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className={isWorking ? "" : "opacity-50"}>
                        {config.name}
                      </span>
                      {isWorking && (
                        <Badge
                          variant="outline"
                          className="ml-2 h-5 px-1.5 text-xs bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        >
                          Available
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {selectedProvider && (
        <ProviderSelectorModal
          open={showMirrorSelector}
          onOpenChange={setShowMirrorSelector}
          providerId={selectedProvider}
          animeTitle={animeTitle}
        />
      )}
    </>
  );
}
