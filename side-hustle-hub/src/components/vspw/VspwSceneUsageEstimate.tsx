import { useMemo, useState } from "react";
import {
  buildSceneUsageEstimate,
  formatCreditsApprox,
  type VideoUsageSceneInput,
} from "../../lib/vspw-video-usage";

type Props = {
  scene: VideoUsageSceneInput;
  creditsPerSecond: number;
  defaultOpen?: boolean;
  testId?: string;
};

/** Compact / collapsed scene-card estimator — wardrobe-only changes do not affect this. */
export function VspwSceneUsageEstimate({
  scene,
  creditsPerSecond,
  defaultOpen = false,
  testId,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const row = useMemo(
    () => buildSceneUsageEstimate(scene, creditsPerSecond),
    [scene, creditsPerSecond],
  );
  const id = testId ?? `vspw-scene-usage-${scene.sceneId}`;

  return (
    <details
      className="vspw-scene-usage"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      data-testid={id}
    >
      <summary>Estimated video usage</summary>
      <p>
        Scene duration: <strong>{row.durationSeconds} seconds</strong>
      </p>
      <p>
        Estimated credits per attempt:{" "}
        <strong>{formatCreditsApprox(row.creditsPerAttempt)}</strong>
      </p>
      <ul>
        <li>1 Attempt: {formatCreditsApprox(row.oneAttempt)}</li>
        <li>2 Attempts: {formatCreditsApprox(row.twoAttempts)}</li>
        <li>3 Attempts: {formatCreditsApprox(row.threeAttempts)}</li>
      </ul>
    </details>
  );
}
