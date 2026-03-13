/**
 * Seed / default data for the Admin area.
 */
import type {
  IntegrationConfig,
  AdminUser,
  RoleDefinition,
  AdminTemplate,
  TaxonomyGroup,
  AiModuleControl,
  SystemSettings,
} from '@/types/admin';

/* ── Integrations ── */

export const defaultIntegrations: IntegrationConfig[] = [
  {
    id: 'slack',
    label: 'Slack',
    description: 'Team messaging, client channel mapping, and notifications.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'notion',
    label: 'Notion',
    description: 'Project wikis, client workspaces, and documentation sync.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'agency_analytics',
    label: 'Agency Analytics',
    description: 'Client reporting dashboards and performance data ingestion.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'gmail',
    label: 'Gmail / Email',
    description: 'Email sync, communication logging, and outreach tracking.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'quickbooks',
    label: 'QuickBooks',
    description: 'Financial tracking, invoicing, and client billing sync.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'n8n_webhooks',
    label: 'n8n / Webhooks',
    description: 'Custom automation workflows, webhook endpoints, and triggers.',
    status: 'disconnected',
    settings: {},
  },
  {
    id: 'ai_provider',
    label: 'AI Provider',
    description: 'LLM configuration for strategy drafts, benchmarks, and summaries.',
    status: 'disconnected',
    settings: {},
  },
];

/* ── Users & Roles ── */

export const seedUsers: AdminUser[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@ioliteventures.com', role: 'master_admin', lastActive: '2026-03-13T08:00:00Z' },
  { id: 'u2', name: 'Marcus Webb', email: 'marcus@ioliteventures.com', role: 'project_manager', lastActive: '2026-03-12T17:30:00Z' },
  { id: 'u3', name: 'Priya Patel', email: 'priya@ioliteventures.com', role: 'team_member', lastActive: '2026-03-13T09:15:00Z' },
  { id: 'u4', name: 'David Kim', email: 'david@meridiancommerce.com', role: 'client_user', lastActive: '2026-03-11T14:00:00Z' },
];

export const roleDefinitions: RoleDefinition[] = [
  {
    role: 'master_admin',
    label: 'Admin',
    description: 'Full system access. Can manage integrations, users, templates, and all settings.',
    permissions: ['admin', 'manage_clients', 'manage_users', 'manage_integrations', 'manage_templates', 'view_all'],
  },
  {
    role: 'project_manager',
    label: 'Project Manager',
    description: 'Manages assigned clients, strategies, meetings, and performance reporting.',
    permissions: ['manage_clients', 'view_all'],
  },
  {
    role: 'team_member',
    label: 'Team Member',
    description: 'Contributes to assigned tasks, views client data, and adds comments.',
    permissions: ['view_assigned', 'edit_tasks', 'add_comments'],
  },
  {
    role: 'client_user',
    label: 'Client',
    description: 'Views client-facing summaries, proposals, and performance reports.',
    permissions: ['view_own_client'],
  },
];

/* ── Templates ── */

export const seedTemplates: AdminTemplate[] = [
  { id: 't1', name: 'Standard Onboarding', category: 'onboarding', description: 'Default discovery questionnaire and lifecycle flow.', isDefault: true, enabled: true, updatedAt: '2026-02-15' },
  { id: 't2', name: 'Paid Media Strategy', category: 'strategy', description: 'Channel strategy framework for paid media programs.', isDefault: false, enabled: true, updatedAt: '2026-02-20' },
  { id: 't3', name: 'E-commerce Growth Model', category: 'growth_model', description: 'Revenue and channel model for e-commerce brands.', isDefault: true, enabled: true, updatedAt: '2026-03-01' },
  { id: 't4', name: 'Growth Proposal — Standard', category: 'proposal', description: 'Multi-channel proposal template with pricing table.', isDefault: true, enabled: true, updatedAt: '2026-02-10' },
  { id: 't5', name: 'Weekly Meeting Agenda', category: 'meeting', description: 'Recurring weekly check-in agenda by channel.', isDefault: true, enabled: true, updatedAt: '2026-01-28' },
  { id: 't6', name: 'Task Starter Kit', category: 'task', description: 'Standard task list for new client onboarding.', isDefault: false, enabled: true, updatedAt: '2026-02-05' },
  { id: 't7', name: 'Strategy Draft Prompt', category: 'ai_prompt', description: 'Default prompt for AI strategy draft generation.', isDefault: true, enabled: true, updatedAt: '2026-03-10' },
];

/* ── Taxonomy ── */

export const seedTaxonomyGroups: TaxonomyGroup[] = [
  {
    key: 'service_lines',
    label: 'Service Lines',
    description: 'Core service offerings across the agency.',
    items: [
      { id: 'sl1', label: 'Strategic Consulting / Fractional CMO', enabled: true },
      { id: 'sl2', label: 'Brand Strategy', enabled: true },
      { id: 'sl3', label: 'Social Media', enabled: true },
      { id: 'sl4', label: 'Paid Media', enabled: true },
      { id: 'sl5', label: 'Email Marketing & Automation', enabled: true },
      { id: 'sl6', label: 'Website Development', enabled: true },
      { id: 'sl7', label: 'Content Development', enabled: true },
      { id: 'sl8', label: 'App / Platform Development', enabled: true },
    ],
  },
  {
    key: 'lifecycle_stages',
    label: 'Lifecycle Stages',
    description: 'Client engagement stages from lead to completion.',
    items: [
      { id: 'ls1', label: 'Lead', enabled: true },
      { id: 'ls2', label: 'Discovery', enabled: true },
      { id: 'ls3', label: 'Strategy', enabled: true },
      { id: 'ls4', label: 'Growth Model', enabled: true },
      { id: 'ls5', label: 'Proposal Ready', enabled: true },
      { id: 'ls6', label: 'Active Client', enabled: true },
    ],
  },
  {
    key: 'kpi_definitions',
    label: 'KPI Definitions',
    description: 'Standard performance metrics tracked across clients.',
    items: [
      { id: 'kpi1', label: 'Revenue', enabled: true },
      { id: 'kpi2', label: 'ROAS', enabled: true },
      { id: 'kpi3', label: 'CPA', enabled: true },
      { id: 'kpi4', label: 'CTR', enabled: true },
      { id: 'kpi5', label: 'Conversion Rate', enabled: true },
      { id: 'kpi6', label: 'MQLs', enabled: true },
    ],
  },
  {
    key: 'campaign_objectives',
    label: 'Campaign Objectives',
    description: 'Standard campaign objective types.',
    items: [
      { id: 'co1', label: 'Brand Awareness', enabled: true },
      { id: 'co2', label: 'Lead Generation', enabled: true },
      { id: 'co3', label: 'E-commerce Sales', enabled: true },
      { id: 'co4', label: 'Engagement', enabled: true },
      { id: 'co5', label: 'Retention', enabled: true },
    ],
  },
  {
    key: 'document_types',
    label: 'Document Types',
    description: 'Controlled vocabulary for document classification.',
    items: [
      { id: 'dt1', label: 'Proposal', enabled: true },
      { id: 'dt2', label: 'Strategy', enabled: true },
      { id: 'dt3', label: 'Recap', enabled: true },
      { id: 'dt4', label: 'Reference', enabled: true },
      { id: 'dt5', label: 'Other', enabled: true },
    ],
  },
];

/* ── Automation & AI ── */

export const seedAiModules: AiModuleControl[] = [
  { moduleId: 'discovery_ai', label: 'Discovery AI', description: 'Market research and competitive analysis during onboarding.', enabled: true, requiresApproval: false },
  { moduleId: 'strategy_ai', label: 'Strategy AI', description: 'Channel strategy draft generation from discovery context.', enabled: true, requiresApproval: true },
  { moduleId: 'growth_model_ai', label: 'Growth Model AI', description: 'Benchmark suggestions and channel assumption generation.', enabled: true, requiresApproval: true },
  { moduleId: 'performance_ai', label: 'Performance AI', description: 'Narrative performance summary drafts from actuals data.', enabled: true, requiresApproval: true },
  { moduleId: 'proposal_ai', label: 'Proposal Summary AI', description: 'Executive summary generation for client proposals.', enabled: true, requiresApproval: true },
];

/* ── System Settings ── */

export const defaultSystemSettings: SystemSettings = {
  agencyName: 'Iolite Ventures',
  defaultTimezone: 'America/New_York',
  defaultCurrency: 'USD',
  reportingDefaults: { cadence: 'monthly' },
  internalNamingConventions: '',
};
