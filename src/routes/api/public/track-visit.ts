import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function getClientIp(request: Request): string | null {
  const h = request.headers;
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") || "").split(",")[0]?.trim(),
  ];
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return null;
}

async function lookupGeo(ip: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,query`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const j = await res.json() as any;
    if (j.status !== "success") return null;
    return {
      country: j.country ?? null,
      country_code: j.countryCode ?? null,
      region: j.regionName ?? j.region ?? null,
      city: j.city ?? null,
      postal: j.zip ?? null,
      latitude: typeof j.lat === "number" ? j.lat : null,
      longitude: typeof j.lon === "number" ? j.lon : null,
      timezone: j.timezone ?? null,
      isp: j.isp ?? null,
    };
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({} as any));
          const path = typeof body?.path === "string" ? body.path.slice(0, 1024) : null;
          const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 1024) : null;
          const userId = typeof body?.userId === "string" ? body.userId : null;
          const ip = getClientIp(request);
          const userAgent = request.headers.get("user-agent")?.slice(0, 1024) ?? null;

          const geo = ip ? await lookupGeo(ip) : null;

          const { error } = await supabaseAdmin.from("site_visits").insert({
            ip_address: ip,
            path,
            referrer,
            user_agent: userAgent,
            user_id: userId,
            ...(geo ?? {}),
          });
          if (error) {
            console.error("track-visit insert failed", error);
            return new Response("error", { status: 500 });
          }
          return new Response("ok");
        } catch (e) {
          console.error("track-visit handler error", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});