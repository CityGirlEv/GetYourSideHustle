import { Phone } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CMS_PARTNER_CTA } from "@/lib/lead-consent";
import { LEAD_TYPES } from "@/lib/lead-types";
import { trackLeadEvent } from "@/lib/track-lead-event";
import { cn } from "@/lib/utils";

type CmsPartnerCtaButtonProps = Omit<ButtonProps, "children"> & {
  scenarioCode?: string | null;
  /** Single-line label for dense toolbars (e.g. benchmark report actions). */
  compact?: boolean;
};

/** Partner opt-in CTA — two-line layout on full-width buttons for narrow screens. */
export function CmsPartnerCtaButton({
  className,
  scenarioCode,
  compact = false,
  onClick,
  ...props
}: CmsPartnerCtaButtonProps) {
  const ctaLabel = CMS_PARTNER_CTA;

  return (
    <Button
      type="button"
      title={compact ? ctaLabel : undefined}
      className={cn(
        "cms-partner-cta-button gap-2",
        compact
          ? "h-8 shrink-0 whitespace-nowrap px-2.5 text-xs"
          : "h-auto min-h-11 w-full whitespace-normal py-2.5 leading-snug",
        className,
      )}
      onClick={(event) => {
        trackLeadEvent({
          leadType: LEAD_TYPES.AGENT_CTA_CLICK,
          scenarioCode,
          ctaLabel,
        });
        onClick?.(event);
      }}
      {...props}
    >
      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {compact ? (
        <span>{CMS_PARTNER_CTA}</span>
      ) : (
        <span className="min-w-0 text-center leading-tight">
          <span className="block">Connect with</span>
          <span className="block">Licensed Agent</span>
        </span>
      )}
    </Button>
  );
}
