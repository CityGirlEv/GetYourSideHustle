/**
 * Scheduled Worker: hit GYSH Pages cron endpoint at ~12:01 America/Chicago.
 * Secrets: CRON_SECRET (must match Pages CRON_SECRET).
 */

export interface Env {
  CRON_SECRET: string;
  DIGEST_API_URL: string;
}

async function invokeDigest(env: Env, force = false): Promise<Response> {
  const url = new URL(env.DIGEST_API_URL || "https://getyoursidehustle.com/api/cron/daily-digest");
  if (force) url.searchParams.set("force", "1");
  return fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET}`,
      "x-cron-secret": env.CRON_SECRET,
    },
  });
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const res = await invokeDigest(env, false);
        const text = await res.text();
        console.log(`daily-digest cron status=${res.status} body=${text.slice(0, 500)}`);
      })(),
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const res = await invokeDigest(env, url.searchParams.get("force") === "1");
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") || "application/json" },
      });
    }
    return new Response("gysh-daily-digest worker ok", { status: 200 });
  },
};
