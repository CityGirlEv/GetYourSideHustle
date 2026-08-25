/** Beta Tester testing dashboard — stats, reward level, unlock gate. */

export const BETA_REWARD_NOT_QUALIFIED = "Not yet qualified";

export type BetaTesterStats = {
  testsCompleted: number;
  recordedMs: number;
  rewardLevel: string;
};

export type BetaNdaReceipt = {
  version: string;
  acceptedAt: string;
  legalName: string;
  userId: string;
};

export function emptyBetaTesterStats(): BetaTesterStats {
  return {
    testsCompleted: 0,
    recordedMs: 0,
    rewardLevel: BETA_REWARD_NOT_QUALIFIED,
  };
}

/** Format recorded testing time as MM:SS (or HH:MM:SS when ≥ 1 hour). Zero is `00:00`. */
export function formatBetaRecordedTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(Number(ms) || 0) / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function betaRewardLevelFor(testsCompleted: number, recordedMs: number): string {
  if (testsCompleted <= 0 || recordedMs < 0) return BETA_REWARD_NOT_QUALIFIED;
  return BETA_REWARD_NOT_QUALIFIED;
}

export function betaTesterStatsFromCounts(
  testsCompleted: number,
  recordedMs: number,
): BetaTesterStats {
  const tests = Math.max(0, Math.floor(Number(testsCompleted) || 0));
  const ms = Math.max(0, Math.floor(Number(recordedMs) || 0));
  return {
    testsCompleted: tests,
    recordedMs: ms,
    rewardLevel: betaRewardLevelFor(tests, ms),
  };
}

export function isBetaTestingUnlocked(receipt: BetaNdaReceipt | null | undefined, currentVersion: string): boolean {
  if (!receipt) return false;
  return receipt.version === currentVersion && Boolean(receipt.acceptedAt) && Boolean(receipt.userId);
}
