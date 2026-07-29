/**
 * DEPRECATED / DO NOT USE for “tag everything on Sprint 2”.
 *
 * Rollover tags belong only on tasks that were still open when Sprint 1 closed
 * (End Sprint Done path). Use End Sprint on the Schedule board, or
 * scripts/roll-sprint1-incomplete-tasks.mjs for incomplete Sprint 1 → 2 moves.
 *
 * To undo a mistaken bulk tag, run:
 *   node --use-system-ca scripts/untag-false-sprint2-task-rollovers.mjs
 */
console.error(
  "Refusing to bulk-tag all Sprint 2 tasks.\n" +
    "Only incomplete Sprint 1 tasks at close are rollovers.\n" +
    "Use End Sprint, or scripts/roll-sprint1-incomplete-tasks.mjs.\n" +
    "To remove false bulk tags: scripts/untag-false-sprint2-task-rollovers.mjs",
);
process.exit(1);
