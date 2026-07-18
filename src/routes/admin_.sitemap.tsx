import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { SiteMapPage } from "@/components/SiteMapPage";
import { Button } from "@/components/ui/button";
import { adminSiteMapSections } from "@/lib/site-map";

export const Route = createFileRoute("/admin_/sitemap")({
  component: AdminSiteMapPage,
  head: () => ({
    meta: [
      { title: "Site Map — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminSiteMapPage() {
  return (
    <AdminAccessGate>
      <div className="space-y-3">
        <div className="max-w-3xl mx-auto px-1">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
        <SiteMapPage
          title="Complete site map"
          subtitle="All public, staff, and admin routes — administrators only"
          sections={adminSiteMapSections()}
        />
      </div>
    </AdminAccessGate>
  );
}
