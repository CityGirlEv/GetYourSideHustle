import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { internalSiteMapXmlEntries } from "@/lib/site-map";
import { publicSiteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/sitemap-internal.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = publicSiteUrl();
        const entries = internalSiteMapXmlEntries();

        const urls = entries
          .filter((e) => !e.parameterized)
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path.split("#")[0]}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
