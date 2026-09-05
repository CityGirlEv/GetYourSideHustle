/** Structured QA Testing Manual — screen + PDF (Admin → Testing Portal → Manual). */

export type ManualStatusRow = {
  status: string;
  meaning: string;
  who: string;
  note: string;
  done: string;
  color: string;
};

export type ManualFlowStep = {
  title: string;
  detail?: string;
};

export type ManualFlow = {
  id: string;
  title: string;
  steps: ManualFlowStep[];
};

export type FlowchartNodeKind = "process" | "decision" | "status" | "end";

export type FlowchartNode = {
  label: string;
  kind?: FlowchartNodeKind;
  /** Accent for status-colored boxes */
  tone?: "pass" | "cond" | "fail" | "blocked" | "fixed" | "cursor" | "retest" | "muted";
};

export type FlowchartRow =
  | { type: "node"; node: FlowchartNode; arrow?: string }
  | { type: "branch"; label?: string; nodes: FlowchartNode[]; joinLabel?: string }
  | { type: "note"; text: string };

export type ManualFlowchart = {
  id: string;
  title: string;
  caption?: string;
  rows: FlowchartRow[];
};

export const QA_TESTING_MANUAL = {
  title: "GYSH Testing Manual",
  subtitle: "For every QA tester (Tina, Evelyn, Lyriq, Candace, and anyone with the QA role)",
  lead:
    "How to run tests in the Testing Portal, what each status means, who can be assigned, and what happens after Fail, Conditional Pass, and system (Cursor) fixes.",
  where:
    "Admin → Testing Portal (Schedule & Plan shows the same cases as sprint cards). Open this manual anytime from Testing Portal → Testing Manual.",
  filename: "GYSH-QA-Testing-Manual.pdf",
  access: [
    "You need an active login with the QA role (Admin and/or Dev optional).",
    "QA is not full Admin — Financials and Content Factory stay Admin-only.",
    "Anyone with the QA role (active or pending) appears on Testing Portal and Schedule test assignee lists and QA Testors chips.",
    "Assigning a test to someone does not grant login by itself — give them the QA role and activate when they should sign in.",
    "After Admin/QA login you usually land on Testing Portal (Tina/Lyriq may land on Agenda first if meeting times are still required).",
  ],
  quickStart: [
    "Open Testing Portal (Admin menu → Testing Portal, or after login).",
    "Sprint filter defaults to All sprints — click a sprint chip to narrow to one sprint.",
    "Filter by your name chip under QA Testors so you only see your cases.",
    "Use External vs Internal, suite (Manual / Vitest / Playwright), status, and search as needed.",
    "Open a case → follow the steps → check them off as you go.",
    "Set a final status (Pass / Conditional Pass / Fail) and add a note when required.",
    "Watch for Fixed/Re-Test, Fixed/Cursor, Fixed/Lighthouse, and Fixed/Foresight — those are ready for you to re-test.",
  ],
  statuses: [
    {
      status: "Not Started",
      meaning: "Not begun yet",
      who: "Default",
      note: "No",
      done: "No",
      color: "#6b5344",
    },
    {
      status: "In Progress",
      meaning: "You started working it",
      who: "You",
      note: "No",
      done: "No",
      color: "#b8860b",
    },
    {
      status: "Rolled Over",
      meaning: "Carried from a prior sprint at End Sprint / rollover — still open work",
      who: "System (End Sprint)",
      note: "Usually yes (rollover note)",
      done: "No — treat like open work",
      color: "#7c6f64",
    },
    {
      status: "Pass",
      meaning: "Product matches expectations; all steps OK",
      who: "You",
      note: "No",
      done: "Yes",
      color: "#3f6b2e",
    },
    {
      status: "Conditional Pass",
      meaning: "Acceptable with conditions (copy tweak, follow-up, Evelyn review, etc.)",
      who: "You",
      note: "Yes — describe conditions",
      done: "Yes (tracked as Cond. Pass)",
      color: "#0f766e",
    },
    {
      status: "Fail",
      meaning: "Real product bug or broken behavior",
      who: "You",
      note: "Yes — what failed + select step",
      done: "Yes (as a failure)",
      color: "#9B2F28",
    },
    {
      status: "Blocked",
      meaning: "Cannot run (environment, missing data, dependency)",
      who: "Evelyn (Lead Dev) only",
      note: "Yes",
      done: "Yes",
      color: "#a16207",
    },
    {
      status: "Fixed/Re-Test",
      meaning: "Evelyn fixed a real bug; back to you to verify",
      who: "Evelyn (Lead Dev) only",
      note: "Yes (what was fixed)",
      done: "No — open until re-test",
      color: "#2563eb",
    },
    {
      status: "Failed/Re-Test",
      meaning: "Fail was invalid (misunderstood / unclear test)",
      who: "Evelyn (Lead Dev) only",
      note: "Yes (why not a real fail)",
      done: "No — open until re-test",
      color: "#f97316",
    },
    {
      status: "Fixed/Cursor",
      meaning: "Cursor/system fixed the issue; back to you to verify",
      who: "Evelyn or Cursor",
      note: "Yes + Please re-test.",
      done: "No — open until re-test",
      color: "#7c3aed",
    },
    {
      status: "Fixed/Lighthouse",
      meaning: "Lighthouse / performance audit item fixed; back to you to verify",
      who: "Evelyn or Cursor",
      note: "Yes",
      done: "No — open until re-test",
      color: "#0ea5e9",
    },
    {
      status: "Fixed/Foresight",
      meaning: "Foresight audit item fixed; back to you to verify",
      who: "Evelyn or Cursor",
      note: "Yes",
      done: "No — open until re-test",
      color: "#0891b2",
    },
  ] satisfies ManualStatusRow[],
  statusCallout:
    "Anything the system (Cursor) fixes — whether it started as a Fail or a Conditional Pass — moves to Fixed/Cursor (or Fixed/Lighthouse / Fixed/Foresight when those audits apply). Those cases leave the Fail / Conditional Pass counts until you re-test.",
  flows: [
    {
      id: "main",
      title: "Main testing path",
      steps: [
        {
          title: "Open a case assigned to you",
          detail: "Filter by your QA Testors chip (your first name). Assignees come from Users Area → QA role.",
        },
        { title: "Set In Progress", detail: "Optional but helpful while you work." },
        { title: "Work through steps", detail: "Check them off as you go. Use Open links in steps when provided." },
        {
          title: "Choose an outcome",
          detail: "Pass · Conditional Pass (+ note) · Fail (step + note) · or ask Evelyn for Blocked.",
        },
        {
          title: "If Fail → Evelyn (or Cursor) triage",
          detail: "Fixed/Re-Test, Failed/Re-Test, Fixed/Cursor, Fixed/Lighthouse, or Fixed/Foresight — then handed back to you.",
        },
        {
          title: "Re-test when Fixed/* appears",
          detail: "Clean checklist → Pass, Conditional Pass, or Fail again.",
        },
      ],
    },
    {
      id: "fail",
      title: "Fail path",
      steps: [
        { title: "Mark Fail", detail: "Select which step failed." },
        {
          title: "Write a note",
          detail: "Describe what broke. Attach evidence if helpful (images/docs under ~8MB; videos up to ~20MB).",
        },
        { title: "System remembers you", detail: "You stay the original tester." },
        { title: "Assigned to Evelyn", detail: "Lead Dev triage — shows in the Fail count." },
        {
          title: "Fix path",
          detail:
            "Evelyn → Fixed/Re-Test or Failed/Re-Test · Cursor → Fixed/Cursor (or Lighthouse/Foresight) + note.",
        },
        {
          title: "Handed back to you",
          detail: "Steps cleared · you re-test · set Pass / Cond Pass / Fail.",
        },
      ],
    },
    {
      id: "conditional",
      title: "Conditional Pass path",
      steps: [
        { title: "Mark Conditional Pass", detail: "Required note describing the conditions." },
        { title: "Counts as Cond. Pass", detail: "Teal segment on progress bars." },
        {
          title: "Follow-up",
          detail:
            "Assigned to Evelyn (Lead Developer) automatically. Cursor may fix product/copy → Fixed/Cursor, or leave as Cond. Pass.",
        },
        {
          title: "If Fixed/Cursor",
          detail: "Note starts with Previously Conditional Pass. Ends with Please re-test. <your name>",
        },
        { title: "You re-test", detail: "Then set Pass, Conditional Pass, or Fail." },
      ],
    },
  ] satisfies ManualFlow[],
  flowcharts: [
    {
      id: "main",
      title: "Main testing path",
      caption: "Start a case, choose an outcome, then re-test when a Fixed/* status comes back.",
      rows: [
        { type: "node", node: { label: "Open case assigned to you", kind: "process" } },
        { type: "node", node: { label: "Set In Progress", kind: "process" } },
        { type: "node", node: { label: "Work through steps / check them off", kind: "process" } },
        {
          type: "node",
          node: { label: "Outcome?", kind: "decision" },
          arrow: "Choose one",
        },
        {
          type: "branch",
          label: "Your outcome",
          nodes: [
            { label: "Pass", kind: "status", tone: "pass" },
            { label: "Conditional Pass + note", kind: "status", tone: "cond" },
            { label: "Fail: step + note", kind: "status", tone: "fail" },
            { label: "Ask Evelyn → Blocked", kind: "status", tone: "blocked" },
          ],
        },
        {
          type: "branch",
          label: "After Fail / triage",
          nodes: [
            { label: "Evelyn → Fixed/Re-Test", kind: "status", tone: "fixed" },
            { label: "Evelyn → Failed/Re-Test", kind: "status", tone: "retest" },
            { label: "Cursor → Fixed/Cursor", kind: "status", tone: "cursor" },
          ],
          joinLabel: "Handed back to original tester",
        },
        {
          type: "note",
          text: "Conditional Pass may also become Fixed/Cursor if Cursor addresses the conditions. Lighthouse/Foresight use their own Fixed/* statuses.",
        },
        {
          type: "node",
          node: { label: "You re-test from a clean checklist → Outcome again", kind: "process" },
        },
        {
          type: "node",
          node: { label: "Done when Pass (or left as Cond. Pass)", kind: "end", tone: "pass" },
          arrow: "",
        },
      ],
    },
    {
      id: "fail",
      title: "Fail path (detail)",
      caption: "What happens after you mark Fail.",
      rows: [
        { type: "node", node: { label: "You mark Fail", kind: "status", tone: "fail" } },
        { type: "node", node: { label: "Select which step failed", kind: "process" } },
        {
          type: "node",
          node: { label: "Write note: what broke (+ optional attachment)", kind: "process" },
        },
        {
          type: "branch",
          label: "System",
          nodes: [
            { label: "Remember you as original tester", kind: "process", tone: "muted" },
            { label: "Assign to Evelyn (Lead Dev)", kind: "process", tone: "muted" },
            { label: "Show in Fail count", kind: "process", tone: "muted" },
          ],
        },
        {
          type: "branch",
          label: "Who fixes?",
          nodes: [
            { label: "Evelyn: Fixed/Re-Test", kind: "status", tone: "fixed" },
            { label: "Evelyn: Failed/Re-Test", kind: "status", tone: "retest" },
            { label: "Cursor: Fixed/Cursor + note", kind: "status", tone: "cursor" },
          ],
          joinLabel: "Assignee returns to original tester · steps cleared",
        },
        {
          type: "node",
          node: { label: "You re-test → Pass / Cond Pass / Fail again", kind: "end", tone: "pass" },
        },
      ],
    },
    {
      id: "conditional",
      title: "Conditional Pass path (detail)",
      caption: "When you pass with conditions — and when Cursor brings it back.",
      rows: [
        { type: "node", node: { label: "You mark Conditional Pass", kind: "status", tone: "cond" } },
        { type: "node", node: { label: "Required note: describe the conditions", kind: "process" } },
        { type: "node", node: { label: "Counts as Cond. Pass (teal on progress bar)", kind: "process" } },
        {
          type: "node",
          node: { label: "Follow-up?", kind: "decision" },
          arrow: "One of these",
        },
        {
          type: "branch",
          nodes: [
            { label: "Cursor fixes → Fixed/Cursor", kind: "status", tone: "cursor" },
            { label: "Assigned to Evelyn (Lead Developer)", kind: "status", tone: "cond" },
            { label: "Leave as Conditional Pass", kind: "status", tone: "muted" },
          ],
        },
        {
          type: "note",
          text: "If Fixed/Cursor: note starts with “Previously Conditional Pass.” and ends with “Please re-test.” plus your name.",
        },
        {
          type: "node",
          node: { label: "You re-test and set Pass / Cond Pass / Fail", kind: "end", tone: "pass" },
        },
      ],
    },
  ] satisfies ManualFlowchart[],
  outcomes: [
    {
      title: "Pass",
      bullets: [
        "Check all steps (or the portal fills them when you click Pass).",
        "No note required.",
        "Case is finished unless someone reopens it later.",
      ],
    },
    {
      title: "Conditional Pass",
      bullets: [
        "Always write a note describing the conditions.",
        "Examples: “Footer CTAs go to the same page.” / “Should be reviewed by Evelyn.”",
        "You do not need every step checked (unlike Pass).",
        "Still a resolved outcome, but signals follow-up work. End Sprint treats Conditional Pass as complete.",
      ],
    },
    {
      title: "Fail",
      bullets: [
        "Select which step failed.",
        "Always write a note describing the failure.",
        "Optional attachment: image, video (mp4/webm/mov), PDF, Word, or Excel — images/docs under ~8MB; videos up to ~20MB.",
        "System saves you as original tester, assigns Evelyn (Lead Dev), counts under Fail.",
      ],
    },
    {
      title: "Blocked",
      bullets: [
        "Only Evelyn (Lead Dev) can set this.",
        "If stuck, leave a note / message Evelyn so she can Block it with a reason.",
      ],
    },
  ],
  fixedCursor: {
    title: "Fixed/Cursor — system fixes",
    intro: "When Cursor (or the Cursor process) fixes something for you:",
    bullets: [
      "Status becomes Fixed/Cursor (purple on progress bars) — or Fixed/Lighthouse / Fixed/Foresight for those audits.",
      "The case is handed back to you (original tester).",
      "Step checkboxes are cleared so you re-test cleanly.",
      "A Cursor note is appended — older notes are kept; nothing should be deleted.",
    ],
    failFormat: "Previously Failed. <what was fixed>. Please re-test. <your name>",
    condFormat: "Previously Conditional Pass. <what was fixed>. Please re-test. <your name>",
    job: [
      "Read your original note + the Cursor note.",
      "Re-run the case on the live site (or Admin Studio for Internal cases).",
      "Set Pass, Conditional Pass (with a new note if still conditional), or Fail again.",
    ],
  },
  retestCompare: [
    {
      status: "Fixed/Re-Test",
      meaning: "Evelyn fixed a real bug",
      after: "Pass if fixed; Fail again if not",
    },
    {
      status: "Failed/Re-Test",
      meaning: "Your Fail was not a product bug",
      after: "Clarify, then Pass / adjust / Fail with a clearer note",
    },
    {
      status: "Fixed/Cursor",
      meaning: "System fixed Fail or Conditional Pass follow-up",
      after: "Verify, then set final status (same as Fixed/Re-Test)",
    },
    {
      status: "Fixed/Lighthouse",
      meaning: "Lighthouse audit item fixed",
      after: "Re-check the audit item, then Pass / Fail",
    },
    {
      status: "Fixed/Foresight",
      meaning: "Foresight audit item fixed",
      after: "Re-check the audit item, then Pass / Fail",
    },
  ],
  progressColors: [
    { label: "Pass", color: "#3f6b2e" },
    { label: "Conditional Pass", color: "#0f766e" },
    { label: "Fail", color: "#9B2F28" },
    { label: "Blocked", color: "#a16207" },
    { label: "Fixed/Re-Test", color: "#2563eb" },
    { label: "Failed/Re-Test", color: "#f97316" },
    { label: "Fixed/Cursor", color: "#7c3aed", emphasize: true },
    { label: "Fixed/Lighthouse", color: "#0ea5e9" },
    { label: "Fixed/Foresight", color: "#0891b2" },
    { label: "Rolled Over", color: "#7c6f64" },
    { label: "In Progress", color: "#b8860b" },
    { label: "Not Started", color: "#6b5344" },
  ],
  progressNote:
    "QA Testors chips show abbreviated status counts (Pass, Cond, Fail, plus any other statuses you have). Conditional Pass is listed separately as Cond. System fixes count under Fixed/Cursor (or Lighthouse/Foresight) until you re-test.",
  noteRules: [
    { situation: "Pass", note: "Optional" },
    { situation: "Conditional Pass", note: "Required — conditions" },
    { situation: "Fail", note: "Required — what broke + which step" },
    { situation: "Blocked", note: "Required (Evelyn)" },
    {
      situation: "Fixed/Cursor, Fixed/Re-Test, Failed/Re-Test, Fixed/Lighthouse, Fixed/Foresight",
      note: "Required (writer of that status)",
    },
  ],
  noteTips: [
    "Prefer short, clear sentences.",
    "Do not delete older notes. Add a new note entry if you need to update.",
    "Attach evidence when it helps (Fail / Conditional Pass).",
  ],
  boardVsPortal: [
    "Testing Portal = run tests, set statuses, notes, evidence, bulk assign.",
    "Schedule & Plan = same tests as cards on a sprint; use it for sprint load and End Sprint.",
    "Sprint filter defaults to All sprints on Testing Portal. Task List and Content Factory still default to the current sprint.",
    "Assignee dropdowns / QA Testors chips list everyone with the QA role from Users Area (active or pending).",
    "When in doubt, trust Testing Portal → your name chip for your test progress.",
  ],
  checklist: [
    "Confirm you have the QA role and can see your chip under QA Testors",
    "Filter Testing Portal to your name (All sprints on open — narrow a sprint if needed)",
    "Work current-sprint / due items first",
    "Pass only when truly good",
    "Conditional Pass only with a clear conditions note",
    "Fail with failed step + note (goes to Evelyn / Lead Dev)",
    "When status is Fixed/* → re-test, then set Pass / Cond Pass / Fail",
    "Never remove prior notes — only add",
  ],
  footer:
    "Questions about Blocked, Fixed/Re-Test, ownership, or adding a new QA tester → Evelyn (Lead Developer) or an Admin in Users Area.",
} as const;
