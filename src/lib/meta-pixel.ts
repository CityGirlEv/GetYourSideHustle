/** Meta (Facebook) Pixel — site-wide PageView + SPA route tracking. */

export const DEFAULT_META_PIXEL_ID = "2332130373986118";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function getMetaPixelId(): string | undefined {
  const flag = import.meta.env.VITE_META_PIXEL_ENABLED;
  if (flag === "false" || flag === "0") return undefined;

  const fromEnv = import.meta.env.VITE_META_PIXEL_ID?.trim();
  if (fromEnv === "false" || fromEnv === "0" || fromEnv === "") return undefined;
  if (fromEnv && /^\d+$/.test(fromEnv)) return fromEnv;

  return DEFAULT_META_PIXEL_ID;
}

export function isMetaPixelEnabled(): boolean {
  return Boolean(getMetaPixelId());
}

export function buildMetaPixelInitScript(pixelId: string): string {
  if (!/^\d+$/.test(pixelId)) {
    throw new Error("Meta Pixel ID must be numeric");
  }

  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

export function metaPixelNoscriptSrc(pixelId: string): string {
  if (!/^\d+$/.test(pixelId)) {
    throw new Error("Meta Pixel ID must be numeric");
  }
  return `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
}

/** Call on client-side route changes (initial PageView is in the head snippet). */
export function trackMetaPageView(): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

/** Standard Meta Pixel Lead event — fire only after a successful expert opt-in submit. */
export function trackMetaLead(details?: {
  scenarioCode?: string | null;
  source?: string;
}): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  const params: Record<string, string> = {
    content_name: "expert_contact_opt_in",
    content_category: "Medicare expert opt-in",
  };
  if (details?.scenarioCode) {
    params.content_ids = details.scenarioCode;
  }
  if (details?.source) {
    params.source = details.source;
  }

  window.fbq("track", "Lead", params);
}
