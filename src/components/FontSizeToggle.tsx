import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Type } from "lucide-react";
import { ROOT_FONT_SIZE_PX } from "@/lib/typography";
import { cn } from "@/lib/utils";

const STEPS = [1, 1.125, 1.25, 1.4];
const STORAGE_KEY = "font-scale";

function applyScale(scale: number) {
  document.documentElement.style.fontSize = `${ROOT_FONT_SIZE_PX * scale}px`;
}

export function FontSizeToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [idx, setIdx] = useState(1);
  const onDark = tone === "dark";

  useEffect(() => {
    const saved = parseFloat(localStorage.getItem(STORAGE_KEY) || "1");
    const i = Math.max(
      0,
      STEPS.findIndex((s) => Math.abs(s - saved) < 0.01),
    );
    const safeIdx = i === -1 ? 1 : i;
    setIdx(safeIdx);
    applyScale(STEPS[safeIdx]);
  }, []);

  const decrease = () => {
    const next = Math.max(0, idx - 1);
    if (next !== idx) {
      setIdx(next);
      applyScale(STEPS[next]);
      localStorage.setItem(STORAGE_KEY, String(STEPS[next]));
    }
  };

  const increase = () => {
    const next = Math.min(STEPS.length - 1, idx + 1);
    if (next !== idx) {
      setIdx(next);
      applyScale(STEPS[next]);
      localStorage.setItem(STORAGE_KEY, String(STEPS[next]));
    }
  };

  const canDecrease = idx > 0;
  const canIncrease = idx < STEPS.length - 1;

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full px-1 py-0.5 shrink-0",
        onDark ? "bg-white/10" : "bg-primary/10 border border-primary/15",
      )}
      aria-label="Text size"
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={decrease}
        disabled={!canDecrease}
        title="Decrease text size"
        aria-label="Decrease text size"
        className={cn(
          "h-7 w-7 disabled:opacity-30",
          onDark
            ? "text-white/80 hover:text-white hover:bg-white/10"
            : "text-primary/80 hover:text-primary hover:bg-primary/10",
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <div className="flex items-center gap-1 px-1">
        <Type className={cn("h-3.5 w-3.5", onDark ? "text-white/70" : "text-primary/70")} />
        <span
          className={cn(
            "text-xs font-semibold w-8 text-center tabular-nums",
            onDark ? "text-white" : "text-primary",
          )}
        >
          {Math.round(STEPS[idx] * 100)}%
        </span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={increase}
        disabled={!canIncrease}
        title="Increase text size"
        aria-label="Increase text size"
        className={cn(
          "h-7 w-7 disabled:opacity-30",
          onDark
            ? "text-white/80 hover:text-white hover:bg-white/10"
            : "text-primary/80 hover:text-primary hover:bg-primary/10",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
