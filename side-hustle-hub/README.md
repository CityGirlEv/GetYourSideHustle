# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Local development (login / API)

Plain `vite` does **not** serve `functions/` — that is why `/api/auth/login` returned **404** in local/dev.

Use the default script (Vite UI + Wrangler Pages Functions + local D1):

```bash
npm run db:setup:local   # once: apply migrations + seed T/E
npm run dev              # http://localhost:5173  (/api proxied to :8788)
```

Aliases: `npm run dev:full` / `npm run dev:pages` (same as `dev`).

Frontend-only (no API): `npm run dev:vite` — login will 404.

Verify API:

```bash
curl -s -X POST http://127.0.0.1:8788/api/auth/login -H "content-type: application/json" -d "{\"email\":\"evelyn3@cox.net\",\"password\":\"Admin\"}"
```

## Production database (Cloudflare D1)

GYSH admin data (login, users, tasks, test statuses, content factory, audit) persists in **Cloudflare D1** (gysh-db), bound as DB in `wrangler.toml`. Pages Functions under `functions/api/` serve `/api/*`.

### Deploy (canonical — this repo only)

Always deploy from **side-hustle-hub** so Pages Functions (`functions/`), D1 (`wrangler.toml`), and `_routes.json` ship together:

```bash
npm run db:migrate   # after schema changes
npm run db:seed      # first time / reseeding
npm run deploy:pages
```

**Do not** run `wrangler pages deploy dist --project-name=getyoursidehustle` from `muntie-ev-ai-studio-main` (static `dist` only -> `/api` 404, including login).

Seed creates:
- `tinabarham@gmail.com` / `Admin123`
- `evelyn3@cox.net` / `Admin`

Re-running seed does **not** overwrite passwords that were changed later. Attachment **file blobs** still use browser IndexedDB until R2 (phase 2); metadata is in D1.

There is **no localStorage fallback** for structured admin data — if the API/DB is down, the UI shows an error.

## Email (Resend)

Transactional email uses **Resend** from Pages Functions (`RESEND_API_KEY` secret). See [docs/EMAIL.md](docs/EMAIL.md) for Cloudflare secrets, `.dev.vars`, and DNS (`notify.getyoursidehustle.com`).
