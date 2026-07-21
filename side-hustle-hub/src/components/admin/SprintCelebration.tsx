import { useEffect, useRef } from "react";
import { PartyPopper, X } from "lucide-react";
import { runFireworks } from "../../lib/gysh-fireworks";
import type { SprintClearResult } from "../../lib/gysh-sprint-complete";
import { getSprintWindow, sprintLabel } from "../../lib/gysh-sprints";

type Props = {
  open: boolean;
  assigneeLabel: string;
  clear: SprintClearResult;
  onClose: () => void;
};

export function SprintCelebration({ open, assigneeLabel, clear, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const stop = runFireworks(canvasRef.current, 5200);
    return stop;
  }, [open]);

  if (!open) return null;

  const sw = getSprintWindow(clear.sprintIndex);
  const name = assigneeLabel === "you" ? "Side Hustler" : assigneeLabel;

  return (
    <div
      className="sprint-celebration"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-celeb-title"
      data-testid="sprint-celebration"
    >
      <canvas ref={canvasRef} className="sprint-celebration__canvas" aria-hidden />
      <div className="sprint-celebration__card glass">
        <button
          type="button"
          className="sprint-celebration__close"
          aria-label="Close celebration"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <p className="sprint-celebration__eyebrow">
          <PartyPopper size={16} aria-hidden /> Party streamers engaged
        </p>
        <h2 id="sprint-celeb-title">You cleared the board, {name}!</h2>
        <p className="sprint-celebration__lead">
          Every task and test on your plate for{" "}
          <strong>{sprintLabel(clear.sprintIndex)}</strong> ({sw.rangeLabel}) is done. That is real
          Side Hustle momentum — take the win.
        </p>
        <ul className="sprint-celebration__stats">
          <li>
            <strong>{clear.taskDone}</strong>
            <span>tasks wrapped</span>
          </li>
          <li>
            <strong>{clear.testDone}</strong>
            <span>tests closed</span>
          </li>
        </ul>
        <p className="sprint-celebration__footer">
          Keep the energy — tomorrow&apos;s digest will still keep you honest. For now: celebrate.
        </p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Back To The Side Hustle
        </button>
      </div>
    </div>
  );
}
