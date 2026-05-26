"use client";

import { useEffect, useState, useCallback } from "react";
import {
  findWorkingDomain,
  findWorkingDomainsForProviders,
  getWorkingMirrors,
  buildProviderSearchUrl,
  getProviderPreference,
  setProviderPreference,
} from "@/lib/provider-checker";
import { getProviderConfig } from "@/lib/providers.config";

export type ProviderSearchUrl = {
  providerId: string;
  providerName: string;
  url: string | null;
  isWorking: boolean;
  isLoading: boolean;
  error?: string;
};

export type ProviderSearchUrls = Record<string, ProviderSearchUrl | undefined>;

/**
 * Hook for getting a working domain for a single provider
 */
export function useProviderDomain(providerId: string) {
  const [domain, setDomain] = useState<string | null>(() => {
    return getProviderPreference(providerId);
  });
  const [isLoading, setIsLoading] = useState(!domain);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domain) return; // Already have a domain

    const findDomain = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const workingDomain = await findWorkingDomain(providerId);
        setDomain(workingDomain);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find working domain");
      } finally {
        setIsLoading(false);
      }
    };

    findDomain();
  }, [providerId, domain]);

  const setPreferred = useCallback(
    (newDomain: string) => {
      setProviderPreference(providerId, newDomain);
      setDomain(newDomain);
    },
    [providerId],
  );

  return { domain, isLoading, error, setPreferred };
}

/**
 * Hook for getting working domains for multiple providers
 */
export function useProviderDomains(providerIds: string[]) {
  const [domains, setDomains] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await findWorkingDomainsForProviders(providerIds);
        setDomains(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find working domains");
      } finally {
        setIsLoading(false);
      }
    };

    if (providerIds.length > 0) {
      fetchDomains();
    } else {
      setIsLoading(false);
    }
  }, [providerIds.join(",")]);

  return { domains, isLoading, error };
}

/**
 * Hook for getting search URLs for multiple providers
 */
export function useProviderSearchUrls(providerIds: string[], animeTitle: string) {
  const [urls, setUrls] = useState<ProviderSearchUrls>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const buildUrls = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const results: ProviderSearchUrls = {};

        for (const providerId of providerIds) {
          try {
            const config = getProviderConfig(providerId);
            if (!config) {
              results[providerId] = {
                providerId,
                providerName: providerId,
                url: null,
                isWorking: false,
                isLoading: false,
                error: "Provider not found",
              };
              continue;
            }

            const domain = await findWorkingDomain(providerId);
            let url: string | null = null;

            if (domain) {
              url = await buildProviderSearchUrl(providerId, animeTitle);
            }

            results[providerId] = {
              providerId,
              providerName: config.name,
              url,
              isWorking: !!url,
              isLoading: false,
            };
          } catch (err) {
            results[providerId] = {
              providerId,
              providerName: providerId,
              url: null,
              isWorking: false,
              isLoading: false,
              error: err instanceof Error ? err.message : "Failed to build URL",
            };
          }
        }

        setUrls(results);
      } finally {
        setIsLoading(false);
      }
    };

    if (providerIds.length > 0 && animeTitle) {
      buildUrls();
    } else {
      setIsLoading(false);
    }
  }, [providerIds.join(","), animeTitle]);

  return { urls, isLoading, error };
}

/**
 * Hook for getting all working mirrors for a provider
 */
export function useProviderMirrors(providerId: string) {
  const [mirrors, setMirrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMirrors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getWorkingMirrors(providerId);
        setMirrors(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get mirrors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMirrors();
  }, [providerId]);

  return { mirrors, isLoading, error };
}

/**
 * Hook for opening provider URL in new tab with preference tracking
 */
export function useOpenProvider() {
  const openProvider = useCallback((providerId: string, url: string, domain?: string) => {
    if (domain) {
      setProviderPreference(providerId, domain);
    }

    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
      newWindow.focus?.();
    }
  }, []);

  return { openProvider };
}
