import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ACTIVEPROSPECT_TRUSTEDFORM_URL } from "@/lib/trustedform-client";
import { cn } from "@/lib/utils";

export const ACTIVEPROSPECT_LOGO_SRC = "/images/activeprospect-logo.png";

export const ACTIVEPROSPECT_LOGO_ALT =
  "ActiveProspect logo — TrustedForm lead certification";

type ActiveProspectCertificationBlurbProps = {
  className?: string;
  /** When true, omit outer Card wrapper (for use inside another Card). */
  embedded?: boolean;
};

export function ActiveProspectCertificationBlurb({
  className,
  embedded = false,
}: ActiveProspectCertificationBlurbProps) {
  const content = (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
      data-testid="activeprospect-certification-blurb"
    >
      <a
        href={ACTIVEPROSPECT_TRUSTEDFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 self-start sm:self-center rounded-md overflow-hidden bg-[var(--brand-navy)] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="ActiveProspect TrustedForm (opens in new tab)"
      >
        <img
          src={ACTIVEPROSPECT_LOGO_SRC}
          alt={ACTIVEPROSPECT_LOGO_ALT}
          className="h-8 w-auto sm:h-9 md:h-10 block"
          width={315}
          height={56}
        />
      </a>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            All leads are certified by{" "}
            <a
              href={ACTIVEPROSPECT_TRUSTEDFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline inline-flex items-center gap-0.5"
            >
              ActiveProspect
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </a>
          </span>
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          Every lead includes a TrustedForm certificate documenting consent at submission time.
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={cn("glass p-4 border-primary/15 bg-primary/5", className)}>
      {content}
    </Card>
  );
}
