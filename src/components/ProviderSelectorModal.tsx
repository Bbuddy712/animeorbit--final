"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProviderConfig, getProviderMirrors } from "@/lib/providers.config";
import { useProviderMirrors, useOpenProvider } from "@/hooks/use-provider";
import { buildProviderSearchUrl, setProviderPreference } from "@/lib/provider-checker";

export interface ProviderSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  animeTitle: string;
  onSelect?: (domain: string) => void;
}

// Lazy-loadable version of the modal
export const LazyProviderSelectorModal = React.lazy(() =>
  Promise.resolve({ default: ProviderSelectorModal })
);

export function ProviderSelectorModal({
  open,
  onOpenChange,
  providerId,
  animeTitle,
  onSelect,
}: ProviderSelectorModalProps) {
  const config = getProviderConfig(providerId);
  const { mirrors, isLoading } = useProviderMirrors(providerId);
  const { openProvider } = useOpenProvider();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const allMirrors = getProviderMirrors(providerId);

  if (!config) return null;

  const handleSelectMirror = async (domain: string) => {
    setSelectedDomain(domain);
    setProviderPreference(providerId, domain);

    if (onSelect) onSelect(domain);

    try {
      const searchUrl = await buildProviderSearchUrl(providerId, animeTitle, domain);
      openProvider(providerId, searchUrl || config.searchUrlPattern(animeTitle), domain);
    } catch {
      openProvider(providerId, config.searchUrlPattern(animeTitle), domain);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#a855f7]" />
            Select {config.name} Mirror
          </DialogTitle>
          <DialogDescription>
            Choose a working mirror to watch "{animeTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#a855f7]" />
            </div>
          ) : mirrors.length > 0 ? (
            <AnimatePresence>
              {allMirrors.map((mirror, idx) => {
                const isWorking = mirrors.includes(mirror.domain);
                return (
                  <motion.button
                    key={mirror.domain}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelectMirror(mirror.domain)}
                    disabled={!isWorking}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isWorking
                        ? "border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.05)] hover:bg-[rgba(124,58,237,0.1)] hover:border-[#a855f7] cursor-pointer"
                        : "border-[rgba(124,58,237,0.1)] bg-[rgba(124,58,237,0.02)] opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <div className="font-medium text-white flex items-center gap-2">
                          {mirror.description}
                          {isWorking && <Check className="h-4 w-4 text-emerald-400" />}
                          {!isWorking && <AlertCircle className="h-4 w-4 text-amber-400" />}
                        </div>
                        <div className="text-xs text-[#94a3b8]/60 mt-0.5">{mirror.domain}</div>
                      </div>
                      {isWorking && (
                        <Badge variant="outline" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                          Working
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-amber-400" />
              <p className="text-sm text-[#94a3b8]">No working mirrors available at the moment</p>
              <p className="text-xs text-[#94a3b8]/60 mt-2">Please try again later</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Recommended lazy usage:
// import { Suspense } from 'react';
// const LazyProviderSelectorModal = React.lazy(() => import('./ProviderSelectorModal').then(m => ({ default: m.ProviderSelectorModal })));
//
// <Suspense fallback={null}>
//   <LazyProviderSelectorModal open={open} ... />
// </Suspense>
