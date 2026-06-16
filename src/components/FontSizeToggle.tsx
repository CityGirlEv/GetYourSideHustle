import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Type } from "lucide-react";

const STEPS = [1, 1.125, 1.25, 1.4];
const STORAGE_KEY = "font-scale";
const BASE_PX = 18;

function applyScale(scale: number) {
  document.documentElement.style.fontSize = `${BASE_PX * scale}px`;
}

export function FontSizeToggle() {
  const [idx, setIdx] = useState(1);

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
    const next = Math.max(1, idx - 1);
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
    <div className="flex items-center gap-0.5 rounded-full bg-white/10 px-1 py-0.5">
      <Button
        size="icon"
        variant="ghost"
        onClick={decrease}
        disabled={!canDecrease}
        title="Decrease text size"
        aria-label="Decrease text size"
        className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <div className="flex items-center gap-1 px-1">
        <Type className="h-3.5 w-3.5 text-white/70" />
        <span className="text-xs font-semibold text-white w-8 text-center">
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
        className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
