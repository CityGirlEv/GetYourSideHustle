import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, Presentation } from "lucide-react";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  END_USER_GUIDE_PPTX_FILENAME,
  endUserGuidePptxPath,
  officeOnlinePptxEmbedUrl,
} from "@/lib/training-assets";
import { publicSiteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/admin_/training")({
  component: AdminTrainingPage,
  head: () => ({
    meta: [
      { title: "Training — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminTrainingPage() {
  const downloadPath = endUserGuidePptxPath();
  const absoluteFileUrl = `${publicSiteUrl()}${downloadPath}`;
  const embedUrl = officeOnlinePptxEmbedUrl(absoluteFileUrl);
  const siteOrigin = publicSiteUrl();
  const canEmbed =
    !siteOrigin.includes("localhost") && !siteOrigin.includes("127.0.0.1");

  return (
    <AdminAccessGate>
      <AppShell
        title="Training"
        subtitle="End-user guide and onboarding materials"
      >
        <div className="max-w-5xl mx-auto space-y-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>

          <Card className="glass p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="font-display text-lg font-bold">Part B Optimizer End User Guide</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Walkthrough deck for the benchmark tool, report tabs, and workbook — generated from
                  live app screenshots.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button asChild size="sm" className="gap-1.5">
                  <a href={downloadPath} download={END_USER_GUIDE_PPTX_FILENAME}>
                    <Download className="h-4 w-4" />
                    Download PowerPoint
                  </a>
                </Button>
                {!canEmbed ? (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open viewer
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            {!canEmbed ? (
              <p className="text-xs text-muted-foreground rounded-md border border-border bg-muted/30 px-3 py-2 leading-relaxed">
                In-browser slide view uses Microsoft Office Online and needs a public HTTPS URL. On
                localhost, download the file or run{" "}
                <code className="text-[11px]">npm run generate:user-guide-pptx</code> (dev server on
                port 8081) to refresh{" "}
                <code className="text-[11px]">public/downloads/{END_USER_GUIDE_PPTX_FILENAME}</code>.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden bg-background">
                <iframe
                  title="Part B Optimizer End User Guide"
                  src={embedUrl}
                  className="w-full aspect-video min-h-[28rem]"
                  allowFullScreen
                />
              </div>
            )}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Regenerate after UI changes: start the dev server, then{" "}
              <code className="text-[10px]">npm run generate:user-guide-pptx</code>. Commit the updated
              file in <code className="text-[10px]">public/downloads/</code> for production.
            </p>
          </Card>
        </div>
      </AppShell>
    </AdminAccessGate>
  );
}
