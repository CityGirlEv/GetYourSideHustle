import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Host the MAKE IT POP Prerequisites PDF as a real file Discord can open. */
function workshopPrereqPdfPlugin(): Plugin {
  return {
    name: 'workshop-prereq-pdf',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/guides/') || !url.endsWith('.pdf')) {
          next()
          return
        }
        void (async () => {
          const pdfMod = await server.ssrLoadModule('/src/lib/workshop-sneak-peek-pdf.ts')
          const books = await server.ssrLoadModule('/src/lib/workshop-playbooks.ts')
          const id = books.AI_SCENE_PACKS_WORKSHOP_ID as string
          const publicPath = pdfMod.workshopSneakPeekPdfPublicPath(id) as string | null
          if (!publicPath || url !== publicPath) {
            next()
            return
          }
          const doc = await pdfMod.buildWorkshopSneakPeekPdf(id)
          if (!doc) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          const filename = pdfMod.workshopSneakPeekPdfFilename(id) as string
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
          res.end(Buffer.from(doc.output('arraybuffer')))
        })().catch(next)
      })
    },
    async writeBundle(options) {
      const outDir = options.dir
      if (!outDir) return
      const { createServer } = await import('vite')
      const server = await createServer({
        configFile: false,
        plugins: [react()],
        server: { middlewareMode: true, hmr: false },
        appType: 'custom',
      })
      try {
        const pdfMod = await server.ssrLoadModule('/src/lib/workshop-sneak-peek-pdf.ts')
        const books = await server.ssrLoadModule('/src/lib/workshop-playbooks.ts')
        const id = books.AI_SCENE_PACKS_WORKSHOP_ID as string
        const publicPath = pdfMod.workshopSneakPeekPdfPublicPath(id) as string | null
        const doc = await pdfMod.buildWorkshopSneakPeekPdf(id)
        if (!doc || !publicPath) return
        const dest = join(outDir, publicPath.replace(/^\//, ''))
        mkdirSync(dirname(dest), { recursive: true })
        writeFileSync(dest, Buffer.from(doc.output('arraybuffer')))
      } finally {
        await server.close()
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), workshopPrereqPdfPlugin()],
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
