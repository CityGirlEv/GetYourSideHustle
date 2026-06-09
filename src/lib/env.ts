export function getEnvVariable(name: string): string | undefined {
  const viteName = name.startsWith('VITE_') ? name : `VITE_${name}`;
  const rawName = name.startsWith('VITE_') ? name.slice(5) : name;

  // 1. Check window.__ENV__ or globalThis.__ENV__ injected during SSR/routing
  if (typeof globalThis !== 'undefined') {
    const globalEnv = (globalThis as any).__ENV__;
    if (globalEnv) {
      if (typeof globalEnv[rawName] === 'string') return globalEnv[rawName];
      if (typeof globalEnv[viteName] === 'string') return globalEnv[viteName];
    }
  }

  // 2. Check import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (typeof import.meta.env[rawName] === 'string') return import.meta.env[rawName] as string;
    if (typeof import.meta.env[viteName] === 'string') return import.meta.env[viteName] as string;
  }

  // 3. Check process.env (Node or build time)
  if (typeof process !== 'undefined' && process.env) {
    if (typeof process.env[rawName] === 'string') return process.env[rawName];
    if (typeof process.env[viteName] === 'string') return process.env[viteName];
  }

  // 4. Check Cloudflare context via event-storage
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as Record<symbol, any>)[storageKey];
    const store = storage?.getStore();
    const event = store?.h3Event;
    const cfEnv = (event?.context as any)?.cloudflare?.env;
    if (cfEnv) {
      if (typeof cfEnv[rawName] === "string") return cfEnv[rawName];
      if (typeof cfEnv[viteName] === "string") return cfEnv[viteName];
    }
  } catch {}

  return undefined;
}
