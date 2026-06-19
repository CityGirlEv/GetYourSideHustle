/**
 * Wrangler auth for Workers Builds CI.
 * A manually-set CLOUDFLARE_API_TOKEN (often Workers-only) overrides the
 * credentials Workers Builds injects and breaks `pages deploy` (error 10000).
 */
export function stripWranglerApiTokenFromProcessEnv() {
  delete process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.WRANGLER_API_KEY;
}

export function wranglerSpawnEnv() {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  delete env.WRANGLER_API_KEY;
  return env;
}
