import ReactGA from "react-ga4";

let isInitialized = false;

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn("[Analytics] VITE_GA_MEASUREMENT_ID is not set. GA4 disabled.");
    return;
  }

  if (isInitialized) return;

  ReactGA.initialize(measurementId);
  isInitialized = true;
  console.log("[Analytics] Google Analytics 4 initialized");
};

export const trackPageView = (path: string, title?: string) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;

  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: title || document.title,
  });
};
