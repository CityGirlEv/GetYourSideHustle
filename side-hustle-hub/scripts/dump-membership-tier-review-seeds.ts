/** Dump membership tier review seed tasks as JSON (stdout). */
import { ensureMembershipTierReviewTasks } from "../src/lib/gysh-tasks.ts";

const { created } = ensureMembershipTierReviewTasks([]);
process.stdout.write(JSON.stringify(created));
