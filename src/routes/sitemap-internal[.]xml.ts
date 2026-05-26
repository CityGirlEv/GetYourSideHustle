import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://themedicareoptimizer.lovable.app";

// Internal sitemap — full surface area including authenticated staff areas
// (admin, advisor, agent, QA, testing, sources, tasks, users). Not intended
// for public search engines; robots.txt disallows it.
const ALL_ENTRIES: { path: string; changefreq?: string; priority?: string }[] = [
  // Public surface
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/scenario/new", changefreq: "weekly", priority: "0.9" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
  { path: "/register", changefreq: "monthly", priority: "0.4" },
  { path: "/reset-password", changefreq: "yearly", priority: "0.2" },
  { path: "/nda", changefreq: "yearly", priority: "0.2" },

  // Authenticated staff surface
  { path: "/admin", changefreq: "weekly", priority: "0.6" },
  { path: "/advisor", changefreq: "weekly", priority: "0.6" },
  { path: "/agent", changefreq: "weekly", priority: "0.6" },
  { path: "/qa", changefreq: "weekly", priority: "0.5" },
  { path: "/testing", changefreq: "weekly", priority: "0.5" },
  { path: "/sources", changefreq: "monthly", priority: "0.4" },
  { path: "/tasks", changefreq: "weekly", priority: "0.5" },
  { path: "/users", changefreq: "monthly", priority: "0.4" },

  // Dynamic scenario routes (parameterized — listed as patterns for reference)
  { path: "/scenario/$code", changefreq: "weekly", priority: "0.5" },
  { path: "/scenario/created/$code", changefreq: "weekly", priority: "0.5" },
  { path: "/advisor/scenario/$code", changefreq: "weekly", priority: "0.5" },
  { path: "/advisor/scenario/$code/edit", changefreq: "weekly", priority: "0.5" },
  { path: "/agent/scenario/$code", changefreq: "weekly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap-internal.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = ALL_ENTRIES.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
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