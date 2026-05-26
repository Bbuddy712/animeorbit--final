import { config as loadEnv } from "dotenv";

// Load root `.env` before Vite reads VITE_* variables
loadEnv({ path: ".env" });

// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import type { PluginOption } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Bundle all npm packages into the server output during `vite build` so the
// Vercel serverless function is self-contained (no node_modules at runtime).
// Applied only at build time — the dev server needs packages external so CJS
// modules like dotenv work in the module runner.
function vercelSsrBundle(): PluginOption {
  return {
    name: "vercel-ssr-bundle",
    config(_, { command }) {
      if (command === "build") {
        return { ssr: { noExternal: true } };
      }
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// Cloudflare plugin is disabled for Vercel deployment; the server bundle is wrapped
// by scripts/vercel-build.mjs into a Vercel serverless function instead.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [vercelSsrBundle()],
});
