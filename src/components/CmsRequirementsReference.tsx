import { useEffect, useRef, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCollapsibleCard } from "@/components/GlassCollapsibleCard";
import {
  CMS_OFFICIAL_LINKS,
  CMS_REQUIREMENTS,
  cmsReferenceItemCount,
  numberedCmsOfficialLinks,
  numberedCmsRequirements,
} from "@/lib/cms-requirements-reference";
import type { SubmissionChecklistItem } from "@/lib/submission-checklist-data";
import { cn } from "@/lib/utils";
import { ClipboardList, ExternalLink, Scale, Shield } from "lucide-react";

export function CmsRequirementsReference({
  highlightId,
  linkedChecklistItemsByRequirementId,
  renderChecklistItem,
}: {
  /** Scroll to and highlight a requirement anchor (e.g. tpmo-disclaimer). */
  highlightId?: string | null;
  /** Checklist items grouped by CMS requirement id. */
  linkedChecklistItemsByRequirementId?: ReadonlyMap<string, SubmissionChecklistItem[]>;
  /** Renders interactive checklist item cards (prep/Catria checkboxes). */
  renderChecklistItem?: (item: SubmissionChecklistItem) => ReactNode;
}) {
  const highlightRef = useRef<HTMLLIElement | null>(null);
  const requirements = numberedCmsRequirements();
  const links = numberedCmsOfficialLinks();

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(highlightId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  const renderLinkedChecklistItems = (requirementId: string) => {
    const linkedItems = linkedChecklistItemsByRequirementId?.get(requirementId) ?? [];
    if (linkedItems.length === 0 || !renderChecklistItem) return null;

    const itemsList = (
      <div className="space-y-2">
        {linkedItems.map((checklistItem) => (
          <div key={checklistItem.id}>{renderChecklistItem(checklistItem)}</div>
        ))}
      </div>
    );

    return (
      <div className="pt-2 mt-2 border-t border-border/50">
        {linkedItems.length === 1 ? (
          itemsList
        ) : (
          <GlassCollapsibleCard
            title={`${linkedItems.length} linked checklist items`}
            subtitle="Items that map to this CMS requirement"
            icon={<ClipboardList className="h-3.5 w-3.5 text-primary" />}
            defaultOpen={highlightId === requirementId}
            className="border-border/60"
            contentClassName="space-y-2 pl-2 border-l-2 border-amber-500/30 ml-1"
          >
            {itemsList}
          </GlassCollapsibleCard>
        )}
      </div>
    );
  };

  return (
    <Card className="glass p-4 space-y-4 border-amber-500/25 bg-amber-500/5">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h2 className="font-display text-base font-bold">CMS requirements reference</h2>
          <Badge
            variant="outline"
            className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
          >
            TPMO / marketing compliance
          </Badge>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {cmsReferenceItemCount()} items
          </span>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Key Centers for Medicare &amp; Medicaid Services (CMS) rules for the Part B Optimizer
          educational benchmark tool and accompanying TPMO marketing. Use this alongside the
          checklist items — not a substitute for legal or compliance review.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            What CMS requires ({CMS_REQUIREMENTS.length})
          </h3>
          <ul className="space-y-2.5">
            {requirements.map((item) => (
              <li
                key={item.id}
                id={item.id}
                ref={highlightId === item.id ? highlightRef : undefined}
                className={cn(
                  "rounded-lg border border-border/70 bg-background/40 p-2.5 space-y-1 scroll-mt-24 transition-colors",
                  highlightId === item.id &&
                    "border-amber-500/60 bg-amber-500/15 ring-2 ring-amber-500/30",
                )}
              >
                <p className="text-sm font-semibold leading-snug">
                  {item.number}. {item.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                {item.citation ? (
                  <p className="text-[10px] font-mono text-muted-foreground/80">{item.citation}</p>
                ) : null}
                {renderLinkedChecklistItems(item.id)}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Official CMS &amp; Medicare.gov links ({CMS_OFFICIAL_LINKS.length})
          </h3>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-0.5 rounded-lg border border-border/70 bg-background/40 p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 leading-snug">
                    {link.number}. {link.title}
                    <ExternalLink
                      className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {link.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
