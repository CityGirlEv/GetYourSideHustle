import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "e2e", "dist", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/routeTree.gen.ts",
        "src/integrations/supabase/**",
        "src/components/ui/**",
        "src/data/**",
        "src/styles.css",
        "src/start.ts",
        "src/router.tsx",
        "src/main.tsx",
      ],
      // 80% line threshold gate — enforced only via `bun run test:coverage`.
      // Build/dev runs use plain `vitest run` so day-to-day work isn't blocked.
      thresholds: {
        lines: 80,
        functions: 70,
        statements: 80,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
