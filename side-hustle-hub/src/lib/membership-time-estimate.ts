/**
 * Partner time load from included 1-on-1s (Tina & Evelyn).
 * Group work (newsletter, workshops) is shared — not multiplied by member count.
 */
import {
  MEMBERSHIP_TIERS,
  oneOnOneSessionCount,
  tierOneOnOneMinutes,
  type TierId,
} from "./membership";

export const PAID_TIME_LOAD_TIERS: readonly TierId[] = ["starter", "pro", "elite"];

export const DEFAULT_PREP_MINUTES_PER_SESSION = 15;
export const DEFAULT_CARE_MINUTES_PER_MONTH = 10;
export const DEFAULT_SCALE_MAX = 50;
export const SCALE_STEP = 5;

export type TimeHorizon = "commitment" | "month" | "year";

export type TierTimeAssumptions = {
  tierId: TierId;
  name: string;
  sessions: number;
  minutesEach: number;
  commitmentMonths: number;
  liveMinutes: number;
  prepMinutes: number;
  label: string;
};

export type ScaledTimeRow = {
  members: number;
  byTier: Record<"starter" | "pro" | "elite", { minutes: number; eachMinutes: number }>;
};

/** 1, then 5, 10, 15… up to max. */
export function membershipCountScale(max = DEFAULT_SCALE_MAX): number[] {
  const cap = Math.max(1, Math.floor(Number(max) || DEFAULT_SCALE_MAX));
  const counts = [1];
  for (let n = SCALE_STEP; n <= cap; n += SCALE_STEP) {
    counts.push(n);
  }
  return counts;
}

export function tierTimeAssumptions(
  tierId: TierId,
  prepPerSession = DEFAULT_PREP_MINUTES_PER_SESSION,
): TierTimeAssumptions {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const sessions = oneOnOneSessionCount(tierId);
  const minutesEach = tierOneOnOneMinutes(tierId);
  const liveMinutes = sessions * minutesEach;
  const prep = Math.max(0, Math.floor(Number(prepPerSession) || 0));
  const prepMinutes = sessions * prep;
  const name = tier?.name ?? tierId;
  const commitmentMonths = tier?.commitmentMonths && tier.commitmentMonths > 0 ? tier.commitmentMonths : 3;
  const label =
    sessions <= 0
      ? "No included 1-on-1"
      : `${sessions}× ${minutesEach}-min session${sessions === 1 ? "" : "s"}`;
  return {
    tierId,
    name,
    sessions,
    minutesEach,
    commitmentMonths,
    liveMinutes,
    prepMinutes,
    label,
  };
}

export function minutesForMembers(opts: {
  tierId: TierId;
  members: number;
  horizon: TimeHorizon;
  prepPerSession?: number;
  carePerMonth?: number;
}): number {
  const members = Math.max(0, Math.floor(Number(opts.members) || 0));
  const prep = opts.prepPerSession ?? DEFAULT_PREP_MINUTES_PER_SESSION;
  const care = Math.max(0, Math.floor(Number(opts.carePerMonth ?? DEFAULT_CARE_MINUTES_PER_MONTH) || 0));
  const a = tierTimeAssumptions(opts.tierId, prep);
  const consult = a.liveMinutes + a.prepMinutes;
  const months = a.commitmentMonths;
  let perMember = 0;
  if (opts.horizon === "commitment") {
    perMember = consult + care * months;
  } else if (opts.horizon === "month") {
    perMember = consult / months + care;
  } else {
    const cycles = 12 / months;
    perMember = consult * cycles + care * 12;
  }
  return Math.round(perMember * members);
}

export function scaleTimeLoadTable(opts: {
  maxMembers?: number;
  horizon: TimeHorizon;
  prepPerSession?: number;
  carePerMonth?: number;
}): ScaledTimeRow[] {
  return membershipCountScale(opts.maxMembers).map((members) => ({
    members,
    byTier: {
      starter: {
        minutes: minutesForMembers({ ...opts, tierId: "starter", members }),
        eachMinutes: minutesForMembers({ ...opts, tierId: "starter", members: 1 }),
      },
      pro: {
        minutes: minutesForMembers({ ...opts, tierId: "pro", members }),
        eachMinutes: minutesForMembers({ ...opts, tierId: "pro", members: 1 }),
      },
      elite: {
        minutes: minutesForMembers({ ...opts, tierId: "elite", members }),
        eachMinutes: minutesForMembers({ ...opts, tierId: "elite", members: 1 }),
      },
    },
  }));
}

export function formatPartnerHours(minutes: number): string {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  if (m === 0) return "0 min";
  if (m < 60) return `${m} min`;
  const hours = m / 60;
  if (m % 60 === 0) return `${hours} hr`;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hr`;
}

export function formatSplitHours(minutes: number): string {
  return formatPartnerHours(Math.round(minutes / 2));
}

export function horizonLabel(horizon: TimeHorizon): string {
  if (horizon === "commitment") return "per 3-month commitment";
  if (horizon === "month") return "per month (average)";
  return "per year (if they stay 12 months)";
}
