import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_CONTENT_GROUP } from "@/lib/admin-nav-config";

/** Quick links to editorial tools — shown on admin dashboard and similar surfaces. */
export function AdminContentPublishingLinks() {
  return (
    <Card className="glass mb-4 p-4 border-indigo-500/20 bg-indigo-500/5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <h2 className="font-display text-sm font-bold">Content publishing</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Weekly editorial calendar, Content Factory drafts, Facebook post copy, and Learning
            Center articles. Open from here or via Admin → Content in the top navigation.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {ADMIN_CONTENT_GROUP.items.map((item) => {
          const Icon = item.icon;
          return (
            <Button key={item.to} asChild size="sm" variant="outline" className="h-8 text-xs">
              <Link to={item.to}>
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Requires admin role — the Admin menu in the header is only visible when signed in as an
        administrator.
      </p>
    </Card>
  );
}
