import { useState } from 'react';
import {
  SPRINT_0_REQUIREMENTS,
  SPRINT_0_USER_STORIES,
  INITIAL_SPRINT_0_TASKS,
  INITIAL_TEST_CASES,
  INITIAL_TEST_EXECUTIONS,
  INITIAL_DEFECTS,
  getTraceabilityMatrix,
} from '../domains/dev-os/store';
import { DevTask, DevTestExecution, TaskStatus, TestStatus } from '../domains/dev-os/types';
import { SEEDED_PLATFORM_REGISTRY } from '../domains/registry/seed';
import { buildNormalizedMetrics } from '../domains/metrics/provenance';
import { validateRecommendation } from '../domains/recommendation/contract';

export default function DevOSDashboard() {
  const [activeTab, setActiveTab] = useState<'board' | 'testing' | 'traceability' | 'registry' | 'provenance'>('board');
  const [tasks, setTasks] = useState<DevTask[]>(INITIAL_SPRINT_0_TASKS);
  const [executions, setExecutions] = useState<DevTestExecution[]>(INITIAL_TEST_EXECUTIONS);
  const [defects] = useState(INITIAL_DEFECTS);
  
  // Provenance Demo State
  const [demoPayload, setDemoPayload] = useState<{ viewCount: number; watchTimeSeconds?: number }>({
    viewCount: 2450,
  });

  const statuses: TaskStatus[] = [
    'BACKLOG',
    'READY',
    'IN_PROGRESS',
    'BLOCKED',
    'READY_FOR_TESTING',
    'TESTING',
    'COMPLETE',
  ];

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const logTestExecution = (testCaseId: string, status: TestStatus, actualResult: string) => {
    const newExec: DevTestExecution = {
      id: `exec-${Date.now()}`,
      test_case_id: testCaseId,
      status,
      actual_result: actualResult,
      executed_by: 'QA Engineer (Dev OS UI)',
      executed_at: new Date().toISOString(),
    };
    setExecutions((prev) => [newExec, ...prev]);
  };

  const matrix = getTraceabilityMatrix(
    SPRINT_0_REQUIREMENTS,
    SPRINT_0_USER_STORIES,
    tasks,
    INITIAL_TEST_CASES,
    executions,
    defects
  );

  const demoMetrics = buildNormalizedMetrics({
    workspace_id: 'ws-demo-001',
    platform_publication_id: 'pub-yt-short-01',
    raw_payload: demoPayload,
    source_type: 'SIMULATED',
    source_platform: 'youtube',
    ingestion_run_id: 'run-demo-99',
  });

  const demoRecommendationValidation = validateRecommendation({
    verdict: 'KEEP_GOING',
    confidence: 'HIGH',
    why: [`View count reached ${demoMetrics.views ?? 0} with zero synthetic dilution`],
    whats_working: ['Strong initial hook', 'High engagement velocity'],
    whats_not_working: demoMetrics.watch_time_seconds === null ? ['Watch time data UNAVAILABLE'] : [],
    next_play: 'Maintain current posting frequency and double down on hook format.',
    what_to_test_next: 'Test high contrast thumbnail title text.',
    do_not_do: ['Do not edit title metadata during first 48 hours'],
    is_synthetic_recommendation: true,
    ai_provider: 'gemini-1.5-pro',
    prompt_version: '1.0.0',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              RUN THE PLAY — DEV OS
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Sprint 0 Baseline
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Functional Project Management, Quality Assurance Portal & Traceability Engine
          </p>
        </div>

        {/* Provenance Indicator Badge */}
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 px-4 py-2 rounded-lg">
          <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              DATA PROVENANCE: TEST DATA MODE
            </div>
            <div className="text-xs text-amber-200/80">
              TEST RECOMMENDATION — BASED ON SIMULATED DATA
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 my-6">
        {[
          { id: 'board', label: 'Task Board & Workflow' },
          { id: 'testing', label: 'Testing Portal' },
          { id: 'traceability', label: 'Traceability Matrix' },
          { id: 'registry', label: 'Platform Registry' },
          { id: 'provenance', label: 'Data Provenance Inspector' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB 1: TASK BOARD */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const statusTasks = tasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {status.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all rounded-lg p-3 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-400">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 mb-1 leading-snug">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-2 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Status Selector Dropdown */}
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="w-full text-[11px] bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            Move to {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TESTING PORTAL */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Sprint 0 Test Cases & Executions</h2>
            <div className="space-y-4">
              {INITIAL_TEST_CASES.map((tc) => {
                const latestExec = executions.find((e) => e.test_case_id === tc.id);
                return (
                  <div key={tc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          {tc.id}
                        </span>
                        <span className="text-sm font-bold text-slate-200">{tc.feature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Requirement: {tc.requirement_id}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            latestExec?.status === 'PASS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : latestExec?.status === 'FAIL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {latestExec?.status || 'NOT_RUN'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      <strong className="text-slate-400">Expected:</strong> {tc.expected_result}
                    </p>

                    {/* Quick Log Action */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() =>
                          logTestExecution(tc.id, 'PASS', 'Verified via automated test execution script.')
                        }
                        className="text-xs px-3 py-1 bg-emerald-700/40 hover:bg-emerald-600/60 text-emerald-200 rounded border border-emerald-600/50 transition-all"
                      >
                        Log PASS Execution
                      </button>
                      <button
                        onClick={() =>
                          logTestExecution(tc.id, 'FAIL', 'Simulated failure for verification.')
                        }
                        className="text-xs px-3 py-1 bg-rose-700/40 hover:bg-rose-600/60 text-rose-200 rounded border border-rose-600/50 transition-all"
                      >
                        Log FAIL Execution
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Execution History */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-md font-bold text-slate-200 mb-3">Execution History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-2.5">Test Case ID</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Actual Result</th>
                    <th className="p-2.5">Executed By</th>
                    <th className="p-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {executions.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-950/50">
                      <td className="p-2.5 font-mono text-blue-400">{e.test_case_id}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.status === 'PASS'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300">{e.actual_result}</td>
                      <td className="p-2.5 text-slate-400">{e.executed_by}</td>
                      <td className="p-2.5 text-slate-500 font-mono">
                        {new Date(e.executed_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRACEABILITY MATRIX */}
      {activeTab === 'traceability' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-slate-100 mb-2">Requirement Traceability Matrix</h2>
          <p className="text-xs text-slate-400 mb-4">
            Answers: <span className="italic font-semibold text-slate-200">"DID WE ACTUALLY BUILD AND TEST THIS REQUIREMENT?"</span>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-3 border-r border-slate-800">Requirement ID</th>
                  <th className="p-3 border-r border-slate-800">User Story</th>
                  <th className="p-3 border-r border-slate-800">Task ID</th>
                  <th className="p-3 border-r border-slate-800">Test Case ID</th>
                  <th className="p-3 border-r border-slate-800">QA Execution Status</th>
                  <th className="p-3">Defect ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {matrix.map((row) => (
                  <tr key={row.requirement_id} className="hover:bg-slate-950/60">
                    <td className="p-3 font-mono font-bold text-blue-300 border-r border-slate-800">
                      {row.requirement_id}
                    </td>
                    <td className="p-3 text-slate-300 border-r border-slate-800">
                      {row.user_story_id || 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-purple-300 border-r border-slate-800">
                      {row.task_id || 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-amber-300 border-r border-slate-800">
                      {row.test_case_id || 'N/A'}
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          row.test_status === 'PASS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : row.test_status === 'FAIL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {row.test_status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{row.defect_id || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM REGISTRY */}
      {activeTab === 'registry' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Configurable Platform Registry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEEDED_PLATFORM_REGISTRY.map((p) => (
              <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-bold text-slate-100">{p.display_name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.status === 'AVAILABLE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : p.status === 'BETA'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Auth Method: <span className="text-slate-200 font-mono">{p.auth_method}</span></div>
                  <div>Rate Limit: <span className="text-slate-200 font-mono">{p.rate_limit_rpm} RPM</span></div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                    {Object.entries(p.capabilities).map(([capKey, val]) => (
                      <span
                        key={capKey}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          val ? 'bg-blue-950 text-blue-300' : 'bg-slate-900 text-slate-600 line-through'
                        }`}
                      >
                        {capKey.replace('has_', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATA PROVENANCE INSPECTOR */}
      {activeTab === 'provenance' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">
              Data Provenance & Missing-Data Inspector
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrates strict non-negotiable rule: <span className="font-semibold text-amber-300">Missing metrics are NULL, NEVER defaulted to 0</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Simulate Raw Platform API Payload
              </h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Raw Views Count</label>
                <input
                  type="number"
                  value={demoPayload.viewCount}
                  onChange={(e) =>
                    setDemoPayload({ ...demoPayload, viewCount: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Watch Time Seconds (Leave blank to test NULL missing data)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={demoPayload.watchTimeSeconds ?? ''}
                  onChange={(e) =>
                    setDemoPayload({
                      ...demoPayload,
                      watchTimeSeconds: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Live Normalized Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 font-sans">
                Normalized Metric Output & Validation
              </h3>

              <div>
                <span className="text-slate-400">Views: </span>
                <span className="text-emerald-400 font-bold">{demoMetrics.views}</span>
              </div>

              <div>
                <span className="text-slate-400">Watch Time: </span>
                {demoMetrics.watch_time_seconds === null ? (
                  <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                    NULL (UNAVAILABLE)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">{demoMetrics.watch_time_seconds} s</span>
                )}
              </div>

              <div>
                <span className="text-slate-400">Source Type: </span>
                <span className="text-blue-300">{demoMetrics.provenance.source_type}</span>
              </div>

              <div>
                <span className="text-slate-400">Is Synthetic Data: </span>
                <span className="text-amber-300">{String(demoMetrics.provenance.is_synthetic)}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 font-sans">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Zod Verdict Validation:</h4>
                {demoRecommendationValidation.success ? (
                  <div className="bg-emerald-950/60 border border-emerald-700 text-emerald-300 p-2.5 rounded text-xs">
                    Verdict: <strong className="uppercase">{demoRecommendationValidation.data?.verdict}</strong> (Confidence: {demoRecommendationValidation.data?.confidence})
                  </div>
                ) : (
                  <div className="bg-rose-950/60 border border-rose-700 text-rose-300 p-2.5 rounded text-xs">
                    Validation Error: {demoRecommendationValidation.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
