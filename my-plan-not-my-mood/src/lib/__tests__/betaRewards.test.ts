import { describe, expect, it } from 'vitest';
import {
  BETA_CREDIT_NAME,
  BETA_CREDIT_REWARDS,
  BETA_CREDIT_ZERO_STATUSES,
  BETA_REPRO_FAIL_BONUS,
  BETA_RETEST_BONUS,
  BETA_REWARD_LEVELS,
  BETA_REWARDS_PATH,
  BETA_REWARDS_TITLE,
  betaCreditForPriority,
  betaRewardLevelLabelFor,
  isBetaRewardsPath,
} from '../betaRewards';

describe('betaRewards', () => {
  it('scores Plan Credits by Testing Portal priority like GYSH scores Kid Credits', () => {
    expect(BETA_REWARDS_TITLE).toBe('Beta Tester Rewards');
    expect(BETA_CREDIT_NAME).toBe('Plan Credits');
    expect(betaCreditForPriority('high')).toBe(BETA_CREDIT_REWARDS.high);
    expect(betaCreditForPriority('medium')).toBe(5);
    expect(betaCreditForPriority('low')).toBe(3);
    expect(betaCreditForPriority('nope')).toBe(0);
    expect(BETA_RETEST_BONUS).toBe(5);
    expect(BETA_REPRO_FAIL_BONUS).toBe(5);
    expect(BETA_CREDIT_ZERO_STATUSES).toContain('Blocked');
  });

  it('labels reward levels from eligible test counts and accepts alias paths', () => {
    expect(betaRewardLevelLabelFor(0)).toBe(BETA_REWARD_LEVELS[0]!.label);
    expect(betaRewardLevelLabelFor(5)).toBe('Contributor');
    expect(betaRewardLevelLabelFor(15)).toBe('Regular');
    expect(betaRewardLevelLabelFor(40)).toBe('Champion');
    expect(isBetaRewardsPath(BETA_REWARDS_PATH)).toBe(true);
    expect(isBetaRewardsPath('/beta-tester-rewards')).toBe(true);
    expect(isBetaRewardsPath('/about')).toBe(false);
  });
});
