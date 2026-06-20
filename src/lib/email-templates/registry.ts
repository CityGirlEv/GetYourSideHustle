import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as newRegistrationAdminTemplate } from "./new-registration-admin";
import { template as accountEnabledAdminTemplate } from "./account-enabled-admin";
import { template as welcomeTemplate } from "./welcome";
import { template as agentAssignmentTemplate } from "./agent-assignment";
import { template as contactRequestTemplate } from "./contact-request";
import { template as scenarioClaimedTemplate } from "./scenario-claimed";
import { template as betaTestAssignmentTemplate } from "./beta-test-assignment";
import { template as betaTestUnassignedTemplate } from "./beta-test-unassigned";
import { template as betaTestDevNoteTemplate } from "./beta-test-dev-note";
import { template as betaTestQaRetestTemplate } from "./beta-test-qa-retest";
import { template as qaDailySummaryAdminTemplate } from "./qa-daily-summary-admin";
import { template as scenarioAssignmentAdminTemplate } from "./scenario-assignment-admin";
import { template as qaRegistrationConfirmationTemplate } from "./qa-registration-confirmation";
import { template as agentRegistrationConfirmationTemplate } from "./agent-registration-confirmation";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "new-registration-admin": newRegistrationAdminTemplate,
  "account-enabled-admin": accountEnabledAdminTemplate,
  welcome: welcomeTemplate,
  "agent-assignment": agentAssignmentTemplate,
  "contact-request": contactRequestTemplate,
  "scenario-claimed": scenarioClaimedTemplate,
  "beta-test-assignment": betaTestAssignmentTemplate,
  "beta-test-unassigned": betaTestUnassignedTemplate,
  "beta-test-dev-note": betaTestDevNoteTemplate,
  "beta-test-qa-retest": betaTestQaRetestTemplate,
  "qa-daily-summary-admin": qaDailySummaryAdminTemplate,
  "scenario-assignment-admin": scenarioAssignmentAdminTemplate,
  "qa-registration-confirmation": qaRegistrationConfirmationTemplate,
  "agent-registration-confirmation": agentRegistrationConfirmationTemplate,
};
