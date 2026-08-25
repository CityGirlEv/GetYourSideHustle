import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Plain `vite` has no Pages Functions. `npm run dev` proxies /api → local wrangler (:8788).
    // If :8788 is down, the proxy returns 502 — run `npm run dev` (not `dev:vite`) so both start.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
        // Remote D1 via wrangler pages dev often needs 10–30s per call; default
        // proxy timeouts look like "Cannot reach the GYSH API" in the browser.
        timeout: 120_000,
        proxyTimeout: 120_000,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            const out = res as { headersSent?: boolean; writeHead?: (code: number, headers: Record<string, string>) => void; end?: (body: string) => void }
            if (out && !out.headersSent && typeof out.writeHead === 'function' && typeof out.end === 'function') {
              out.writeHead(502, { 'content-type': 'application/json' })
              out.end(
                JSON.stringify({
                  error:
                    'Local API worker not running on :8788. Stop plain Vite and run: npm run dev',
                }),
              )
            }
          })
        },
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
