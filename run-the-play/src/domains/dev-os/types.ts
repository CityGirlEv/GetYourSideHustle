export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 
  | 'BACKLOG' 
  | 'READY' 
  | 'IN_PROGRESS' 
  | 'BLOCKED' 
  | 'READY_FOR_TESTING' 
  | 'TESTING' 
  | 'COMPLETE';

export type TaskType = 'FEATURE' | 'BUG' | 'REFACTOR' | 'INFRASTRUCTURE' | 'DOCS';
export type TestStatus = 'NOT_RUN' | 'PASS' | 'FAIL' | 'BLOCKED' | 'READY_FOR_RETEST';
export type DefectSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DefectStatus = 'OPEN' | 'IN_FIX' | 'RESOLVED' | 'RETEST_FAILED' | 'CLOSED';

export interface DevRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  sprint_target: string;
}

export interface DevUserStory {
  id: string;
  requirement_id: string;
  role: string;
  want: string;
  so_that: string;
}

export interface DevTask {
  id: string;
  requirement_id?: string;
  user_story_id?: string;
  title: string;
  description?: string;
  sprint: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  estimated_hours?: number;
  actual_hours?: number;
  acceptance_criteria: string[];
}

export interface DevTestCase {
  id: string;
  task_id?: string;
  requirement_id?: string;
  sprint: string;
  feature: string;
  preconditions?: string;
  steps: string[];
  expected_result: string;
}

export interface DevTestExecution {
  id: string;
  test_case_id: string;
  status: TestStatus;
  actual_result: string;
  tester_notes?: string;
  executed_by: string;
  executed_at: string;
}

export interface DevDefect {
  id: string;
  test_case_id?: string;
  task_id?: string;
  severity: DefectSeverity;
  description: string;
  reproduction_steps: string;
  expected_behavior: string;
  actual_behavior: string;
  status: DefectStatus;
  created_at: string;
  resolved_at?: string;
}

export interface TraceabilityItem {
  requirement_id: string;
  user_story_id?: string;
  task_id?: string;
  test_case_id?: string;
  test_status?: TestStatus;
  defect_id?: string;
}
