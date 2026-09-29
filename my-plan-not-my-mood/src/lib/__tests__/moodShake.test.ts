import { describe, expect, it } from 'vitest';
import { MOOD_OPTIONS } from '../../data/moods';
import {
  MOOD_SHAKE_GAME_SECONDS,
  moodShakePlay,
  scoreShakeTaps,
  shakeTilesForMood,
  shuffleShakeTiles,
} from '../moodShake';

describe('moodShake', () => {
  it('gives every mood shake tips, a member exercise, and a Plan vs Mood round', () => {
    expect(MOOD_SHAKE_GAME_SECONDS).toBe(20);
    expect(MOOD_OPTIONS).toHaveLength(6);
    for (const mood of MOOD_OPTIONS) {
      const play = moodShakePlay(mood.id);
      expect(play?.tips.length).toBeGreaterThanOrEqual(3);
      expect(play?.exercise.steps.length).toBe(3);
      expect(play?.game.planMoves.length).toBeGreaterThanOrEqual(3);
      expect(play?.game.moodTraps.length).toBeGreaterThanOrEqual(2);
      const tiles = shakeTilesForMood(mood.id);
      expect(tiles.some((tile) => tile.kind === 'plan')).toBe(true);
      expect(tiles.some((tile) => tile.kind === 'trap')).toBe(true);
    }
    expect(moodShakePlay('not-a-mood')).toBeNull();
  });

  it('scores Plan taps up and Mood traps down, and shuffles without dropping tiles', () => {
    expect(scoreShakeTaps(['plan', 'plan', 'trap'], 4, 3)).toEqual({
      planHits: 2,
      trapHits: 1,
      score: 3,
      perfect: false,
    });
    expect(scoreShakeTaps(['plan', 'plan', 'plan', 'plan'], 4, 3).perfect).toBe(true);
    expect(scoreShakeTaps(['trap', 'trap'], 4, 3).score).toBe(0);
    const tiles = shakeTilesForMood('tired');
    const shuffled = shuffleShakeTiles(tiles, () => 0.2);
    expect(shuffled).toHaveLength(tiles.length);
    expect(shuffled.map((tile) => tile.id).sort()).toEqual(tiles.map((tile) => tile.id).sort());
  });
});
