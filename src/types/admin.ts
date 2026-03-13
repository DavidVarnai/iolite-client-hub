/**
 * Admin area types — system-wide configuration, integrations, taxonomy.
 */

/* ── Integrations ── */

export type IntegrationId =
  | 'slack'
  | 'notion'
  | 'agency_analytics'
  | 'gmail'
  | 'quickbooks'
  | 'n8n_webhooks'
  | 'ai_provider';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface IntegrationConfig {
  id: IntegrationId;
  label: string;
  description: string;
  status: IntegrationStatus;
  accountLabel?: string;      // e.g. "workspace: Iolite Ventures"
  lastChecked?: string;       // ISO date
  settings: Record<string, unknown>;
}

/* ── Users & Roles ── */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'master_admin' | 'project_manager' | 'team_member' | 'client_user';
  avatar?: string;
  lastActive?: string;
}

export interface RoleDefinition {
  role: AdminUser['role'];
  label: string;
  description: string;
  permissions: string[];
}

/* ── Templates ── */

export type TemplateCategory =
  | 'onboarding'
  | 'strategy'
  | 'growth_model'
  | 'proposal'
  | 'meeting'
  | 'task'
  | 'ai_prompt';

export interface AdminTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  isDefault: boolean;
  enabled: boolean;
  updatedAt: string;
}

/* ── Taxonomy ── */

export interface TaxonomyItem {
  id: string;
  label: string;
  enabled: boolean;
}

export interface TaxonomyGroup {
  key: string;
  label: string;
  description: string;
  items: TaxonomyItem[];
}

/* ── Automation & AI ── */

export interface AiModuleControl {
  moduleId: string;
  label: string;
  description: string;
  enabled: boolean;
  requiresApproval: boolean;
}

/* ── System Settings ── */

export interface SystemSettings {
  agencyName: string;
  logoUrl?: string;
  defaultTimezone: string;
  defaultCurrency: string;
  reportingDefaults: {
    cadence: 'weekly' | 'biweekly' | 'monthly';
  };
  internalNamingConventions: string;
}

/* ── Role-aware visibility ── */

export function isAdminUser(role: string): boolean {
  return role === 'master_admin';
}
