import { createFileRoute } from "@tanstack/react-router";
import { SiteMapPage } from "@/components/SiteMapPage";
import { publicSiteMapSections } from "@/lib/site-map";
import { SITE_BRAND_NAME } from "@/lib/medicare-disclaimers";

export const Route = createFileRoute("/sitemap")({
  component: PublicSiteMapPage,
  head: () => ({
    meta: [
      { title: `Site Map — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content: "Browse all public pages on MyPartB.com — benchmark tool, Learning Center, legal, and account pages.",
      },
    ],
  }),
});

function PublicSiteMapPage() {
  return (
    <SiteMapPage
      title="Site map"
      subtitle="Public pages on MyPartB.com"
      sections={publicSiteMapSections()}
    />
  );
}
