import { ShieldCheck, EyeOff, KeyRound, Sparkles, ClipboardCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: EyeOff, text: "No personal information collected" },
  { icon: KeyRound, text: "De-identified scenarios only" },
  { icon: ShieldCheck, text: "Your scenario is anonymous unless you opt in" },
  { icon: Search, text: "Find the optimal plan for your unique situation" },
  { icon: Sparkles, text: "Compare Original Medicare + Medigap vs. Medicare Advantage" },
  { icon: ClipboardCheck, text: "Live 2026 & 2027 CMS rules applied automatically" },
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
