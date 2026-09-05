/** Share one Promise across callers so duplicate in-flight work hits the network once. */
export function coalesceInFlight<T>(
  inflight: Map<string, Promise<unknown>>,
  key: string,
  start: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const started = start();
  inflight.set(key, started);
  return started.finally(() => {
    if (inflight.get(key) === started) inflight.delete(key);
  });
}

export function apiGetCoalesceKey(
  path: string,
  method: string,
  authToken: string | null,
): string | null {
  if (method.toUpperCase() !== "GET") return null;
  return `GET:${path}:${authToken ?? ""}`;
}
