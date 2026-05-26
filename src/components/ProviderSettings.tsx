"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OFFICIAL_PROVIDERS,
  COMMUNITY_PROVIDERS,
  getProviderConfig,
} from "@/lib/providers.config";
import {
  getProviderPreference,
  clearProviderPreference,
} from "@/lib/provider-checker";

export interface ProviderSettingsProps {
  triggerClassName?: string;
}

function ProviderSettingItem({
  providerId,
  onRefresh,
}: {
  providerId: string;
  onRefresh: () => void;
}) {
  const config = getProviderConfig(providerId);
  const preference = getProviderPreference(providerId);

  if (!config) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between p-3 rounded-lg border border-[rgba(124,58,237,0.1)] bg-[rgba(124,58,237,0.02)] hover:bg-[rgba(124,58,237,0.05)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-white truncate">
            {config.name}
          </h4>
          {config.isOfficial && (
            <Badge className="h-5 px-1.5 text-xs bg-blue-500/20 text-blue-300 border-0">
              Official
            </Badge>
          )}
        </div>
        {preference ? (
          <p className="text-xs text-[#94a3b8]/60 mt-1 truncate">
            Preferred: {preference}
          </p>
        ) : (
          <p className="text-xs text-[#94a3b8]/40 mt-1">
            Auto-detect working mirror
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">
        {preference && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              clearProviderPreference(providerId);
              onRefresh();
            }}
            title="Clear preference"
          >
            <Trash2 className="h-4 w-4 text-[#94a3b8]/60 hover:text-red-400" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function ProviderSettings({ triggerClassName }: ProviderSettingsProps) {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${triggerClassName || ""}`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Streaming</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#a855f7]" />
            Streaming Provider Preferences
          </DialogTitle>
          <DialogDescription>
            Configure your preferred streaming providers and mirrors. The system
            automatically detects working domains and remembers your preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="official" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="official">Official Services</TabsTrigger>
            <TabsTrigger value="community">Community Providers</TabsTrigger>
          </TabsList>

          <TabsContent value="official" className="space-y-3 mt-6">
            {OFFICIAL_PROVIDERS.map((providerId) => (
              <ProviderSettingItem
                key={`${providerId}-${refreshKey}`}
                providerId={providerId}
                onRefresh={handleRefresh}
              />
            ))}
          </TabsContent>

          <TabsContent value="community" className="space-y-3 mt-6">
            {COMMUNITY_PROVIDERS.map((providerId) => (
              <ProviderSettingItem
                key={`${providerId}-${refreshKey}`}
                providerId={providerId}
                onRefresh={handleRefresh}
              />
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 rounded-lg bg-[rgba(124,58,237,0.05)] border border-[rgba(124,58,237,0.1)]">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-[#a855f7] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#94a3b8]">
              <p className="font-medium mb-1">How it works</p>
              <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
                <li>Automatically checks if providers are available</li>
                <li>Remembers your preferred mirror for each provider</li>
                <li>Falls back to alternative mirrors if needed</li>
                <li>Works across all anime cards and detail pages</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
