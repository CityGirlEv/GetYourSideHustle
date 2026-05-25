import { ShieldCheck, EyeOff, KeyRound } from "lucide-react";

const items = [
  { icon: EyeOff, text: "No personal information collected" },
  { icon: KeyRound, text: "De-identified scenarios only" },
  { icon: ShieldCheck, text: "Your scenario is anonymous unless you opt in" },
];

export function TrustBanner() {
  // Duplicate items so the marquee loops seamlessly
  const track = [...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-y border-border/60 py-2 my-4">
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {track.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-xs text-muted-foreground mx-6 shrink-1"
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
