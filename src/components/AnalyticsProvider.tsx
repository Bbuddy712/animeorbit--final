import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export function AnalyticsProvider() {
  const router = useRouter();

  // Analytics temporarily disabled (react-ga4 not installed)
  // TODO: Re-enable after installing react-ga4

  return null;
}
