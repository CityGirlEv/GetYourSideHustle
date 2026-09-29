import { describe, it, expect } from 'vitest';
import {
  SPRINT_0_REQUIREMENTS,
  SPRINT_0_USER_STORIES,
  INITIAL_SPRINT_0_TASKS,
  INITIAL_TEST_CASES,
  INITIAL_TEST_EXECUTIONS,
  INITIAL_DEFECTS,
  getTraceabilityMatrix,
} from '../dev-os/store';

describe('Dev Operating System Domain', () => {
  it('should seed Sprint 0 requirements, stories, and tasks', () => {
    expect(SPRINT_0_REQUIREMENTS.length).toBeGreaterThanOrEqual(6);
    expect(SPRINT_0_USER_STORIES.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_SPRINT_0_TASKS.length).toBeGreaterThanOrEqual(8);
  });

  it('should generate a full Traceability Matrix without gaps', () => {
    const matrix = getTraceabilityMatrix(
      SPRINT_0_REQUIREMENTS,
      SPRINT_0_USER_STORIES,
      INITIAL_SPRINT_0_TASKS,
      INITIAL_TEST_CASES,
      INITIAL_TEST_EXECUTIONS,
      INITIAL_DEFECTS
    );

    expect(matrix.length).toEqual(SPRINT_0_REQUIREMENTS.length);
    matrix.forEach((item) => {
      expect(item.requirement_id).toBeDefined();
    });
  });
});
