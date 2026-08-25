import { TEST_CASES } from "../src/lib/gysh-test-plan.ts";
import { SCHEDULE_SUITE_QA_CASE_IDS, tomorrowMMDDYY, todayMMDDYY } from "../src/lib/gysh-tasks.ts";

function addDaysMMDDYY(days: number, ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

const tomorrow = tomorrowMMDDYY();
const dayAfter = addDaysMMDDYY(2);
const dateAssigned = todayMMDDYY();

/** Lyriq Schedule Suite QA cases only (tests, not tasks). Due dates split. */
const cases = SCHEDULE_SUITE_QA_CASE_IDS.map((id, i) => {
  const t = TEST_CASES.find((c) => c.id === id);
  return {
    id,
    assignee: t?.assignees[0] ?? "lyriq",
    dueDate: i < Math.ceil(SCHEDULE_SUITE_QA_CASE_IDS.length / 2) ? tomorrow : dayAfter,
    dateAssigned,
    sprint: 3,
  };
});

process.stdout.write(JSON.stringify({ tasks: [], cases }, null, 0));
