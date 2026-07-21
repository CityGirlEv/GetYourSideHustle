import { PROOFREAD_CASES } from "../src/lib/gysh-proofread-cases";

const rows = PROOFREAD_CASES.map((c) => ({
  id: c.id,
  title: c.title,
  catalogAssignee: c.assignees[0] ?? "",
}));
process.stdout.write(JSON.stringify(rows));
