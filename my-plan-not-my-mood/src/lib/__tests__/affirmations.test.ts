import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredAffirmations,
  getSessionAffirmations,
  getCurrentSessionType,
  getDailyCompletionStatus,
  recordSessionCompletion,
  recordReflectionSelection,
  calculateAffirmationWeights,
  getReflectionHistory,
  AFFIRMATIONS_DAILY_KEY,
  AFFIRMATIONS_REFLECTIONS_KEY,
} from '../affirmations';
import { INITIAL_AFFIRMATIONS, SessionType } from '../../data/affirmations';

describe('Daily Affirmations System - Service & Rotation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads initial seed affirmations when storage is empty', () => {
    const affirmations = getStoredAffirmations();
    expect(affirmations.length).toBeGreaterThanOrEqual(15);
    expect(affirmations[0]).toHaveProperty('text');
    expect(affirmations[0]).toHaveProperty('category');
    expect(affirmations[0]).toHaveProperty('sessionTypes');
  });

  it('retrieves distinct affirmations for morning micro-set', () => {
    const morningAffs = getSessionAffirmations('morning', undefined, 3);
    expect(morningAffs.length).toBe(3);
    // Ensure all items are configured for morning
    morningAffs.forEach((item) => {
      expect(item.sessionTypes).toContain('morning');
    });
  });

  it('retrieves distinct affirmations for midday micro-set', () => {
    const middayAffs = getSessionAffirmations('midday', undefined, 3);
    expect(middayAffs.length).toBe(3);
    middayAffs.forEach((item) => {
      expect(item.sessionTypes).toContain('midday');
    });
  });

  it('retrieves distinct affirmations for night micro-set', () => {
    const nightAffs = getSessionAffirmations('night', undefined, 3);
    expect(nightAffs.length).toBe(3);
    nightAffs.forEach((item) => {
      expect(item.sessionTypes).toContain('night');
    });
  });

  it('calculates weighted resonance based on user reflection history', () => {
    const candidatePool = INITIAL_AFFIRMATIONS.slice(0, 5);
    const targetItem = candidatePool[0];

    const reflections = [
      {
        id: 'r1',
        sessionType: 'morning' as SessionType,
        category: targetItem.category,
        affirmationId: targetItem.id,
        selectedAt: new Date().toISOString(),
        sessionDate: '2026-08-23',
      },
      {
        id: 'r2',
        sessionType: 'morning' as SessionType,
        category: targetItem.category,
        affirmationId: targetItem.id,
        selectedAt: new Date().toISOString(),
        sessionDate: '2026-08-23',
      },
    ];

    const weights = calculateAffirmationWeights(candidatePool, reflections);
    expect(weights.get(targetItem.id)).toBeGreaterThan(1.0);
  });

  it('records session completion for daily tracking', () => {
    const dateStr = '2026-08-23';
    let status = getDailyCompletionStatus(dateStr);
    expect(status.morning).toBe(false);
    expect(status.midday).toBe(false);
    expect(status.night).toBe(false);

    status = recordSessionCompletion('morning', dateStr);
    expect(status.morning).toBe(true);
    expect(status.midday).toBe(false);

    status = recordSessionCompletion('night', dateStr);
    expect(status.morning).toBe(true);
    expect(status.night).toBe(true);
  });

  it('records user reflection selection and persists to storage', () => {
    const testAff = INITIAL_AFFIRMATIONS[0];
    const reflection = recordReflectionSelection('morning', testAff, 'user-123');

    expect(reflection.affirmationId).toBe(testAff.id);
    expect(reflection.category).toBe(testAff.category);
    expect(reflection.sessionType).toBe('morning');

    const history = getReflectionHistory('user-123');
    expect(history.length).toBe(1);
    expect(history[0].affirmationId).toBe(testAff.id);
  });

  it('determines session type based on valid range', () => {
    const sessionType = getCurrentSessionType();
    expect(['morning', 'midday', 'night']).toContain(sessionType);
  });
});
