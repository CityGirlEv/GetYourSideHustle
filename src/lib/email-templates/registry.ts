import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as newRegistrationAdminTemplate } from './new-registration-admin'
import { template as accountEnabledAdminTemplate } from './account-enabled-admin'
import { template as welcomeTemplate } from './welcome'
import { template as agentAssignmentTemplate } from './agent-assignment'
import { template as contactRequestTemplate } from './contact-request'
import { template as scenarioClaimedTemplate } from './scenario-claimed'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'new-registration-admin': newRegistrationAdminTemplate,
  'account-enabled-admin': accountEnabledAdminTemplate,
  'welcome': welcomeTemplate,
  'agent-assignment': agentAssignmentTemplate,
  'contact-request': contactRequestTemplate,
  'scenario-claimed': scenarioClaimedTemplate,
}
