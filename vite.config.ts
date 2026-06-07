import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const serverEnv = loadEnv(process.env.NODE_VERSION || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
});
