import { d1Select, d1ExecFile } from "./_d1-remote.mjs";

const before = d1Select(
  "SELECT case_id, status, sprint FROM test_case_status WHERE case_id = 'auth-login-001'",
)?.[0]?.results;
console.log("before", before);

d1ExecFile(
  "DELETE FROM test_case_status WHERE case_id = 'auth-login-001' AND status = 'rolled_over' AND sprint = 2",
);

const left = d1Select(
  "SELECT COUNT(1) AS n FROM test_case_status WHERE status = 'rolled_over' AND sprint = 2",
)?.[0]?.results?.[0]?.n;
console.log("rolled_over left on S2", left);
