// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
// Trigger build with new Cloudflare settings
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { defineConfig, type Plugin } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
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
    config(_config, { command, mode }) {
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

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Provide an explicit plugins array for CI safety
  plugins: [],
  vite: {
    plugins: [appBuildVersionPlugin()],
    build: {
      // Lower Rollup parallelism to reduce peak memory during Cloudflare CI builds.
      rollupOptions: {
        maxParallelFileOps: 2,
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
  },
});
