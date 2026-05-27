import type { ComponentType } from 'react'
import { template as scenarioClaimed } from './scenario-claimed'
import { template as agentAssignment } from './agent-assignment'
import { template as contactRequest } from './contact-request'
import { template as welcome } from './welcome'

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
export const TEMPLATES: Record<string, TemplateEntry> = {
  'scenario-claimed': scenarioClaimed,
  'agent-assignment': agentAssignment,
  'contact-request': contactRequest,
  'welcome': welcome,
}
