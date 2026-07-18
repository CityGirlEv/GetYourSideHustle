/** Lightweight analytics helper — no third-party trackers. */

export type GyshAnalyticsEvent =
  | "find_side_hustle_started"
  | "find_side_hustle_completed"
  | "partial_blueprint_viewed"
  | "blueprint_unlock_clicked"
  | "registration_started_from_blueprint"
  | "blueprint_unlocked"
  | "blueprint_saved"
  | "wizard_retaken";

export type BlueprintAgeGroup = "kids" | "junior" | "adult" | "senior";

export type GyshAnalyticsProps = {
  age_group?: BlueprintAgeGroup;
  /** Safe, non-PII flags only */
  source?: string;
  match_count?: number;
  unlocked?: boolean;
};

type AnalyticsSink = (event: GyshAnalyticsEvent, props: GyshAnalyticsProps) => void;

const sinks: AnalyticsSink[] = [];

/** Register an optional sink (tests, future vendor). */
export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.push(sink);
  return () => {
    const i = sinks.indexOf(sink);
    if (i >= 0) sinks.splice(i, 1);
  };
}

export function trackGyshEvent(event: GyshAnalyticsEvent, props: GyshAnalyticsProps = {}): void {
  const safe: GyshAnalyticsProps = {
    age_group: props.age_group,
    source: props.source,
    match_count: props.match_count,
    unlocked: props.unlocked,
  };

  try {
    if (typeof window !== "undefined") {
      const w = window as Window & { dataLayer?: unknown[]; gyshAnalytics?: unknown[] };
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({ event, ...safe });
      w.gyshAnalytics = w.gyshAnalytics ?? [];
      w.gyshAnalytics.push({ event, props: safe, at: new Date().toISOString() });
    }
  } catch {
    /* ignore */
  }

  for (const sink of sinks) {
    try {
      sink(event, safe);
    } catch {
      /* ignore sink errors */
    }
  }
}
