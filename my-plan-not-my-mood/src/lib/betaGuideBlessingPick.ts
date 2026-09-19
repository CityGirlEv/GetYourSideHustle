/** Local thank-you pick: tee, hat, or both. No address or other PII. */

export type BetaGuideBlessingPick = {
  tee: boolean;
  hat: boolean;
};

export const BETA_GUIDE_BLESSING_PICK_KEY = 'myplan_beta_guide_blessing_pick_v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function emptyBetaGuideBlessingPick(): BetaGuideBlessingPick {
  return { tee: false, hat: false };
}

export function parseBetaGuideBlessingPick(value: unknown): BetaGuideBlessingPick {
  if (!isRecord(value)) return emptyBetaGuideBlessingPick();
  return {
    tee: Boolean(value.tee),
    hat: Boolean(value.hat),
  };
}

export function toggleBetaGuideBlessingPick(
  pick: BetaGuideBlessingPick,
  piece: 'tee' | 'hat',
): BetaGuideBlessingPick {
  return { ...pick, [piece]: !pick[piece] };
}

export function betaGuideBlessingPickLabel(pick: BetaGuideBlessingPick): string {
  if (pick.tee && pick.hat) return 'Tee and hat';
  if (pick.tee) return 'Tee';
  if (pick.hat) return 'Hat';
  return 'Not chosen yet';
}

export function loadBetaGuideBlessingPick(): BetaGuideBlessingPick {
  if (typeof window === 'undefined') return emptyBetaGuideBlessingPick();
  try {
    const raw = localStorage.getItem(BETA_GUIDE_BLESSING_PICK_KEY);
    if (!raw) return emptyBetaGuideBlessingPick();
    return parseBetaGuideBlessingPick(JSON.parse(raw));
  } catch {
    return emptyBetaGuideBlessingPick();
  }
}

export function saveBetaGuideBlessingPick(pick: BetaGuideBlessingPick): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BETA_GUIDE_BLESSING_PICK_KEY, JSON.stringify(pick));
}
