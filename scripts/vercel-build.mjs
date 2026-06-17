/**
 * Custom Vercel build script using the Build Output API v3.
 *
 * TanStack Start is an SSR framework — `vite build` produces:
 *   dist/client/  (static JS/CSS assets)
 *   dist/server/  (Node.js server bundle with a `fetch(Request)` handler)
 *
 * This script maps that output into the structure Vercel expects:
 *   .vercel/output/static/         ← client assets (served from CDN)
 *   .vercel/output/functions/      ← serverless function (handles SSR + server fns)
 *   .vercel/output/config.json     ← routing rules
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const OUT = ".vercel/output";

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`[vercel-build] Command failed: ${cmd}`);
    throw err;
  }
}

// 1. Ensure .env keys exist (mirrors the prebuild hook in package.json)
run("node scripts/ensure-env.mjs");

// 2. Run the normal Vite build (with Cloudflare disabled in vite.config.ts)
run("npx vite build");

// 3. Clean previous output and create Build Output API directory structure
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/static`, { recursive: true });
mkdirSync(`${OUT}/functions/ssr.func`, { recursive: true });

// 4. Copy client assets → static CDN
cpSync("dist/client", `${OUT}/static`, { recursive: true });

// 4b. Copy public/ files (sitemap.xml, robots.txt, etc.) → static CDN
if (existsSync("public")) {
  cpSync("public", `${OUT}/static`, { recursive: true });
}

// 5. Copy server bundle → serverless function
cpSync("dist/server", `${OUT}/functions/ssr.func`, { recursive: true });

// 6. Write the serverless function entry that bridges Node.js req/res ↔ Web fetch API
writeFileSync(
  `${OUT}/functions/ssr.func/index.mjs`,
  `import server from './server.js';

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url, proto + '://' + host);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value != null) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? 'half' : undefined,
  });

  const response = await server.fetch(request, {}, {});

  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }

  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body);
}
`,
);

// 7. Mark function directory as ESM so Node.js treats .js files as ES modules
//    (Vite outputs server.js with `import` syntax)
writeFileSync(
  `${OUT}/functions/ssr.func/package.json`,
  JSON.stringify({ type: "module" }, null, 2),
);

// 9. Write function config — use Node.js runtime (server uses node:async_hooks)
writeFileSync(
  `${OUT}/functions/ssr.func/.vc-config.json`,
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 30,
    },
    null,
    2,
  ),
);

// 10. Write Build Output API routing config
writeFileSync(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve static assets from CDN first
        { handle: "filesystem" },
        // Everything else → SSR serverless function
        { src: "/(.*)", dest: "/ssr" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-build] Build Output API structure created successfully.");
