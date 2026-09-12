/** Dump social analytics review seed tasks as JSON (stdout). */
import { ensureSocialAnalyticsReviewTasks } from "../src/lib/social-analytics-review-tasks.ts";

const { created } = ensureSocialAnalyticsReviewTasks([]);
process.stdout.write(JSON.stringify(created));
