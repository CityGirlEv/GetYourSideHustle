import {
  Affirmation,
  AffirmationCategory,
  AFFIRMATION_CATEGORIES,
  INITIAL_AFFIRMATIONS,
  SessionType,
  SESSION_META,
} from '../data/affirmations';

export const AFFIRMATIONS_DB_KEY = 'myplan_affirmations_db_v1';
export const AFFIRMATIONS_REFLECTIONS_KEY = 'myplan_affirmations_reflections_v1';
export const AFFIRMATIONS_DAILY_KEY = 'myplan_affirmations_daily_v1';

export interface AffirmationReflection {
  id: string;
  userId?: string;
  sessionType: SessionType;
  category: AffirmationCategory;
  affirmationId: string;
  selectedAt: string; // ISO date string
  sessionDate: string; // YYYY-MM-DD
}

export interface DailyCompletionStatus {
  date: string; // YYYY-MM-DD
  morning: boolean;
  midday: boolean;
  night: boolean;
}

// Planned architecture interface for Future Phase: Voice Trust Layer
export interface VoiceTrustAttempt {
  voiceSessionId: string;
  affirmationId: string;
  attemptNumber: number;
  confidenceScore?: number; // Will be computed by voice analyzer
  deliveryScore?: number;
  completion: boolean;
  timestamp: string;
  coachFeedback?: 'Again. Stronger.' | 'Ground yourself. Repeat.' | 'Powerful. Anchored.';
}

export interface AffirmationSessionState {
  sessionType: SessionType;
  affirmations: Affirmation[];
  currentIndex: number;
  phase: 'intro' | 'breath' | 'affirmation' | 'reflection' | 'complete';
  selectedReflectionId: string | null;
  reflectionSkipped: boolean;
  breathCountdown: number;
}

/**
 * Get all active affirmations from storage or fallback to initial seed
 */
export function getStoredAffirmations(): Affirmation[] {
  if (typeof window === 'undefined') return INITIAL_AFFIRMATIONS;
  try {
    const raw = localStorage.getItem(AFFIRMATIONS_DB_KEY);
    if (!raw) {
      localStorage.setItem(AFFIRMATIONS_DB_KEY, JSON.stringify(INITIAL_AFFIRMATIONS));
      return INITIAL_AFFIRMATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AFFIRMATIONS;
  } catch {
    return INITIAL_AFFIRMATIONS;
  }
}

/**
 * Save / update an affirmation (Admin Content Extensibility)
 */
export function saveAffirmation(item: Affirmation): Affirmation[] {
  const all = getStoredAffirmations();
  const existingIdx = all.findIndex((a) => a.id === item.id);
  let updated: Affirmation[];
  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...all];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AFFIRMATIONS_DB_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Determine the current natural session type based on local time
 * Morning: 5am - 12pm | Midday: 12pm - 6pm | Night: 6pm - 5am
 */
export function getCurrentSessionType(): SessionType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'midday';
  return 'night';
}

/**
 * Get the standardized today date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load reflection history for a user
 */
export function getReflectionHistory(userId?: string): AffirmationReflection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AFFIRMATIONS_REFLECTIONS_KEY);
    if (!raw) return [];
    const parsed: AffirmationReflection[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!userId) return parsed;
    return parsed.filter((r) => !r.userId || r.userId === userId);
  } catch {
    return [];
  }
}

/**
 * Calculate dynamic personalization weights based on user reflection resonance patterns
 */
export function calculateAffirmationWeights(
  affirmations: Affirmation[],
  reflections: AffirmationReflection[]
): Map<string, number> {
  const weightMap = new Map<string, number>();

  // Count reflections by affirmation ID and category
  const affCountMap = new Map<string, number>();
  const catCountMap = new Map<string, number>();

  reflections.forEach((r) => {
    affCountMap.set(r.affirmationId, (affCountMap.get(r.affirmationId) || 0) + 1);
    if (r.category) {
      catCountMap.set(r.category, (catCountMap.get(r.category) || 0) + 1);
    }
  });

  affirmations.forEach((aff) => {
    let weight = aff.displayWeight || 1.0;
    // Boost weight moderately based on direct user resonance
    const directHits = affCountMap.get(aff.id) || 0;
    const catHits = catCountMap.get(aff.category) || 0;
    weight += directHits * 0.75 + catHits * 0.25;
    weightMap.set(aff.id, weight);
  });

  return weightMap;
}

/**
 * Reusable Rotation Engine:
 * Selects 3-4 optimal affirmations for a session type, balancing category diversity and personalization resonance
 */
export function getSessionAffirmations(
  sessionType: SessionType,
  userId?: string,
  count: number = 3
): Affirmation[] {
  const all = getStoredAffirmations().filter(
    (a) => a.active && a.sessionTypes.includes(sessionType)
  );

  // Fallback to any active affirmations if session pool is unexpectedly empty
  const candidatePool = all.length > 0 ? all : getStoredAffirmations().filter((a) => a.active);
  if (candidatePool.length === 0) return INITIAL_AFFIRMATIONS.slice(0, count);

  const reflections = getReflectionHistory(userId);
  const weights = calculateAffirmationWeights(candidatePool, reflections);

  // Sort candidate pool with weighted randomization
  const weightedList = [...candidatePool].map((item) => ({
    item,
    score: (weights.get(item.id) || 1.0) * (0.8 + Math.random() * 0.4),
  }));

  weightedList.sort((a, b) => b.score - a.score);

  // Pick diverse categories when possible
  const selected: Affirmation[] = [];
  const usedCategories = new Set<string>();

  // First pass: unique categories
  for (const entry of weightedList) {
    if (selected.length >= count) break;
    if (!usedCategories.has(entry.item.category)) {
      selected.push(entry.item);
      usedCategories.add(entry.item.category);
    }
  }

  // Second pass: fill remaining slots if count not reached
  if (selected.length < count) {
    for (const entry of weightedList) {
      if (selected.length >= count) break;
      if (!selected.some((s) => s.id === entry.item.id)) {
        selected.push(entry.item);
      }
    }
  }

  return selected.length > 0 ? selected : candidatePool.slice(0, count);
}

/**
 * Get daily completion state for a given date
 */
export function getDailyCompletionStatus(
  dateStr: string = getTodayDateString()
): DailyCompletionStatus {
  const defaultStatus: DailyCompletionStatus = {
    date: dateStr,
    morning: false,
    midday: false,
    night: false,
  };

  if (typeof window === 'undefined') return defaultStatus;

  try {
    const raw = localStorage.getItem(AFFIRMATIONS_DAILY_KEY);
    if (!raw) return defaultStatus;
    const allRecords: Record<string, DailyCompletionStatus> = JSON.parse(raw);
    return allRecords[dateStr] || defaultStatus;
  } catch {
    return defaultStatus;
  }
}

/**
 * Save session completion and update daily completion status
 */
export function recordSessionCompletion(
  sessionType: SessionType,
  dateStr: string = getTodayDateString()
): DailyCompletionStatus {
  const current = getDailyCompletionStatus(dateStr);
  const updated: DailyCompletionStatus = {
    ...current,
    [sessionType]: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(AFFIRMATIONS_DAILY_KEY);
      const allRecords: Record<string, DailyCompletionStatus> = raw ? JSON.parse(raw) : {};
      allRecords[dateStr] = updated;
      localStorage.setItem(AFFIRMATIONS_DAILY_KEY, JSON.stringify(allRecords));
    } catch (e) {
      console.error('Failed to persist daily affirmation completion', e);
    }
  }

  return updated;
}

/**
 * Save user's optional 10-second reflection selection
 */
export function recordReflectionSelection(
  sessionType: SessionType,
  affirmation: Affirmation,
  userId?: string
): AffirmationReflection {
  const reflection: AffirmationReflection = {
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    sessionType,
    category: affirmation.category,
    affirmationId: affirmation.id,
    selectedAt: new Date().toISOString(),
    sessionDate: getTodayDateString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const history = getReflectionHistory();
      const updated = [reflection, ...history];
      localStorage.setItem(AFFIRMATIONS_REFLECTIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save affirmation reflection', e);
    }
  }

  return reflection;
}

/**
 * Reset daily affirmations status (Useful for QA & Testing Portal)
 */
export function resetDailyAffirmationsForTesting(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AFFIRMATIONS_DAILY_KEY);
}

/**
 * Reset reflection history (Useful for QA & Testing Portal)
 */
export function resetReflectionsForTesting(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AFFIRMATIONS_REFLECTIONS_KEY);
}
