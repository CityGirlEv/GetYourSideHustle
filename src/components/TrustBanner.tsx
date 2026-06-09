import { ShieldCheck, EyeOff, KeyRound, Sparkles, ClipboardCheck, Search } from "lucide-react";

const items = [
  { icon: EyeOff, text: "No personal information collected" },
  { icon: KeyRound, text: "De-identified scenarios only" },
  { icon: ShieldCheck, text: "Your scenario is anonymous unless you opt in" },
  { icon: Search, text: "Find the optimal plan for your unique situation" },
  { icon: Sparkles, text: "Compare Original Medicare + Medigap vs. Medicare Advantage" },
  { icon: ClipboardCheck, text: "Live 2026 & 2027 CMS rules applied automatically" },
];

export function TrustBanner() {
  // Duplicate items once so the marquee loops seamlessly (animation translates -50%)
  const track = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-primary/5 border-y border-primary/10 py-1.5 mt-2.5">
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {track.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-xs text-foreground/80 mx-6 shrink-0"
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
