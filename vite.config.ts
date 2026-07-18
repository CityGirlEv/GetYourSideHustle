// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
// Trigger build with new Cloudflare settings
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { IncomingMessage } from "http";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const puppeteerStub = join(__dirname, "src/lib/stubs/puppeteer-stub.ts");
const CMS_LANDSCAPE_YEAR = "2026";
const CMS_LANDSCAPE_FILES = new Set([
  "plans.json",
  "county-index.json",
  "manifest.json",
  "state-counties.json",
]);
const serverEnv = loadEnv(process.env.NODE_ENV || "development", __dirname, "");
Object.assign(process.env, serverEnv);

function resolveBuildId(command: "build" | "serve", mode: string): string {
  if (command !== "build" || mode !== "production") return "dev";
  if (process.env.APP_BUILD_ID) return process.env.APP_BUILD_ID;
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Writes /version.json and injects VITE_APP_BUILD_ID for deploy detection. */
function appBuildVersionPlugin(): Plugin {
  return {
    name: "app-build-version",
    config(_config: unknown, { command, mode }: { command: "build" | "serve"; mode: string }) {
      const buildId = resolveBuildId(command, mode);
      const manifest = {
        buildId,
        builtAt: new Date().toISOString(),
        live: false,
      };

      // Only stamp public/version.json during production builds (copied to dist).
      // Dev serve must not overwrite the committed manifest or pollute the tree.
      if (command === "build" && mode === "production") {
        const publicDir = join(__dirname, "public");
        mkdirSync(publicDir, { recursive: true });
        writeFileSync(
          join(publicDir, "version.json"),
          `${JSON.stringify(manifest, null, 2)}\n`,
        );
      }

      return {
        define: {
          "import.meta.env.VITE_APP_BUILD_ID": JSON.stringify(buildId),
        },
      };
    },
  };
}

function cmsLandscapeDiskPath(filename: string): string | null {
  const candidates = [
    join(__dirname, "public", "data", "cms-landscape", CMS_LANDSCAPE_YEAR, filename),
    join(__dirname, "src", "data", "cms-landscape", CMS_LANDSCAPE_YEAR, filename),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

function shouldPrettyPrintCmsLandscape(
  req: IncomingMessage,
  filename: string,
): boolean {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.searchParams.get("pretty") === "1") return true;
  if (filename === "manifest.json" || filename === "state-counties.json") return true;
  const accept = req.headers.accept ?? "";
  return /\btext\/html\b/.test(accept);
}

/** Pretty-print CMS landscape JSON when opened in a browser tab during dev. */
function cmsLandscapePrettyPrintPlugin(): Plugin {
  return {
    name: "cms-landscape-pretty-print",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = (req.url ?? "").match(/^\/data\/cms-landscape\/\d{4}\/([\w.-]+\.json)/);
        if (!match) return next();
        const filename = match[1];
        if (!CMS_LANDSCAPE_FILES.has(filename)) return next();
        if (!shouldPrettyPrintCmsLandscape(req, filename)) return next();

        const filePath = cmsLandscapeDiskPath(filename);
        if (!filePath) return next();

        try {
          const pretty = `${JSON.stringify(JSON.parse(readFileSync(filePath, "utf8")), null, 2)}\n`;
          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(pretty);
        } catch {
          next();
        }
      });
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Provide an explicit plugins array for CI safety
  plugins: [],
  vite: {
    plugins: [appBuildVersionPlugin(), cmsLandscapePrettyPrintPlugin()],
    optimizeDeps: {
      // puppeteer → yargs breaks Vite pre-bundling and can stall client hydration in dev.
      exclude: ["puppeteer", "@puppeteer/browsers", "yargs"],
    },
    ssr: {
      external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
    },
    resolve: {
      alias: {
        puppeteer: puppeteerStub,
        "puppeteer-core": puppeteerStub,
        "@puppeteer/browsers": puppeteerStub,
      },
    },
    build: {
      sourcemap: false,
      // Lower Rollup parallelism to reduce peak memory during Cloudflare CI builds.
      rollupOptions: {
        maxParallelFileOps: 1,
        output: {
          manualChunks(id) {
            if (id.endsWith("plan-details.ts")) {
              return "plan-catalog";
            }
            if (id.includes("exceljs")) return "exceljs";
            if (id.includes("jspdf")) return "jspdf";
          },
        },
      },
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/_worker.js",
      publicDir: "dist",
    },
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    alias: {
      puppeteer: puppeteerStub,
      "puppeteer-core": puppeteerStub,
      "@puppeteer/browsers": puppeteerStub,
    },
    externals: {
      inline: [],
    },
    rollupConfig: {
      external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
    },
  },
});
