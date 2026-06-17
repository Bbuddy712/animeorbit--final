/**
 * Custom Vercel build script using the Build Output API v3.
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

// Run Vite build (prebuild hook in package.json already runs ensure-env.mjs)
run("npx vite build");

// Clean + prepare Build Output API structure
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/static`, { recursive: true });
mkdirSync(`${OUT}/functions/ssr.func`, { recursive: true });

// Copy client assets
cpSync("dist/client", `${OUT}/static`, { recursive: true });

if (existsSync("public")) {
  cpSync("public", `${OUT}/static`, { recursive: true });
}

// Copy server bundle
cpSync("dist/server", `${OUT}/functions/ssr.func`, { recursive: true });

// Write serverless function bridge
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

writeFileSync(
  `${OUT}/functions/ssr.func/package.json`,
  JSON.stringify({ type: "module" }, null, 2),
);

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

writeFileSync(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/ssr" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-build] Build Output API structure created successfully.");
