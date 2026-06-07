import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  plugins: [
    viteTsConfigPaths(),
    tailwindcss(),
    tanstackStart({
  spa: {
    enabled: true,
  },
  prerender: {
    enabled: false,
  },
}),
    react(),
    cloudflare(),
  ],
});
