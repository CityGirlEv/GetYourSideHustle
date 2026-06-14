export function getEnvVariable(name: string): string | undefined {
  hydrateRuntimeEnvFromBindings()

  const viteName = name.startsWith('VITE_') ? name : `VITE_${name}`;
  const rawName = name.startsWith('VITE_') ? name.slice(5) : name;

  // 1. Check injected runtime env (SSR / Cloudflare worker bindings)
  if (typeof globalThis !== 'undefined') {
    for (const bag of [
      (globalThis as any).__ENV__,
      (globalThis as any).__env__,
    ]) {
      if (!bag || typeof bag !== 'object') continue
      const fromRaw = trimEnvValue(bag[rawName])
      if (fromRaw) return fromRaw
      const fromVite = trimEnvValue(bag[viteName])
      if (fromVite) return fromVite
    }
  }

  // 2. Check import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const fromRaw = trimEnvValue(import.meta.env[rawName] as string | undefined)
    if (fromRaw) return fromRaw
    const fromVite = trimEnvValue(import.meta.env[viteName] as string | undefined)
    if (fromVite) return fromVite
  }

  // 3. Check process.env (Node or build time)
  if (typeof process !== 'undefined' && process.env) {
    const fromRaw = trimEnvValue(process.env[rawName])
    if (fromRaw) return fromRaw
    const fromVite = trimEnvValue(process.env[viteName])
    if (fromVite) return fromVite
  }

  // 4. Check Cloudflare context via event-storage
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as Record<symbol, any>)[storageKey];
    const store = storage?.getStore();
    const event = store?.h3Event;
    const cfEnv = (event?.context as any)?.cloudflare?.env;
    if (cfEnv) {
      const fromRaw = trimEnvValue(cfEnv[rawName])
      if (fromRaw) return fromRaw
      const fromVite = trimEnvValue(cfEnv[viteName])
      if (fromVite) return fromVite
    }
  } catch {}

  return undefined;
}

function trimEnvValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function readBindingSecret(
  bag: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  if (!bag || typeof bag !== 'object') return undefined
  return trimEnvValue(bag[name])
}

function readCloudflareContextSecret(name: string): string | undefined {
  try {
    const storageKey = Symbol.for('tanstack-start:event-storage')
    const storage = (globalThis as Record<symbol, any>)[storageKey]
    const cfEnv = storage?.getStore()?.h3Event?.context?.cloudflare?.env
    return readBindingSecret(cfEnv, name)
  } catch {
    return undefined
  }
}

function isPlaceholderSecret(value: string): boolean {
  return /your_.*api_key/i.test(value) || /^re_your_/i.test(value)
}

function isUsableSecret(name: string, value: string | undefined): value is string {
  if (!value) return false
  if (isPlaceholderSecret(value)) return false
  if (name === 'RESEND_API_KEY') {
    if (!/^re_[A-Za-z0-9_]{10,}$/.test(value)) return false
  }
  if (name === 'LOVABLE_API_KEY') {
    if (value.length < 16) return false
  }
  return true
}

let runtimeEnvHydrated = false

function hydrateRuntimeEnvFromBindings() {
  if (runtimeEnvHydrated || typeof globalThis === 'undefined') return
  runtimeEnvHydrated = true

  for (const bag of [(globalThis as any).__env__, (globalThis as any).__ENV__]) {
    if (!bag || typeof bag !== 'object') continue
    for (const [key, value] of Object.entries(bag)) {
      if (typeof value === 'string' && value && typeof process !== 'undefined' && process.env) {
        process.env[key] ??= value
      }
    }
  }
}

function isLocalDev(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return false
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) return true
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') return true
  return false
}

/** Read a secret from runtime bindings, including Cloudflare `env` bags. */
export function getRuntimeSecret(name: string): string | undefined {
  hydrateRuntimeEnvFromBindings()

  const candidates: string[] = []

  // Local dev: .env should win over stale Cloudflare remote bindings in vite dev.
  if (isLocalDev() && typeof process !== 'undefined' && process.env) {
    const fromProcess = trimEnvValue(process.env[name])
    if (fromProcess) candidates.push(fromProcess)
  }

  if (typeof globalThis !== 'undefined') {
    for (const bag of [(globalThis as any).__env__, (globalThis as any).__ENV__]) {
      const value = readBindingSecret(bag, name)
      if (value) candidates.push(value)
    }
  }

  const fromContext = readCloudflareContextSecret(name)
  if (fromContext) candidates.push(fromContext)

  if (typeof process !== 'undefined' && process.env) {
    const fromProcess = trimEnvValue(process.env[name])
    if (fromProcess) candidates.push(fromProcess)
  }

  for (const value of candidates) {
    if (isUsableSecret(name, value)) return value
  }

  return undefined
}
