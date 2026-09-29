import { useEffect, useMemo, useState } from "react";
import {
  VIDEO_USAGE_DISCLAIMER,
  VIDEO_USAGE_PLAN_BEFORE_COPY,
  DEFAULT_VIDEO_MODEL_PRICING,
  DEFAULT_VIDEO_PROVIDER_PLANS,
  buildPlanComparison,
  buildSceneUsageEstimate,
  buildVideoUsageEstimate,
  defaultVideoUsageEstimatorSettings,
  formatCreditsApprox,
  mergeVideoUsageEstimatorSettings,
  remainingCreditsAfterProduction,
  resolveExpectedAttempts,
  type ExpectedAttemptsChoice,
  type UserHedraPlanChoice,
  type VideoUsageEstimatorSettings,
  type VideoUsageSceneInput,
} from "../../lib/vspw-video-usage";

type Props = {
  scenes: readonly VideoUsageSceneInput[];
  /** Controlled settings; omit for internal state + optional persistence callback. */
  settings?: VideoUsageEstimatorSettings;
  onSettingsChange?: (next: VideoUsageEstimatorSettings) => void;
  /** Compact header for Production Pack summary. */
  compact?: boolean;
  /** Admin read-only view of a member pack estimate. */
  readOnly?: boolean;
  testId?: string;
};

/**
 * Production Review / Pack section — educational Hedra (provider-neutral) credit estimator.
 * Does not call any video API or consume credits.
 */
export function VspwVideoUsageEstimator({
  scenes,
  settings: settingsProp,
  onSettingsChange,
  compact = false,
  readOnly = false,
  testId = "vspw-video-usage-estimator",
}: Props) {
  const [internal, setInternal] = useState(() =>
    mergeVideoUsageEstimatorSettings(settingsProp ?? defaultVideoUsageEstimatorSettings()),
  );

  useEffect(() => {
    if (settingsProp) setInternal(mergeVideoUsageEstimatorSettings(settingsProp));
  }, [settingsProp]);

  const settings = settingsProp ? mergeVideoUsageEstimatorSettings(settingsProp) : internal;

  const patch = (partial: Partial<VideoUsageEstimatorSettings>) => {
    if (readOnly) return;
    const next = mergeVideoUsageEstimatorSettings({ ...settings, ...partial });
    if (!settingsProp) setInternal(next);
    onSettingsChange?.(next);
  };

  const estimate = useMemo(() => buildVideoUsageEstimate(scenes, settings), [scenes, settings]);
  const plans = useMemo(
    () => buildPlanComparison(estimate, DEFAULT_VIDEO_PROVIDER_PLANS, settings.providerId),
    [estimate, settings.providerId],
  );
  const remaining = remainingCreditsAfterProduction(
    settings.userEnteredCredits,
    estimate.estimatedTotalCredits,
  );
  const attempts = resolveExpectedAttempts(settings);
  const models = DEFAULT_VIDEO_MODEL_PRICING.filter(
    (m) => m.active && m.providerId === settings.providerId,
  );

  return (
    <section className="vspw-usage-estimator" data-testid={testId}>
      <h3 className="vspw-usage-estimator__title">Estimated video generation usage</h3>
      {!compact ? (
        <p className="vspw-usage-estimator__lead" data-testid={`${testId}-plan-before`}>
          <strong>Plan before you generate.</strong> {VIDEO_USAGE_PLAN_BEFORE_COPY}
        </p>
      ) : null}

      <div className="vspw-usage-estimator__stats" data-testid={`${testId}-totals`}>
        <p>
          <span>Scenes</span>
          <strong>{estimate.sceneCount}</strong>
        </p>
        <p>
          <span>Total planned duration</span>
          <strong>{estimate.totalSeconds} seconds</strong>
        </p>
        <ul className="vspw-usage-estimator__scene-list">
          {scenes.map((s) => (
            <li key={s.sceneId}>
              {s.label} — {s.durationSeconds} seconds
            </li>
          ))}
        </ul>
      </div>

      {!readOnly ? (
        <div className="vspw-usage-estimator__controls">
          <label>
            Select video model
            <select
              value={settings.modelId}
              onChange={(e) => {
                const model = models.find((m) => m.modelId === e.target.value);
                patch({
                  modelId: e.target.value,
                  creditsPerSecond: model?.creditsPerSecond ?? settings.creditsPerSecond,
                  illustrative: model?.illustrative ?? true,
                });
              }}
              data-testid={`${testId}-model`}
            >
              {models.map((m) => (
                <option key={m.modelId} value={m.modelId}>
                  {m.modelName}
                  {m.illustrative ? " (illustrative)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estimated credits per second
            <input
              type="number"
              min={0}
              step={0.5}
              value={settings.creditsPerSecond}
              onChange={(e) =>
                patch({
                  creditsPerSecond: Number(e.target.value) || 0,
                  illustrative: true,
                })
              }
              data-testid={`${testId}-cps`}
            />
          </label>
          {settings.illustrative ? (
            <p className="vspw-usage-estimator__illustrative" data-testid={`${testId}-illustrative`}>
              ILLUSTRATIVE ESTIMATE — not official Hedra pricing.
            </p>
          ) : null}

          <fieldset>
            <legend>Expected generation attempts per scene</legend>
            <p className="vspw-usage-estimator__hint">
              AI-generated scenes sometimes require more than one attempt. This estimate helps you
              understand possible credit usage.
            </p>
            {(
              [
                [1, "1 Attempt"],
                [2, "2 Attempts"],
                [3, "3 Attempts"],
                ["custom", "Custom"],
              ] as const
            ).map(([value, label]) => (
              <label key={String(value)} className="vspw-usage-estimator__radio">
                <input
                  type="radio"
                  name={`${testId}-attempts`}
                  checked={settings.expectedAttemptsChoice === value}
                  onChange={() =>
                    patch({ expectedAttemptsChoice: value as ExpectedAttemptsChoice })
                  }
                />
                {label}
              </label>
            ))}
            {settings.expectedAttemptsChoice === "custom" ? (
              <label>
                Custom attempts
                <input
                  type="number"
                  min={1}
                  value={settings.customAttempts}
                  onChange={(e) =>
                    patch({ customAttempts: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
                  }
                  data-testid={`${testId}-custom-attempts`}
                />
              </label>
            ) : null}
          </fieldset>

          <label>
            My Hedra plan (informational only)
            <select
              value={settings.userPlanChoice}
              onChange={(e) => patch({ userPlanChoice: e.target.value as UserHedraPlanChoice })}
              data-testid={`${testId}-plan`}
            >
              <option value="not_sure">Not sure</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="creator">Creator</option>
              <option value="professional">Professional</option>
              <option value="custom">Custom / Other</option>
            </select>
          </label>

          <label>
            My available credits (user-entered)
            <input
              type="number"
              min={0}
              placeholder="e.g. 3850"
              value={settings.userEnteredCredits ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                patch({
                  userEnteredCredits: raw === "" ? null : Math.max(0, Math.floor(Number(raw) || 0)),
                });
              }}
              data-testid={`${testId}-balance`}
            />
          </label>
          <p className="vspw-usage-estimator__hint">USER-ENTERED CREDIT BALANCE — not linked to Hedra.</p>
        </div>
      ) : null}

      <div className="vspw-usage-estimator__result" data-testid={`${testId}-result`}>
        <p>
          Credits per first-pass generation:{" "}
          <strong>{formatCreditsApprox(estimate.creditsPerAttempt)}</strong>
        </p>
        <p>
          Expected attempts: <strong>{attempts}</strong>
        </p>
        <p className="vspw-usage-estimator__total">
          Estimated total usage:{" "}
          <strong data-testid={`${testId}-total`}>
            {formatCreditsApprox(estimate.estimatedTotalCredits)} credits
          </strong>
        </p>
        {settings.userEnteredCredits != null && remaining != null ? (
          <p data-testid={`${testId}-remaining`}>
            This production may use {formatCreditsApprox(estimate.estimatedTotalCredits)} credits ·
            Estimated remaining: {formatCreditsApprox(remaining)} credits
          </p>
        ) : null}
      </div>

      <div className="vspw-usage-estimator__scenarios" data-testid={`${testId}-scenarios`}>
        <h4>Best / Likely / Heavy revision</h4>
        <ul>
          <li>
            Best case (1 generation per scene):{" "}
            <strong>{formatCreditsApprox(estimate.bestCaseCredits)} credits</strong>
          </li>
          <li>
            Likely (2 generations per scene):{" "}
            <strong>{formatCreditsApprox(estimate.likelyCredits)} credits</strong>
          </li>
          <li>
            Heavy revision (3 generations per scene):{" "}
            <strong>{formatCreditsApprox(estimate.heavyRevisionCredits)} credits</strong>
          </li>
        </ul>
      </div>

      {!compact ? (
        <div className="vspw-usage-estimator__plans" data-testid={`${testId}-plans`}>
          <h4>Plan comparison (illustrative allowances)</h4>
          <ul>
            {plans.map((row) => (
              <li key={row.planId}>
                <strong>{row.planName}</strong> — Monthly credits:{" "}
                {row.monthlyCredits.toLocaleString("en-US")} · Estimated completed productions at this
                pace: {row.productionsLabel}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact ? (
        <details className="vspw-usage-estimator__scene-details">
          <summary>Scene-level estimated video usage</summary>
          <ul data-testid={`${testId}-scene-estimates`}>
            {scenes.map((scene) => {
              const row = buildSceneUsageEstimate(scene, settings.creditsPerSecond);
              return (
                <li key={scene.sceneId}>
                  <strong>{row.label}</strong> — {row.durationSeconds}s · per attempt{" "}
                  {formatCreditsApprox(row.creditsPerAttempt)} · 1× {formatCreditsApprox(row.oneAttempt)}{" "}
                  · 2× {formatCreditsApprox(row.twoAttempts)} · 3×{" "}
                  {formatCreditsApprox(row.threeAttempts)}
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}

      <p className="vspw-usage-estimator__disclaimer" data-testid={`${testId}-disclaimer`} role="note">
        {VIDEO_USAGE_DISCLAIMER}
      </p>
      <p className="vspw-usage-estimator__hint">
        VSPW does not generate video or consume Hedra credits. You generate video in your own provider
        account.
      </p>
    </section>
  );
}
