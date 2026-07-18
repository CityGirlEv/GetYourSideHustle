import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import appCss from "../styles.css?url";
import { AppProvider } from "@/lib/app-store";
import { CartProvider } from "@/lib/cart-store";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { QAOnboardingGate } from "@/components/QAOnboardingDialog";
import { DeployVersionGate } from "@/components/DeployVersionGate";
import { AuthRecoveryGate } from "@/components/auth/AuthRecoveryGate";
import { supabase } from "@/integrations/supabase/client";
import { getEnvVariable } from "@/lib/env";
import {
  buildMetaPixelInitScript,
  getMetaPixelId,
  metaPixelNoscriptSrc,
  trackMetaPageView,
} from "@/lib/meta-pixel";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { ogImageUrl } from "@/lib/site-url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const showDetails = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {showDetails && error?.message ? (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-xs text-destructive break-words">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_BRAND_NAME },
      {
        name: "description",
        content:
          "AI-powered Medicare plan optimizer & advisor platform using de-identified scenarios for 2026 and 2027 federal guidelines. No personal information is collected.",
      },
      { name: "author", content: SITE_BRAND_NAME },
      { property: "og:title", content: SITE_BRAND_NAME },
      {
        property: "og:description",
        content:
          "AI-powered Medicare plan optimizer & advisor platform using de-identified scenarios for 2026 and 2027 federal guidelines. No personal information is collected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: SITE_BRAND_NAME },
      {
        name: "twitter:description",
        content:
          "AI-powered Medicare plan optimizer & advisor platform using de-identified scenarios for 2026 and 2027 federal guidelines. No personal information is collected.",
      },
      {
        property: "og:image",
        content: ogImageUrl(),
      },
      {
        name: "twitter:image",
        content: ogImageUrl(),
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const env: Record<string, string> = {};
  const publicVars = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"];
  for (const name of publicVars) {
    const val = getEnvVariable(name);
    if (val) {
      env[name] = val;
      env[`VITE_${name}`] = val;
    }
  }

  const envScript = `if (!window.__ENV__) { window.__ENV__ = ${JSON.stringify(env)}; }`;
  const fontScaleScript = `(function(){try{var s=localStorage.getItem("font-scale");var scale=s?parseFloat(s):1;if(!isNaN(scale)&&scale>0){document.documentElement.style.fontSize=(16*scale)+"px"}}catch(e){}})();`;
  const metaPixelId = getMetaPixelId();

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
        <script dangerouslySetInnerHTML={{ __html: fontScaleScript }} />
        {metaPixelId ? (
          <script
            dangerouslySetInnerHTML={{ __html: buildMetaPixelInitScript(metaPixelId) }}
          />
        ) : null}
      </head>
      <body>
        {children}
        {metaPixelId ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={metaPixelNoscriptSrc(metaPixelId)}
            />
          </noscript>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastTrackedRef = useRef<string | null>(null);
  const metaPixelBootedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (metaPixelBootedRef.current) {
      trackMetaPageView();
    } else {
      metaPixelBootedRef.current = true;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;
    (async () => {
      let userId: string | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      } catch {}
      try {
        await fetch("/api/public/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            userId,
          }),
          keepalive: true,
        });
      } catch {}
    })();
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <CartProvider>
          <ConfirmProvider>
            <Outlet />
            <AuthRecoveryGate />
            <QAOnboardingGate />
            <DeployVersionGate />
            <Toaster position="top-right" richColors />
          </ConfirmProvider>
        </CartProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
