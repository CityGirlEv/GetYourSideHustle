import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MEDICARE_GOV_URL } from "@/lib/medicare-disclaimers";

export function LearningCenterCta({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-primary/20 bg-primary/5 ${compact ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-4"}`}
    >
      <div className="space-y-1 text-center sm:text-left">
        <h3 className={`font-display font-bold text-primary ${compact ? "text-lg" : "text-xl"}`}>
          Ready to compare sample plans?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build a de-identified Medicare scenario in about two minutes — no account, no Social
          Security number, and no enrollment commitment.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Button asChild className="grad-indigo font-semibold text-primary-foreground">
          <Link to="/scenario/new">
            Build my scenario <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="font-medium">
          <a href={MEDICARE_GOV_URL} target="_blank" rel="noopener noreferrer">
            Visit Medicare.gov <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Educational tool only. We do not sell insurance or enroll you in coverage.
      </p>
    </div>
  );
}
