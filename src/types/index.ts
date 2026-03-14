export type UserRole = 'master_admin' | 'project_manager' | 'team_member' | 'client_user';

export type EngagementStage = 'lead' | 'proposal' | 'active' | 'paused' | 'completed';

export type ServiceChannel =
  | 'strategic_consulting'
  | 'brand_strategy'
  | 'social_media'
  | 'paid_media'
  | 'email_marketing'
  | 'website_development'
  | 'content_development'
  | 'app_development'
  | 'analytics_tracking';

export const SERVICE_CHANNEL_LABELS: Record<ServiceChannel, string> = {
  strategic_consulting: 'Strategic Consulting / Fractional CMO',
  brand_strategy: 'Brand Strategy',
  social_media: 'Social Media',
  paid_media: 'Paid Media',
  email_marketing: 'Email Marketing & Automation',
  website_development: 'Website Development',
  content_development: 'Content Development',
  app_development: 'App / Platform Development',
  analytics_tracking: 'Analytics & Tracking Implementation',
};

export type MeetingType = 'weekly' | 'biweekly' | 'monthly' | 'special';

export type CommentStatus = 'open' | 'in_review' | 'resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  title: string;
  isPrimary: boolean;
  phone?: string;
}

export interface ClientSummaryStrategy {
  objective: string;
  priorities: string[];
  plan: string;
  expectedOutcomes: string[];
}

export interface InternalStrategy {
  diagnosis: string;
  approach: string;
  targetAudience: string;
  deliverables: string[];
  dependencies: string[];
  timeline: string;
  internalNotes: string;
  resourcing: string;
  successMetrics: string[];
}

export interface StrategySection {
  id: string;
  channel: ServiceChannel;
  clientSummary: ClientSummaryStrategy;
  internal: InternalStrategy;
}

export interface MeetingAgendaItem {
  id: string;
  channel: ServiceChannel;
  notes: string;
  clientInputs: string;
  actionItems: ActionItem[];
}

export interface Meeting {
  id: string;
  clientId: string;
  date: string;
  type: MeetingType;
  title: string;
  agenda: MeetingAgendaItem[];
  generalNotes: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface Comment {
  id: string;
  clientId: string;
  author: User;
  content: string;
  createdAt: string;
  status: CommentStatus;
  isInternal: boolean;
  contextType: 'strategy' | 'meeting' | 'performance' | 'document' | 'task';
  contextId: string;
  parentId?: string;
  replies?: Comment[];
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  channel?: ServiceChannel;
}

export interface PerformanceReport {
  id: string;
  clientId: string;
  period: string;
  executiveSummary: string;
  channelHighlights: { channel: ServiceChannel; narrative: string; metrics: Record<string, string> }[];
  wins: string[];
  risks: string[];
  nextSteps: string[];
}

export interface Document {
  id: string;
  clientId: string;
  title: string;
  type: 'proposal' | 'strategy' | 'recap' | 'reference' | 'other';
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  logoInitials: string;
  stage: EngagementStage;
  contacts: Contact[];
  activeChannels: ServiceChannel[];
  internalOwner: string;
  contractStart: string;
  contractEnd: string;
  notes: string;
  strategySections: StrategySection[];
  meetings: Meeting[];
  comments: Comment[];
  tasks: ActionItem[];
  performance: PerformanceReport[];
  documents: Document[];
  slackChannel?: string;
  notionProjectId?: string;
  agencyAnalyticsId?: string;
}
