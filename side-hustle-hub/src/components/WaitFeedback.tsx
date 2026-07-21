import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Hourglass } from "lucide-react";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 14, md: 18, lg: 28 };

/** Soft estimate for indeterminate network waits (ms). Progress caps until the request finishes. */
const ESTIMATE_MIN_MS = 8_000;
const ESTIMATE_MAX_MS = 20_000;
const PROGRESS_CAP = 95;
const TICK_MS = 200;
const FACT_ROTATE_MS = 4_000;

/** Static GYSH / side-hustle fun facts — no network. Rotated during BusyOverlay waits. */
export const SIDE_HUSTLE_FUN_FACTS = [
  "Many six-figure side hustles started as a weekend experiment with zero customers.",
  "GYSH stands for Grow Your Side Hustle — built for makers who ship between day jobs.",
  "Pricing tip: charge for the problem you remove, not the hours you spend.",
  "The average successful hustle pivots at least twice before product-market fit.",
  "A simple offer you can explain in one sentence beats a complicated one every time.",
  "Cash flow beats vanity metrics — one paid customer teaches more than a thousand likes.",
  "Batching admin (invoices, emails, posts) frees more deep-work hours than another tool.",
  "Side hustles thrive on consistency: small weekly ship beats occasional heroic sprints.",
  "Your first customers are often people who already trust you — friends, coworkers, niche communities.",
  "Validate demand with a pre-sale or waitlist before building the full product.",
  "Niche down until it feels slightly uncomfortable — then market there first.",
  "Templates and checklists sell well because busy people pay to skip reinventing the wheel.",
  "Tracking time for one week often reveals where your hustle hours actually go.",
  "A clear CTA on every page outperforms pretty design with a buried next step.",
  "Reinvest early profits into the bottleneck: ads, tools, or hiring help — not more features.",
  "Feedback from three real buyers beats a month of guessing alone.",
  "Seasonal offers (tax time, holidays, school year) can create predictable revenue spikes.",
  "Document your process once — then productize it as a service, course, or template pack.",
] as const;

function pickEstimateMs(): number {
  return (
    ESTIMATE_MIN_MS +
    Math.floor(Math.random() * (ESTIMATE_MAX_MS - ESTIMATE_MIN_MS + 1))
  );
}

function formatApproxRemaining(remainingMs: number): string {
  const secs = Math.max(1, Math.ceil(remainingMs / 1000));
  if (secs >= 60) {
    const mins = Math.ceil(secs / 60);
    return `~${mins} min remaining`;
  }
  return `~${secs}s remaining`;
}

/** Lucide hourglass with a gentle flip — shared wait affordance. */
export function WaitHourglass({
  size = "md",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <Hourglass
      size={SIZE_PX[size]}
      className={`wait-hourglass${className ? ` ${className}` : ""}`}
      aria-hidden
    />
  );
}

/** Inline hourglass + message for page/data loads. */
export function WaitIndicator({
  message,
  size = "md",
  className = "",
  style,
  "data-testid": dataTestId,
}: {
  message: string;
  size?: Size;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
}) {
  return (
    <p
      className={`wait-indicator${className ? ` ${className}` : ""}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid={dataTestId}
    >
      <WaitHourglass size={size} />
      <span>{message}</span>
    </p>
  );
}

/** Hourglass + label for busy buttons (login, save, etc.). */
export function WaitLabel({
  children,
  size = "sm",
}: {
  children: ReactNode;
  size?: Size;
}) {
  return (
    <span className="wait-label">
      <WaitHourglass size={size} />
      <span>{children}</span>
    </span>
  );
}

/**
 * Blocking overlay while a user-visible network wait is in progress.
 * Use for saves, bulk apply, auth, suite runs — not every micro-state.
 *
 * Progress is a soft estimate (network waits are indeterminate): approaches
 * ~95% based on an 8–20s guess, then holds until the request finishes.
 * When `active` flips false, the overlay dismisses immediately.
 */
export function BusyOverlay({
  active,
  message = "Please wait…",
}: {
  active: boolean;
  message?: string;
}) {
  const [estimateMs, setEstimateMs] = useState(ESTIMATE_MIN_MS);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      return;
    }

    setEstimateMs(pickEstimateMs());
    setElapsedMs(0);
    setFactIndex(Math.floor(Math.random() * SIDE_HUSTLE_FUN_FACTS.length));

    const started = performance.now();
    const tick = window.setInterval(() => {
      setElapsedMs(performance.now() - started);
    }, TICK_MS);

    const rotate = window.setInterval(() => {
      setFactIndex((i) => (i + 1) % SIDE_HUSTLE_FUN_FACTS.length);
    }, FACT_ROTATE_MS);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(rotate);
    };
  }, [active]);

  if (!active) return null;

  const rawPct = (elapsedMs / estimateMs) * 100;
  const progressPct = Math.min(PROGRESS_CAP, Math.max(0, rawPct));
  const remainingPct = Math.max(100 - PROGRESS_CAP, Math.round(100 - progressPct));
  const remainingMs = Math.max(0, estimateMs - elapsedMs);
  const atCap = progressPct >= PROGRESS_CAP;

  return (
    <div className="busy-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="busy-overlay__panel">
        <WaitHourglass size="lg" />
        <span className="busy-overlay__message">{message}</span>
        <div className="busy-overlay__progress" aria-hidden>
          <div className="busy-overlay__progress-track">
            <div
              className="busy-overlay__progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="busy-overlay__progress-meta">
            {atCap
              ? "Almost there…"
              : `${remainingPct}% time remaining · ${formatApproxRemaining(remainingMs)}`}
          </span>
        </div>
        <p className="busy-overlay__fact" key={factIndex}>
          <span className="busy-overlay__fact-label">Fun fact</span>
          {SIDE_HUSTLE_FUN_FACTS[factIndex]}
        </p>
      </div>
    </div>
  );
}
