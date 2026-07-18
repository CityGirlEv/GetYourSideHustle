import { Player, MatchDay, CourtAssignment } from './match';

/**
 * Simple rating function: players gain 10 points for a win, lose 5 for a loss.
 * Promotion/Demotion rules are enforced when assigning courts.
 */
export function calculateNewRatings(matchDay: MatchDay, winnerCourt: number): Player[] {
  // clone players to avoid mutating original objects
  const updated: Player[] = [];
  matchDay.courts.forEach((court) => {
    const isWinner = court.courtNumber === winnerCourt;
    court.players.forEach((p) => {
      const delta = isWinner ? 10 : -5;
      updated.push({ ...p, rating: Math.max(0, p.rating + delta) });
    });
  });
  return updated;
}

/**
 * Determines which courts a player is eligible to play on based on their current court.
 * Rules: can move up at most two levels, down only one level.
 */
export function eligibleCourts(currentCourt: number, totalCourts: number): number[] {
  const up = Math.min(currentCourt - 2, 1);
  const down = Math.min(currentCourt + 1, totalCourts);
  const courts: number[] = [];
  for (let i = up; i <= down; i++) courts.push(i);
  return courts;
}
