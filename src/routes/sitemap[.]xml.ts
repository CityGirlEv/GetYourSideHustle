import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedArticleSlugs } from "@/lib/articles";
import { publicSiteUrl } from "@/lib/site-url";

// Public sitemap — only routes a non-logged-in visitor can reach and use.
// Staff/admin areas are intentionally excluded; see /sitemap-internal.xml.
const PUBLIC_ENTRIES: { path: string; changefreq?: string; priority?: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/scenario/new", changefreq: "weekly", priority: "0.9" },
  { path: "/learning-center", changefreq: "weekly", priority: "0.8" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
  { path: "/register", changefreq: "monthly", priority: "0.4" },
  { path: "/reset-password", changefreq: "yearly", priority: "0.2" },
  { path: "/nda", changefreq: "yearly", priority: "0.2" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = publicSiteUrl();
        const entries = [
          ...PUBLIC_ENTRIES,
          ...listPublishedArticleSlugs().map((slug) => ({
            path: `/learning-center/${slug}`,
            changefreq: "weekly",
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
