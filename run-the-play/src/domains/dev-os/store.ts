import {
  DevRequirement,
  DevUserStory,
  DevTask,
  DevTestCase,
  DevTestExecution,
  DevDefect,
  TraceabilityItem,
  TestStatus,
} from './types';

export const SPRINT_0_REQUIREMENTS: DevRequirement[] = [
  {
    id: 'REQ-DOS-01',
    title: 'Development Operating System',
    description: 'Integrated Task Board, Testing Portal, Defect Tracker, and Traceability Matrix.',
    category: 'Development OS',
    sprint_target: 'Sprint 0',
  },
  {
    id: 'REQ-SCH-01',
    title: 'Multi-Tenant Relational Schema',
    description: 'PostgreSQL database DDL migration with workspace isolation and RLS policies.',
    category: 'Architecture',
    sprint_target: 'Sprint 0',
  },
  {
    id: 'REQ-REG-01',
    title: 'Platform Registry Engine',
    description: 'Configurable database platform registry seeded with 11 core platforms.',
    category: 'Platform Intelligence',
    sprint_target: 'Sprint 0',
  },
  {
    id: 'REQ-CON-01',
    title: 'Connector Architecture Contract',
    description: 'TypeScript contract interface for decoupled platform ingestion.',
    category: 'Data Ingestion',
    sprint_target: 'Sprint 0',
  },
  {
    id: 'REQ-PRV-01',
    title: 'Data Provenance & Missing-Data Engine',
    description: 'Explicit provenance classification and enforcement of missing data as NULL (never 0).',
    category: 'Data Provenance',
    sprint_target: 'Sprint 0',
  },
  {
    id: 'REQ-REC-01',
    title: 'AI Recommendation Contract Guard',
    description: 'Zod schema contract for structured verdict outputs and synthetic warning badges.',
    category: 'AI Engine',
    sprint_target: 'Sprint 0',
  },
];

export const SPRINT_0_USER_STORIES: DevUserStory[] = [
  {
    id: 'US-DOS-01',
    requirement_id: 'REQ-DOS-01',
    role: 'Engineering Lead',
    want: 'an integrated Dev OS Task Board',
    so_that: 'engineering progress and blockers are tracked transparently within the app.',
  },
  {
    id: 'US-DOS-02',
    requirement_id: 'REQ-DOS-01',
    role: 'QA Lead',
    want: 'a Testing Portal with execution history',
    so_that: 'every requirement is empirically validated before sprint acceptance.',
  },
  {
    id: 'US-PRV-01',
    requirement_id: 'REQ-PRV-01',
    role: 'Creator',
    want: 'real data explicitly distinguished from synthetic test data',
    so_that: 'I never make business decisions on fake metrics.',
  },
  {
    id: 'US-CON-01',
    requirement_id: 'REQ-CON-01',
    role: 'Developer',
    want: 'a unified Connector contract',
    so_that: 'adding social platforms requires zero recommendation engine changes.',
  },
];

export const INITIAL_SPRINT_0_TASKS: DevTask[] = [
  {
    id: 'TSK-DOS-001',
    requirement_id: 'REQ-DOS-01',
    user_story_id: 'US-DOS-01',
    title: 'Dev OS Domain Data Models & Types',
    description: 'Define TypeScript interfaces and store logic for tasks, tests, defects, and matrix.',
    sprint: 'Sprint 0',
    priority: 'CRITICAL',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 4,
    actual_hours: 3.5,
    acceptance_criteria: ['Types compile clean', 'Store functions supported'],
  },
  {
    id: 'TSK-DOS-002',
    requirement_id: 'REQ-DOS-01',
    user_story_id: 'US-DOS-01',
    title: 'Dev OS Task Board & Interactive Workflow UI',
    description: 'Build responsive Kanban board view supporting status transitions.',
    sprint: 'Sprint 0',
    priority: 'HIGH',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 6,
    actual_hours: 5,
    acceptance_criteria: ['Board renders all statuses', 'Status progression works'],
  },
  {
    id: 'TSK-DOS-003',
    requirement_id: 'REQ-DOS-01',
    user_story_id: 'US-DOS-02',
    title: 'Dev OS Testing Portal & Traceability Matrix UI',
    description: 'Build test execution logger and linked defect manager.',
    sprint: 'Sprint 0',
    priority: 'HIGH',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 6,
    actual_hours: 5.5,
    acceptance_criteria: ['Test execution logs persisted', 'Traceability matrix visible'],
  },
  {
    id: 'TSK-SCH-001',
    requirement_id: 'REQ-SCH-01',
    user_story_id: 'US-PRV-01',
    title: 'Multi-Tenant PostgreSQL DDL Migration',
    description: 'Create Supabase migration script for core schemas and RLS.',
    sprint: 'Sprint 0',
    priority: 'CRITICAL',
    status: 'COMPLETE',
    type: 'INFRASTRUCTURE',
    estimated_hours: 5,
    actual_hours: 4,
    acceptance_criteria: ['SQL DDL valid', 'All tables and enums created'],
  },
  {
    id: 'TSK-REG-001',
    requirement_id: 'REQ-REG-01',
    user_story_id: 'US-CON-01',
    title: 'Seeded Platform Registry Engine',
    description: 'Seed registry with YouTube, TikTok, Facebook, IG, X, Threads, LinkedIn, etc.',
    sprint: 'Sprint 0',
    priority: 'HIGH',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 3,
    actual_hours: 3,
    acceptance_criteria: ['11 platforms registered', 'Capability metadata accurate'],
  },
  {
    id: 'TSK-CON-001',
    requirement_id: 'REQ-CON-01',
    user_story_id: 'US-CON-01',
    title: 'TypeScript Connector Contract Interface',
    description: 'Export PlatformConnectorContract interface.',
    sprint: 'Sprint 0',
    priority: 'CRITICAL',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 3,
    actual_hours: 2.5,
    acceptance_criteria: ['Contract interface strict', 'Types exported'],
  },
  {
    id: 'TSK-PRV-001',
    requirement_id: 'REQ-PRV-01',
    user_story_id: 'US-PRV-01',
    title: 'Data Provenance & Missing-Data Engine',
    description: 'Sanitize metrics payloads to ensure missing values are NULL (never 0).',
    sprint: 'Sprint 0',
    priority: 'CRITICAL',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 4,
    actual_hours: 4,
    acceptance_criteria: ['Missing metrics return null', 'Synthetic flags enforced'],
  },
  {
    id: 'TSK-REC-001',
    requirement_id: 'REQ-REC-01',
    user_story_id: 'US-PRV-01',
    title: 'AI Recommendation Contract Guard & Validator',
    description: 'Build Zod schema validation for AI recommendations.',
    sprint: 'Sprint 0',
    priority: 'CRITICAL',
    status: 'COMPLETE',
    type: 'FEATURE',
    estimated_hours: 4,
    actual_hours: 3.5,
    acceptance_criteria: ['Valid payloads parse', 'Invalid payloads rejected'],
  },
];

export const INITIAL_TEST_CASES: DevTestCase[] = [
  {
    id: 'TC-PRV-01',
    task_id: 'TSK-PRV-001',
    requirement_id: 'REQ-PRV-01',
    sprint: 'Sprint 0',
    feature: 'Data Provenance Engine',
    preconditions: 'Synthetic metric ingestion payload initialized.',
    steps: [
      'Pass raw payload with missing watchTime field to buildNormalizedMetrics()',
      'Inspect output metric record for provenance flags and watch_time_seconds field',
    ],
    expected_result: 'watch_time_seconds is NULL (not 0); source_type is SIMULATED and is_synthetic is true.',
  },
  {
    id: 'TC-REC-01',
    task_id: 'TSK-REC-001',
    requirement_id: 'REQ-REC-01',
    sprint: 'Sprint 0',
    feature: 'AI Recommendation Guard',
    preconditions: 'Zod AIRecommendationSchema loaded.',
    steps: [
      'Submit valid verdict payload',
      'Submit invalid payload with missing verdict',
    ],
    expected_result: 'Valid payload returns success: true; invalid payload returns success: false with validation error.',
  },
  {
    id: 'TC-DOS-01',
    task_id: 'TSK-DOS-002',
    requirement_id: 'REQ-DOS-01',
    sprint: 'Sprint 0',
    feature: 'Dev OS Task Board',
    preconditions: 'Dev OS dashboard loaded.',
    steps: [
      'Navigate to Dev OS dashboard view',
      'Verify 7 status columns render with tasks',
    ],
    expected_result: 'Task Board displays all Sprint 0 tasks across statuses cleanly.',
  },
];

export const INITIAL_TEST_EXECUTIONS: DevTestExecution[] = [
  {
    id: 'exec-s0-01',
    test_case_id: 'TC-PRV-01',
    status: 'PASS',
    actual_result: 'Confirmed: watch_time_seconds returned NULL and is_synthetic was TRUE.',
    executed_by: 'QA Lead',
    executed_at: new Date().toISOString(),
  },
  {
    id: 'exec-s0-02',
    test_case_id: 'TC-REC-01',
    status: 'PASS',
    actual_result: 'Zod validation caught missing verdict field as expected.',
    executed_by: 'QA Lead',
    executed_at: new Date().toISOString(),
  },
  {
    id: 'exec-s0-03',
    test_case_id: 'TC-DOS-01',
    status: 'PASS',
    actual_result: 'Dev OS Task Board rendered all status columns and tasks.',
    executed_by: 'QA Lead',
    executed_at: new Date().toISOString(),
  },
];

export const INITIAL_DEFECTS: DevDefect[] = [];

export function getTraceabilityMatrix(
  requirements: DevRequirement[],
  stories: DevUserStory[],
  tasks: DevTask[],
  testCases: DevTestCase[],
  testExecutions: DevTestExecution[],
  defects: DevDefect[]
): TraceabilityItem[] {
  return requirements.map((req) => {
    const story = stories.find((s) => s.requirement_id === req.id);
    const task = tasks.find((t) => t.requirement_id === req.id);
    const testCase = testCases.find((tc) => tc.requirement_id === req.id || (task && tc.task_id === task.id));
    const execution = testCase ? testExecutions.find((e) => e.test_case_id === testCase.id) : undefined;
    const defect = testCase ? defects.find((d) => d.test_case_id === testCase.id) : undefined;

    return {
      requirement_id: req.id,
      user_story_id: story?.id,
      task_id: task?.id,
      test_case_id: testCase?.id,
      test_status: execution?.status || 'NOT_RUN',
      defect_id: defect?.id,
    };
  });
}
