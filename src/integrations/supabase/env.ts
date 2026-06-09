import { getEvent } from "@tanstack/react-start/server";

export function getSupabaseEnv() {
  let url = typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined;
  let key = typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined;
  let serviceKey = typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

  try {
    const event = getEvent();
    const env = (event?.context as { cloudflare?: { env?: Record<string, unknown> } })?.cloudflare?.env;
    if (env) {
      if (typeof env.SUPABASE_URL === "string") {
        url = url || env.SUPABASE_URL;
      }
      if (typeof env.SUPABASE_PUBLISHABLE_KEY === "string") {
        key = key || env.SUPABASE_PUBLISHABLE_KEY;
      }
      if (typeof env.SUPABASE_SERVICE_ROLE_KEY === "string") {
        serviceKey = serviceKey || env.SUPABASE_SERVICE_ROLE_KEY;
      }
    }
  } catch {
    // getEvent throws if executed outside request context (e.g. client side or test setup)
  }

  return {
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: key,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };
}
