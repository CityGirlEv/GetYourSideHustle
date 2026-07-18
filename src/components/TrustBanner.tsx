import { ShieldCheck, EyeOff, KeyRound, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPARISON_ANONYMOUS_UNLESS_OPT_IN,
  DEIDENTIFIED_COMPARISONS_ONLY,
  BENCHMARK_TOOL_CTA,
  PLAN_COMPARISON_CTA,
  TRUST_BANNER_NO_PHI_PII,
} from "@/lib/plan-comparison-copy";

const items = [
  { icon: EyeOff, text: TRUST_BANNER_NO_PHI_PII },
  { icon: KeyRound, text: DEIDENTIFIED_COMPARISONS_ONLY },
  { icon: ShieldCheck, text: COMPARISON_ANONYMOUS_UNLESS_OPT_IN },
  { icon: Search, text: BENCHMARK_TOOL_CTA },
  { icon: Sparkles, text: PLAN_COMPARISON_CTA },
];

interface TrustBannerProps {
  className?: string;
}

export function TrustBanner({ className }: TrustBannerProps) {
  // Duplicate items once so the marquee loops seamlessly (animation translates -50%)
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "w-full overflow-hidden border-b border-white/15 bg-[var(--brand-navy-mid)] py-1.5",
        className,
      )}
    >
      <div className="relative w-full overflow-hidden isolate">
        <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap">
          {track.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-xs font-bold text-white/95 shrink-0"
            >
              <item.icon className="h-3.5 w-3.5 text-emerald shrink-0" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
