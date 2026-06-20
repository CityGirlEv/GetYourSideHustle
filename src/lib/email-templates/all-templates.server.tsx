import * as React from "react";
import { render } from "@react-email/components";
import type { ComponentType } from "react";

// Transactional (registry-style)
import { template as newRegistrationAdmin } from "./new-registration-admin";
import { template as accountEnabledAdmin } from "./account-enabled-admin";
import { template as welcome } from "./welcome";
import { template as agentAssignment } from "./agent-assignment";
import { template as contactRequest } from "./contact-request";
import { template as scenarioClaimed } from "./scenario-claimed";
import { template as betaTestAssignment } from "./beta-test-assignment";
import { template as betaTestUnassigned } from "./beta-test-unassigned";
import { template as betaTestDevNote } from "./beta-test-dev-note";
import { template as betaTestQaRetest } from "./beta-test-qa-retest";
import { template as qaDailySummaryAdmin } from "./qa-daily-summary-admin";
import { template as scenarioAssignmentAdmin } from "./scenario-assignment-admin";
import { template as qaRegistrationConfirmation } from "./qa-registration-confirmation";
import { template as agentRegistrationConfirmation } from "./agent-registration-confirmation";

// Auth (component default exports)
import { SignupEmail } from "./signup";
import { InviteEmail } from "./invite";
import { MagicLinkEmail } from "./magic-link";
import { RecoveryEmail } from "./recovery";
import { EmailChangeEmail } from "./email-change";
import { ReauthenticationEmail } from "./reauthentication";
import { AUTH_SAMPLE_PROPS } from "./template-sample-props.server";
import {
  getDefaultSubjectWithMergeFields,
  upgradeOverrideLiteralsToMergeFields,
} from "./template-merge-fields.server";

export type TemplateKind = "transactional" | "auth";

export interface TemplateDescriptor {
  name: string;
  kind: TemplateKind;
  displayName: string;
  description: string;
  trigger: string;
  defaultSubject: string;
  component: ComponentType<any>;
  sampleProps: Record<string, any>;
}

import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";

function subjectOf(entry: { subject: string | ((d: any) => string) }, sample: Record<string, any>) {
  return typeof entry.subject === "function" ? entry.subject(sample) : entry.subject;
}

export const ALL_TEMPLATES: TemplateDescriptor[] = [
  {
    name: "new-registration-admin",
    kind: "transactional",
    displayName: newRegistrationAdmin.displayName ?? "New registration (admin)",
    description: "Internal alert to admins when a user signs up and is pending approval.",
    trigger: "New user completes registration.",
    defaultSubject: subjectOf(newRegistrationAdmin, newRegistrationAdmin.previewData ?? {}),
    component: newRegistrationAdmin.component,
    sampleProps: newRegistrationAdmin.previewData ?? {},
  },
  {
    name: "account-enabled-admin",
    kind: "transactional",
    displayName: accountEnabledAdmin.displayName ?? "Account enabled (admin)",
    description: "Internal alert to admins when an account is enabled.",
    trigger: "Admin enables a previously disabled account.",
    defaultSubject: subjectOf(accountEnabledAdmin, accountEnabledAdmin.previewData ?? {}),
    component: accountEnabledAdmin.component,
    sampleProps: accountEnabledAdmin.previewData ?? {},
  },
  {
    name: "welcome",
    kind: "transactional",
    displayName: welcome.displayName ?? "Welcome",
    description: "Greets a new user after their account is approved.",
    trigger: "Admin enables a previously disabled account.",
    defaultSubject: subjectOf(welcome, welcome.previewData ?? {}),
    component: welcome.component,
    sampleProps: welcome.previewData ?? { recipientName: "Jane" },
  },
  {
    name: "agent-assignment",
    kind: "transactional",
    displayName: agentAssignment.displayName ?? "Agent assignment",
    description: "Notifies an agent that a scenario has been assigned to them.",
    trigger: "Admin assigns an agent to a scenario.",
    defaultSubject: subjectOf(agentAssignment, agentAssignment.previewData ?? {}),
    component: agentAssignment.component,
    sampleProps: agentAssignment.previewData ?? {},
  },
  {
    name: "contact-request",
    kind: "transactional",
    displayName: contactRequest.displayName ?? "Contact request",
    description: "Acknowledges a visitor who asked an expert to contact them.",
    trigger: 'Visitor submits the "talk to an expert" form.',
    defaultSubject: subjectOf(contactRequest, contactRequest.previewData ?? {}),
    component: contactRequest.component,
    sampleProps: contactRequest.previewData ?? {},
  },
  {
    name: "scenario-claimed",
    kind: "transactional",
    displayName: scenarioClaimed.displayName ?? "Scenario claimed",
    description: "Tells the scenario creator that an advisor picked up their scenario.",
    trigger: "Advisor claims a scenario via lookup code.",
    defaultSubject: subjectOf(scenarioClaimed, scenarioClaimed.previewData ?? {}),
    component: scenarioClaimed.component,
    sampleProps: scenarioClaimed.previewData ?? {},
  },
  {
    name: "beta-test-assignment",
    kind: "transactional",
    displayName: betaTestAssignment.displayName ?? "Beta test assignment",
    description: "Notifies a beta tester of their current QA test roster.",
    trigger: "Admin enables a QA user with pending assignments, or manual send from Staff.",
    defaultSubject: subjectOf(betaTestAssignment, betaTestAssignment.previewData ?? {}),
    component: betaTestAssignment.component,
    sampleProps: betaTestAssignment.previewData ?? {},
  },
  {
    name: "beta-test-unassigned",
    kind: "transactional",
    displayName: betaTestUnassigned.displayName ?? "Beta test unassigned",
    description: "Notifies a beta tester when tests are re-assigned away from them.",
    trigger: "Testing Portal save moves a test owner to Unassigned.",
    defaultSubject: subjectOf(betaTestUnassigned, betaTestUnassigned.previewData ?? {}),
    component: betaTestUnassigned.component,
    sampleProps: betaTestUnassigned.previewData ?? {},
  },
  {
    name: "beta-test-dev-note",
    kind: "transactional",
    displayName: betaTestDevNote.displayName ?? "Beta test dev note",
    description: "Notifies the assigned QA tester when a developer saves a dev note on their test.",
    trigger: "Testing Portal save includes a new or updated dev note.",
    defaultSubject: subjectOf(betaTestDevNote, betaTestDevNote.previewData ?? {}),
    component: betaTestDevNote.component,
    sampleProps: betaTestDevNote.previewData ?? {},
  },
  {
    name: "beta-test-qa-retest",
    kind: "transactional",
    displayName: betaTestQaRetest.displayName ?? "Beta test QA retest",
    description:
      "Notifies the assigned QA tester when dev marks a test Fixed/Retest or Failed/Retest.",
    trigger: "Testing Portal save sets status to fixed_retest or failed_retest.",
    defaultSubject: subjectOf(betaTestQaRetest, betaTestQaRetest.previewData ?? {}),
    component: betaTestQaRetest.component,
    sampleProps: betaTestQaRetest.previewData ?? {},
  },
  {
    name: "qa-daily-summary-admin",
    kind: "transactional",
    displayName: qaDailySummaryAdmin.displayName ?? "QA daily summary (admin)",
    description:
      "End-of-day digest to admins listing tests QA marked complete in the Testing Portal.",
    trigger: "Scheduled job at end of day (or manual admin send).",
    defaultSubject: subjectOf(qaDailySummaryAdmin, qaDailySummaryAdmin.previewData ?? {}),
    component: qaDailySummaryAdmin.component,
    sampleProps: qaDailySummaryAdmin.previewData ?? {},
  },
  {
    name: "scenario-assignment-admin",
    kind: "transactional",
    displayName: scenarioAssignmentAdmin.displayName ?? "Scenario assignment (admin)",
    description:
      "Notifies admins when a scenario is assigned to an agent, including a roster of all current assignments.",
    trigger: "Admin assigns an agent to a scenario on the admin dashboard.",
    defaultSubject: subjectOf(scenarioAssignmentAdmin, scenarioAssignmentAdmin.previewData ?? {}),
    component: scenarioAssignmentAdmin.component,
    sampleProps: scenarioAssignmentAdmin.previewData ?? {},
  },
  {
    name: "qa-registration-confirmation",
    kind: "transactional",
    displayName: qaRegistrationConfirmation.displayName ?? "QA registration confirmation",
    description:
      "Confirmation letter sent to a new QA tester after they sign the NDA and submit registration.",
    trigger: "User registers as a QA tester on the sign-up form.",
    defaultSubject:
      typeof qaRegistrationConfirmation.subject === "string"
        ? qaRegistrationConfirmation.subject
        : "Your QA registration is submitted — next steps",
    component: qaRegistrationConfirmation.component,
    sampleProps: qaRegistrationConfirmation.previewData ?? {},
  },
  {
    name: "agent-registration-confirmation",
    kind: "transactional",
    displayName: agentRegistrationConfirmation.displayName ?? "Agent registration confirmation",
    description:
      "Confirmation letter sent to a new licensed agent after they sign the NDA and submit registration.",
    trigger: "User registers as an agent on the sign-up form.",
    defaultSubject:
      typeof agentRegistrationConfirmation.subject === "string"
        ? agentRegistrationConfirmation.subject
        : "Your agent registration is submitted — next steps",
    component: agentRegistrationConfirmation.component,
    sampleProps: agentRegistrationConfirmation.previewData ?? {},
  },
  {
    name: "signup",
    kind: "auth",
    displayName: "Signup confirmation",
    description: "Email confirmation link sent right after sign-up.",
    trigger: "User signs up with email and password.",
    defaultSubject: "Confirm your email",
    component: SignupEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
  {
    name: "invite",
    kind: "auth",
    displayName: "Invitation",
    description: "Invitation link for a new user added by an admin.",
    trigger: "Admin invites a user from the auth dashboard.",
    defaultSubject: "You've been invited",
    component: InviteEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
  {
    name: "magiclink",
    kind: "auth",
    displayName: "Magic link",
    description: "Passwordless sign-in link.",
    trigger: "User requests a magic-link login.",
    defaultSubject: "Your login link",
    component: MagicLinkEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
  {
    name: "recovery",
    kind: "auth",
    displayName: "Password reset",
    description: "Password reset link.",
    trigger: 'User requests "forgot password".',
    defaultSubject: "Reset your password",
    component: RecoveryEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
  {
    name: "email_change",
    kind: "auth",
    displayName: "Email change confirmation",
    description: "Confirms a change of email address on an existing account.",
    trigger: "User updates their email address.",
    defaultSubject: "Confirm your new email",
    component: EmailChangeEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
  {
    name: "reauthentication",
    kind: "auth",
    displayName: "Reauthentication code",
    description: "Verification code for sensitive actions.",
    trigger: "User performs an action that requires re-authentication.",
    defaultSubject: "Your verification code",
    component: ReauthenticationEmail,
    sampleProps: AUTH_SAMPLE_PROPS,
  },
];

export function findTemplate(name: string): TemplateDescriptor | undefined {
  return ALL_TEMPLATES.find((t) => t.name === name);
}

/** Render a template's default HTML using its sample props. Server-only. */
export async function renderDefaultHtml(name: string): Promise<string> {
  const tpl = findTemplate(name);
  if (!tpl) throw new Error(`Unknown template: ${name}`);
  const element = React.createElement(tpl.component, tpl.sampleProps);
  return await render(element);
}

/** Default HTML with Jane Doe / sample literals replaced by {{mergeField}} tokens. */
export async function renderDefaultHtmlWithMergeFields(name: string): Promise<string> {
  const html = await renderDefaultHtml(name);
  return upgradeOverrideLiteralsToMergeFields(html, name);
}

/** Subject line for the admin editor — uses {{mergeField}} tokens where applicable. */
export function getTemplateDefaultSubjectForEditor(name: string): string {
  const tpl = findTemplate(name);
  if (!tpl) throw new Error(`Unknown template: ${name}`);
  return getDefaultSubjectWithMergeFields(name, tpl.defaultSubject);
}
