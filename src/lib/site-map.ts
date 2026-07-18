import { listPublishedArticleSlugs } from "@/lib/articles";
import {
  ADMIN_CONTENT_GROUP,
  ADMIN_DASHBOARD_LINK,
  ADMIN_OPERATION_LINKS,
  ADMIN_QA_GROUP,
  ADMIN_REFERENCE_LINKS,
  ADMIN_STAFF_GROUP,
} from "@/lib/admin-nav-config";

export type SiteMapEntry = {
  path: string;
  label: string;
  description?: string;
  /** Route pattern — not directly linkable in the UI. */
  parameterized?: boolean;
};

export type SiteMapSection = {
  title: string;
  description?: string;
  entries: SiteMapEntry[];
};

export type SiteMapXmlEntry = SiteMapEntry & {
  changefreq?: string;
  priority?: string;
};

const PUBLIC_STATIC: SiteMapXmlEntry[] = [
  { path: "/", label: "Home", changefreq: "weekly", priority: "1.0" },
  { path: "/about", label: "About", changefreq: "monthly", priority: "0.7" },
  { path: "/features", label: "Features", changefreq: "monthly", priority: "0.8" },
  { path: "/scenario/new", label: "Part B Optimizer Benchmark Tool", changefreq: "weekly", priority: "0.9" },
  { path: "/scenario/old", label: "Previous benchmark tool", changefreq: "monthly", priority: "0.6" },
  { path: "/workbook", label: "PBO Turning 65 Workbook", changefreq: "monthly", priority: "0.7" },
  { path: "/learning-center", label: "Learning Center", changefreq: "weekly", priority: "0.8" },
  { path: "/subscribe", label: "Newsletter subscribe", changefreq: "monthly", priority: "0.5" },
  { path: "/sitemap", label: "Site map", changefreq: "monthly", priority: "0.4" },
  { path: "/auth", label: "Sign in", changefreq: "monthly", priority: "0.4" },
  { path: "/register", label: "Beta registration", changefreq: "monthly", priority: "0.4" },
  { path: "/reset-password", label: "Reset password", changefreq: "yearly", priority: "0.2" },
  { path: "/nda", label: "NDA", changefreq: "yearly", priority: "0.2" },
  { path: "/legal", label: "Legal & privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/unsubscribe", label: "Email unsubscribe", changefreq: "yearly", priority: "0.2" },
];

function navLinksToEntries(
  links: Array<{ label: string; to: string; hash?: string }>,
): SiteMapEntry[] {
  return links.map((link) => ({
    path: link.hash ? `${link.to}#${link.hash}` : link.to,
    label: link.label,
  }));
}

/** Crawlable public routes for sitemap.xml. */
export function publicSiteMapXmlEntries(): SiteMapXmlEntry[] {
  const articles = listPublishedArticleSlugs().map((slug) => ({
    path: `/learning-center/${slug}`,
    label: slug,
    changefreq: "weekly",
    priority: "0.7",
  }));
  return [...PUBLIC_STATIC, ...articles];
}

/** Full inventory for sitemap-internal.xml (staff reference; not for search engines). */
export function internalSiteMapXmlEntries(): SiteMapXmlEntry[] {
  const adminRoutes: SiteMapXmlEntry[] = [
    { path: ADMIN_DASHBOARD_LINK.to, label: ADMIN_DASHBOARD_LINK.label, changefreq: "weekly", priority: "0.6" },
    ...navLinksToEntries(ADMIN_CONTENT_GROUP.items).map((e) => ({
      ...e,
      changefreq: "weekly",
      priority: "0.5",
    })),
    ...navLinksToEntries(ADMIN_OPERATION_LINKS).map((e) => ({
      ...e,
      changefreq: "weekly",
      priority: "0.5",
    })),
    ...navLinksToEntries(ADMIN_STAFF_GROUP.items).map((e) => ({
      ...e,
      changefreq: "monthly",
      priority: "0.4",
    })),
    ...navLinksToEntries(ADMIN_QA_GROUP.items).map((e) => ({
      ...e,
      changefreq: "weekly",
      priority: "0.5",
    })),
    ...navLinksToEntries(ADMIN_REFERENCE_LINKS).map((e) => ({
      ...e,
      changefreq: "monthly",
      priority: "0.4",
    })),
    { path: "/admin/budget", label: "Project budget", changefreq: "monthly", priority: "0.4" },
  ];

  const staffRoutes: SiteMapXmlEntry[] = [
    { path: "/advisor", label: "Advisor dashboard", changefreq: "weekly", priority: "0.6" },
    { path: "/agent", label: "Agent dashboard", changefreq: "weekly", priority: "0.6" },
    { path: "/qa", label: "QA dashboard", changefreq: "weekly", priority: "0.5" },
    { path: "/qa-manual", label: "QA manual", changefreq: "monthly", priority: "0.4" },
    { path: "/testing", label: "Testing portal", changefreq: "weekly", priority: "0.5" },
    { path: "/tasks", label: "Task sheet", changefreq: "weekly", priority: "0.5" },
    { path: "/visits", label: "Visits", changefreq: "monthly", priority: "0.3" },
  ];

  const dynamicRoutes: SiteMapXmlEntry[] = [
    {
      path: "/scenario/$code",
      label: "Legacy scenario report",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/scenario/created/$code",
      label: "Scenario created confirmation",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/scenario/estimate/$code",
      label: "Benchmark report (BM- code)",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/advisor/scenario/$code",
      label: "Advisor scenario view",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/advisor/scenario/$code/edit",
      label: "Advisor scenario edit",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/agent/scenario/$code",
      label: "Agent scenario view",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.5",
    },
    {
      path: "/learning-center/$slug",
      label: "Learning Center article",
      parameterized: true,
      changefreq: "weekly",
      priority: "0.7",
    },
  ];

  return [...publicSiteMapXmlEntries(), ...adminRoutes, ...staffRoutes, ...dynamicRoutes];
}

/** Human-readable end-user site map sections. */
export function publicSiteMapSections(): SiteMapSection[] {
  const articles = listPublishedArticleSlugs().map((slug) => ({
    path: `/learning-center/${slug}`,
    label: slug.replace(/-/g, " "),
  }));

  return [
    {
      title: "Main pages",
      entries: PUBLIC_STATIC.filter((e) =>
        ["/", "/about", "/sitemap"].includes(e.path),
      ),
    },
    {
      title: "Tools & resources",
      description: "Free Medicare education and the Part B Optimizer benchmark.",
      entries: PUBLIC_STATIC.filter((e) =>
        [
          "/scenario/new",
          "/scenario/old",
          "/workbook",
          "/features",
          "/learning-center",
          "/subscribe",
        ].includes(e.path),
      ),
    },
    {
      title: "Account",
      entries: PUBLIC_STATIC.filter((e) =>
        ["/auth", "/register", "/reset-password", "/unsubscribe"].includes(e.path),
      ),
    },
    {
      title: "Legal",
      entries: PUBLIC_STATIC.filter((e) => ["/legal", "/nda"].includes(e.path)),
    },
    {
      title: "Learning Center articles",
      description: articles.length > 0 ? `${articles.length} published articles` : "No articles published yet.",
      entries: articles,
    },
  ];
}

/** Complete site map for administrators — every route area in the product. */
export function adminSiteMapSections(): SiteMapSection[] {
  return [
    {
      title: "Public site",
      description: "Same pages visitors can reach without staff credentials.",
      entries: publicSiteMapXmlEntries().map(({ path, label, parameterized }) => ({
        path,
        label,
        parameterized,
      })),
    },
    {
      title: "Admin",
      entries: [
        { path: ADMIN_DASHBOARD_LINK.to, label: ADMIN_DASHBOARD_LINK.label },
        ...navLinksToEntries(ADMIN_CONTENT_GROUP.items),
        ...navLinksToEntries(ADMIN_OPERATION_LINKS),
        { path: "/admin/budget", label: "Project budget" },
      ],
    },
    {
      title: "Users & staff",
      entries: navLinksToEntries(ADMIN_STAFF_GROUP.items),
    },
    {
      title: "QA & testing",
      entries: navLinksToEntries(ADMIN_QA_GROUP.items),
    },
    {
      title: "Reference",
      entries: navLinksToEntries(ADMIN_REFERENCE_LINKS),
    },
    {
      title: "Advisor & agent portals",
      entries: [
        { path: "/advisor", label: "Advisor dashboard" },
        { path: "/agent", label: "Agent dashboard" },
        { path: "/tasks", label: "Task sheet" },
        { path: "/visits", label: "Visits log" },
      ],
    },
    {
      title: "Dynamic routes",
      description: "Parameterized URLs — replace $code or $slug with a real value.",
      entries: internalSiteMapXmlEntries()
        .filter((e) => e.parameterized)
        .map(({ path, label }) => ({ path, label, parameterized: true })),
    },
    {
      title: "Machine-readable sitemaps",
      entries: [
        { path: "/sitemap.xml", label: "Public XML sitemap" },
        { path: "/sitemap-internal.xml", label: "Internal XML sitemap (staff inventory)" },
      ],
    },
  ];
}
