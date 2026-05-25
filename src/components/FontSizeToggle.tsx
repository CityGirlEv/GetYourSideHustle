import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";

const STEPS = [1, 1.125, 1.25, 1.4];
const STORAGE_KEY = "font-scale";
const BASE_PX = 18;

function applyScale(scale: number) {
  document.documentElement.style.fontSize = `${BASE_PX * scale}px`;
}

export function FontSizeToggle() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const saved = parseFloat(localStorage.getItem(STORAGE_KEY) || "1");
    const i = Math.max(0, STEPS.findIndex((s) => Math.abs(s - saved) < 0.01));
    const safeIdx = i === -1 ? 0 : i;
    setIdx(safeIdx);
    applyScale(STEPS[safeIdx]);
  }, []);

  const cycle = () => {
    const next = (idx + 1) % STEPS.length;
    setIdx(next);
    applyScale(STEPS[next]);
    localStorage.setItem(STORAGE_KEY, String(STEPS[next]));
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={cycle}
      title={`Text size: ${Math.round(STEPS[idx] * 100)}% — click to change`}
      aria-label="Change text size"
      className="gap-1"
    >
      <Type className="h-4 w-4" />
      <span className="text-xs font-semibold">{Math.round(STEPS[idx] * 100)}%</span>
    </Button>
  );
}