import { ALL_TEMPLATES } from "@/lib/email-templates/all-templates.server";
import { listTemplateMergeFields } from "@/lib/email-templates/template-merge-fields.server";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

export interface EmailTemplateCatalogEntry {
  name: string;
  displayName: string;
  kind: "transactional" | "auth";
  description: string;
  trigger: string;
  defaultSubject: string;
  recipient: string;
  mergeFields: string[];
  sourceFile: string;
  invokedFrom: string[];
  dependencies: string[];
  notes?: string;
}

export interface EmailTemplateCatalogDocument {
  generatedAt: string;
  site: string;
  systemDependencies: string[];
  templates: EmailTemplateCatalogEntry[];
}

const SYSTEM_DEPENDENCIES = [
  "Resend API (RESEND_API_KEY) — outbound delivery",
  "Verified sender domain in Resend (FROM address)",
  "email_send_log + email queue processor — async send pipeline",
  "email_template_overrides — optional admin-edited HTML/subject",
  "Email header/footer logos (public/email-logo.png, email-footer-logo.png)",
  "ADMIN_NOTIFICATION_EMAILS — comma-separated admin inboxes for *-admin templates; [BCC] copies skip evelyn3/sharpebanker (see admin-notification-emails.ts)",
];

const COMMON_TRANSACTIONAL_DEPS = [
  "dispatch-transactional-template.server.ts",
  "email_template_overrides table (optional custom body/subject)",
];

const EXTENDED_META: Record<
  string,
  Omit<
    EmailTemplateCatalogEntry,
    "name" | "displayName" | "kind" | "description" | "trigger" | "defaultSubject" | "mergeFields"
  >
> = {
  "new-registration-admin": {
    recipient: "All admin notification inboxes (ADMIN_NOTIFICATION_EMAILS)",
    sourceFile: "src/lib/email-templates/new-registration-admin.tsx",
    invokedFrom: ["src/lib/registration.functions.ts → notifyAdminNewRegistration()"],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "ADMIN_NOTIFICATION_EMAILS env var"],
    notes: "Admin-only template; name ends with -admin (no marketing BCC on sends).",
  },
  "account-enabled-admin": {
    recipient: "All admin notification inboxes",
    sourceFile: "src/lib/email-templates/account-enabled-admin.tsx",
    invokedFrom: ["src/lib/admin.functions.ts → notifyAdminsAccountEnabled()"],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "ADMIN_NOTIFICATION_EMAILS env var"],
  },
  welcome: {
    recipient: "Newly enabled user (their account email)",
    sourceFile: "src/lib/email-templates/welcome.tsx",
    invokedFrom: ["src/lib/admin.functions.ts → sendAccountApprovedEmail()"],
    dependencies: COMMON_TRANSACTIONAL_DEPS,
  },
  "agent-assignment": {
    recipient: "Assigned licensed agent",
    sourceFile: "src/lib/email-templates/agent-assignment.tsx",
    invokedFrom: ["src/lib/admin.functions.ts → assignAgent()"],
    dependencies: COMMON_TRANSACTIONAL_DEPS,
    notes: "Sent when admin picks an agent on Admin → Scenarios & contacts.",
  },
  "contact-request": {
    recipient: "Consumer who opted in on scenario confirmation",
    sourceFile: "src/lib/email-templates/contact-request.tsx",
    invokedFrom: ["src/lib/email-triggers.functions.ts → submitExpertContactRequest()"],
    dependencies: COMMON_TRANSACTIONAL_DEPS,
  },
  "scenario-claimed": {
    recipient: "Consumer (expert opt-in email or scenario creator contact if available)",
    sourceFile: "src/lib/email-templates/scenario-claimed.tsx",
    invokedFrom: ["src/lib/email-triggers.functions.ts → notifyScenarioClaimed()"],
    dependencies: [
      ...COMMON_TRANSACTIONAL_DEPS,
      "expert_contact_requests or scenario creator lookup",
    ],
  },
  "beta-test-assignment": {
    recipient: "Enabled QA tester / assignee email",
    sourceFile: "src/lib/email-templates/beta-test-assignment.tsx",
    invokedFrom: [
      "src/lib/qa-test-assignment.functions.ts",
      "src/lib/admin.functions.ts → sendAssignmentEmailOnUserEnable()",
      "src/lib/staff-email.functions.ts (manual admin send)",
    ],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "test_results assignee roster"],
    notes: "Not sent on Testing Portal assign/save — only on user enable and manual admin trigger.",
  },
  "beta-test-unassigned": {
    recipient: "Enabled QA tester (previous owner)",
    sourceFile: "src/lib/email-templates/beta-test-unassigned.tsx",
    invokedFrom: ["src/lib/qa-test-assignment.functions.ts → notifyBetaTestUnassignments()"],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "test_results assignee labels"],
    notes: "Fired when Testing Portal save moves owner to Unassigned.",
  },
  "beta-test-dev-note": {
    recipient: "Enabled QA tester (primary owner) + admin notification inboxes",
    sourceFile: "src/lib/email-templates/beta-test-dev-note.tsx",
    invokedFrom: ["src/lib/qa-test-assignment.functions.ts → notifyBetaTestDevNotes()"],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "test_results assignee labels", "dev_notes"],
    notes: "Fired when Testing Portal save includes a new or updated dev note.",
  },
  "beta-test-qa-retest": {
    recipient: "Enabled QA tester (primary owner) + admin notification inboxes",
    sourceFile: "src/lib/email-templates/beta-test-qa-retest.tsx",
    invokedFrom: ["src/lib/qa-test-assignment.functions.ts → notifyBetaTestQaRetest()"],
    dependencies: [...COMMON_TRANSACTIONAL_DEPS, "test_results assignee labels"],
    notes: "Fired when Testing Portal save sets status to fixed_retest or failed_retest.",
  },
  "qa-daily-summary-admin": {
    recipient: "All admin notification inboxes",
    sourceFile: "src/lib/email-templates/qa-daily-summary-admin.tsx",
    invokedFrom: [
      "src/lib/qa-daily-summary.server.ts",
      "Scheduled POST /api/cron/qa-daily-summary (or manual admin trigger)",
    ],
    dependencies: [
      ...COMMON_TRANSACTIONAL_DEPS,
      "test_results table",
      "ADMIN_NOTIFICATION_EMAILS env var",
    ],
  },
  "scenario-assignment-admin": {
    recipient: "All admin notification inboxes",
    sourceFile: "src/lib/email-templates/scenario-assignment-admin.tsx",
    invokedFrom: ["src/lib/admin.functions.ts → assignAgent()"],
    dependencies: [
      ...COMMON_TRANSACTIONAL_DEPS,
      "scenarios.assigned_agent_id",
      "ADMIN_NOTIFICATION_EMAILS env var",
    ],
    notes: "Includes roster of all current scenario assignments by agent.",
  },
  "qa-registration-confirmation": {
    recipient: "New QA registrant",
    sourceFile: "src/lib/email-templates/qa-registration-confirmation.tsx",
    invokedFrom: ["src/lib/registration.functions.ts → after QA sign-up"],
    dependencies: COMMON_TRANSACTIONAL_DEPS,
  },
  "agent-registration-confirmation": {
    recipient: "New agent registrant",
    sourceFile: "src/lib/email-templates/agent-registration-confirmation.tsx",
    invokedFrom: ["src/lib/registration.functions.ts → after agent sign-up"],
    dependencies: COMMON_TRANSACTIONAL_DEPS,
  },
  signup: {
    recipient: "User signing up (Supabase Auth)",
    sourceFile: "src/lib/email-templates/signup.tsx",
    invokedFrom: ["Supabase Auth → POST /lovable/email/auth/webhook (emailType=signup)"],
    dependencies: [
      "Supabase Auth email hook",
      "Auth webhook route",
      "Merge fields: confirmationUrl, email, siteUrl",
    ],
    notes: "Auth templates are sent via the Supabase auth webhook, not the transactional queue.",
  },
  invite: {
    recipient: "Invited user (Supabase Auth)",
    sourceFile: "src/lib/email-templates/invite.tsx",
    invokedFrom: ["Supabase Auth → auth webhook (emailType=invite)"],
    dependencies: ["Supabase Auth email hook", "Auth webhook route"],
  },
  magiclink: {
    recipient: "User requesting magic link",
    sourceFile: "src/lib/email-templates/magic-link.tsx",
    invokedFrom: ["Supabase Auth → auth webhook (emailType=magiclink)"],
    dependencies: ["Supabase Auth email hook", "Auth webhook route"],
  },
  recovery: {
    recipient: "User requesting password reset",
    sourceFile: "src/lib/email-templates/recovery.tsx",
    invokedFrom: ["Supabase Auth → auth webhook (emailType=recovery)"],
    dependencies: ["Supabase Auth email hook", "Auth webhook route"],
  },
  email_change: {
    recipient: "User confirming email change",
    sourceFile: "src/lib/email-templates/email-change.tsx",
    invokedFrom: ["Supabase Auth → auth webhook (emailType=email_change)"],
    dependencies: ["Supabase Auth email hook", "Auth webhook route"],
  },
  reauthentication: {
    recipient: "User performing sensitive action",
    sourceFile: "src/lib/email-templates/reauthentication.tsx",
    invokedFrom: ["Supabase Auth → auth webhook (emailType=reauthentication)"],
    dependencies: ["Supabase Auth email hook", "Auth webhook route", "Merge field: token"],
  },
};

export function buildEmailTemplateCatalog(opts?: {
  overriddenNames?: Set<string>;
}): EmailTemplateCatalogDocument {
  const templates: EmailTemplateCatalogEntry[] = ALL_TEMPLATES.map((t) => {
    const meta = EXTENDED_META[t.name] ?? {
      recipient: t.kind === "auth" ? "Supabase Auth user" : "Varies by trigger",
      sourceFile: `src/lib/email-templates/${t.name}.tsx`,
      invokedFrom: ["See trigger description"],
      dependencies: t.kind === "auth" ? ["Supabase Auth email hook"] : COMMON_TRANSACTIONAL_DEPS,
    };
    const entry: EmailTemplateCatalogEntry = {
      name: t.name,
      displayName: t.displayName,
      kind: t.kind,
      description: t.description,
      trigger: t.trigger,
      defaultSubject: t.defaultSubject,
      mergeFields: listTemplateMergeFields(t.name),
      ...meta,
    };
    if (opts?.overriddenNames?.has(t.name)) {
      entry.notes = [entry.notes, "Custom override active in admin editor."]
        .filter(Boolean)
        .join(" ");
    }
    return entry;
  });

  return {
    generatedAt: new Date().toISOString(),
    site: `${SITE_BRAND_NAME} (mypartb.com)`,
    systemDependencies: SYSTEM_DEPENDENCIES,
    templates,
  };
}

export function catalogToCsv(doc: EmailTemplateCatalogDocument): string {
  const headers = [
    "name",
    "displayName",
    "kind",
    "description",
    "trigger",
    "defaultSubject",
    "recipient",
    "mergeFields",
    "sourceFile",
    "invokedFrom",
    "dependencies",
    "notes",
  ] as const;

  const escape = (value: string) => {
    const v = value.replace(/"/g, '""');
    return `"${v}"`;
  };

  const rows = doc.templates.map((t) =>
    [
      t.name,
      t.displayName,
      t.kind,
      t.description,
      t.trigger,
      t.defaultSubject,
      t.recipient,
      t.mergeFields.join("; "),
      t.sourceFile,
      t.invokedFrom.join(" | "),
      t.dependencies.join("; "),
      t.notes ?? "",
    ]
      .map(escape)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function catalogToMarkdown(doc: EmailTemplateCatalogDocument): string {
  const lines: string[] = [
    `# Email template catalog — ${doc.site}`,
    "",
    `Generated: ${doc.generatedAt}`,
    "",
    "## System dependencies",
    "",
    ...doc.systemDependencies.map((d) => `- ${d}`),
    "",
    "## Templates",
    "",
  ];

  for (const t of doc.templates) {
    lines.push(`### ${t.displayName} (\`${t.name}\`)`);
    lines.push("");
    lines.push(`- **Kind:** ${t.kind}`);
    lines.push(`- **Description:** ${t.description}`);
    lines.push(`- **Trigger:** ${t.trigger}`);
    lines.push(`- **Default subject:** ${t.defaultSubject}`);
    lines.push(`- **Recipient:** ${t.recipient}`);
    lines.push(`- **Source file:** ${t.sourceFile}`);
    lines.push(`- **Invoked from:** ${t.invokedFrom.join("; ")}`);
    lines.push(`- **Dependencies:** ${t.dependencies.join("; ")}`);
    if (t.mergeFields.length) {
      lines.push(`- **Merge fields:** ${t.mergeFields.map((f) => `{{${f}}}`).join(", ")}`);
    }
    if (t.notes) lines.push(`- **Notes:** ${t.notes}`);
    lines.push("");
  }

  return lines.join("\n");
}
