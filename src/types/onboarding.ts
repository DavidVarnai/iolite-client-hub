/* Client lifecycle, discovery, and onboarding types for Agency OS */

export type LifecycleStage = 'lead' | 'discovery' | 'strategy' | 'growth_model' | 'proposal_ready' | 'active_client';

export type StageStatus = 'not_started' | 'in_progress' | 'complete';

export const LIFECYCLE_STAGES: { key: LifecycleStage; label: string; tabMapping?: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'discovery', label: 'Discovery', tabMapping: 'overview' },
  { key: 'strategy', label: 'Strategy', tabMapping: 'strategy' },
  { key: 'growth_model', label: 'Growth Model', tabMapping: 'growth-model' },
  { key: 'proposal_ready', label: 'Proposal Ready', tabMapping: 'overview' },
  { key: 'active_client', label: 'Active Client', tabMapping: 'performance' },
];

export type BusinessModel = 'ecommerce' | 'lead_generation' | 'hybrid' | 'other';
export type GrowthGoal = 'revenue_growth' | 'lead_volume' | 'market_expansion' | 'brand_awareness';
export type PerformanceConfidence = 'high' | 'medium' | 'estimated' | 'unknown';

export type GrowthObjective =
  | 'acquire_new_customers'
  | 'increase_deal_size'
  | 'improve_conversion_rate'
  | 'expand_existing_customers'
  | 'reduce_churn';

export const GROWTH_OBJECTIVE_LABELS: Record<GrowthObjective, string> = {
  acquire_new_customers: 'Acquire new customers',
  increase_deal_size: 'Increase deal size',
  improve_conversion_rate: 'Improve conversion rate',
  expand_existing_customers: 'Expand existing customers',
  reduce_churn: 'Reduce churn',
};

export type RevenueModelType = 'one_time' | 'monthly_recurring' | 'annual_contract';
export type RevenueUnit = 'per_deal' | 'per_month' | 'per_year';

/** Canonical mapping: revenueModelType → revenueUnit. Unit is fully derived. */
export const REVENUE_MODEL_UNIT_MAP: Record<RevenueModelType, RevenueUnit> = {
  one_time: 'per_deal',
  monthly_recurring: 'per_month',
  annual_contract: 'per_year',
};

export interface RevenueModelConfig {
  revenueModelType: RevenueModelType;
  revenuePerConversion: number;
  /** @deprecated — now derived from revenueModelType via REVENUE_MODEL_UNIT_MAP */
  revenueUnit: RevenueUnit;
  avgContractLengthMonths?: number;
}

/** Derive the canonical unit for a given model type */
export function deriveRevenueUnit(type: RevenueModelType): RevenueUnit {
  return REVENUE_MODEL_UNIT_MAP[type];
}

/**
 * For recurring models, compute the estimated total contract value.
 * Returns null for one-time models or when contract length is missing.
 */
export function estimatedContractValue(model: RevenueModelConfig): number | null {
  const { revenueModelType, revenuePerConversion, avgContractLengthMonths } = model;
  if (revenuePerConversion <= 0) return null;
  if (revenueModelType === 'monthly_recurring' && avgContractLengthMonths && avgContractLengthMonths > 0) {
    return revenuePerConversion * avgContractLengthMonths;
  }
  if (revenueModelType === 'annual_contract' && avgContractLengthMonths && avgContractLengthMonths > 0) {
    return revenuePerConversion * Math.ceil(avgContractLengthMonths / 12);
  }
  return null;
}

export const REVENUE_MODEL_TYPE_LABELS: Record<RevenueModelType, string> = {
  one_time: 'One-time',
  monthly_recurring: 'Monthly recurring',
  annual_contract: 'Annual contract',
};

export const REVENUE_UNIT_LABELS: Record<RevenueUnit, string> = {
  per_deal: 'Per deal',
  per_month: 'Per month',
  per_year: 'Per year',
};

export const BOTTLENECK_OPTIONS = [
  'Low website conversion',
  'Weak traffic volume',
  'Poor lead quality',
  'Long sales cycle',
  'Low brand awareness',
  'Tracking issues',
  'Weak email nurture',
  'Sales capacity constraints',
] as const;

export type BottleneckTag = typeof BOTTLENECK_OPTIONS[number];

export interface DiscoveryCompetitor {
  name: string;
  url: string;
}

export interface AiDiscoveredCompetitor {
  name: string;
  url: string;
  reason: string;
}

export type FunnelStageCategory = 'traffic' | 'page_interaction' | 'lead_capture' | 'qualification' | 'conversion';

export interface FunnelStage {
  name: string;
  category: FunnelStageCategory;
  isCustom?: boolean;
}

export const FUNNEL_STAGE_OPTIONS: Record<FunnelStageCategory, { label: string; stages: string[] }> = {
  traffic: { label: 'Traffic', stages: ['Ad Click', 'Organic Search', 'Social Media', 'Referral', 'Direct'] },
  page_interaction: { label: 'Page Interaction', stages: ['Landing Page Visit', 'Content Page', 'Product Page', 'Pricing Page'] },
  lead_capture: { label: 'Lead Capture', stages: ['Form Submission', 'Email Signup', 'Quote Request', 'Demo Request', 'Free Trial'] },
  qualification: { label: 'Qualification', stages: ['Discovery Call', 'Sales Call', 'Product Demo', 'Consultation', 'Application Submitted'] },
  conversion: { label: 'Conversion', stages: ['Closed Deal', 'Purchase', 'Contract Signed', 'Enrollment', 'Subscription'] },
};

export const FUNNEL_CATEGORY_ORDER: FunnelStageCategory[] = ['traffic', 'page_interaction', 'lead_capture', 'qualification', 'conversion'];

export interface ClientDiscovery {
  // A. Business Overview
  businessModel: BusinessModel;
  primaryProducts: string;
  revenueStreams: string;
  /** @deprecated use revenueModel */
  avgOrderValue: string;
  revenueModel: RevenueModelConfig;
  coreCustomerSegments: string;

  // B. Growth Targets — Business Outcomes
  revenueTarget: number;
  newCustomersTarget: number;
  timeHorizon: string;
  // B. Growth Targets — Growth Strategy
  primaryGrowthObjective: GrowthObjective | '';
  primaryLeadType: string;

  /** @deprecated use revenueTarget (number) */
  revenueTargets: string;
  /** @deprecated use newCustomersTarget + primaryLeadType */
  customerLeadTargets: string;
  /** @deprecated use primaryGrowthObjective */
  majorGrowthPriorities: string;

  // C. Sales Process
  funnelType: string;
  leadQualSaleStructure: string;
  salesFunnelStages: FunnelStage[];
  closeRate: string;
  salesCycleLength: string;

  // D. Current Marketing Stack
  paidMediaPlatforms: string;
  crm: string;
  emailPlatform: string;
  analyticsStack: string;
  websitePlatform: string;

  // E. Current Performance (structured)
  monthlyVisitors: string;
  monthlyLeads: string;
  monthlyCustomers: string;
  monthlyMarketingBudget: string;
  performanceConfidence: PerformanceConfidence;
  bottleneckTags: string[];
  bottleneckNotes: string;

  /** @deprecated use monthlyVisitors */
  currentTraffic: string;
  /** @deprecated use monthlyLeads */
  currentLeadsOrders: string;
  /** @deprecated use structured calc */
  currentCpaCac: string;
  /** @deprecated use structured calc */
  conversionRates: string;
  /** @deprecated use bottleneckTags + bottleneckNotes */
  knownBottlenecks: string;

  // F. Competitive Landscape (structured)
  competitors: DiscoveryCompetitor[];
  positioningNotes: string;
  differentiators: string;

  /** @deprecated use competitors[] */
  topCompetitors: string;
}

export const EMPTY_DISCOVERY: ClientDiscovery = {
  businessModel: 'other',
  primaryProducts: '',
  revenueStreams: '',
  avgOrderValue: '',
  revenueModel: { revenueModelType: 'one_time', revenuePerConversion: 0, revenueUnit: 'per_deal' },
  coreCustomerSegments: '',
  revenueTarget: 0,
  newCustomersTarget: 0,
  timeHorizon: '',
  primaryGrowthObjective: '',
  primaryLeadType: '',
  revenueTargets: '',
  customerLeadTargets: '',
  majorGrowthPriorities: '',
  funnelType: '',
  leadQualSaleStructure: '',
  salesFunnelStages: [],
  closeRate: '',
  salesCycleLength: '',
  paidMediaPlatforms: '',
  crm: '',
  emailPlatform: '',
  analyticsStack: '',
  websitePlatform: '',
  monthlyVisitors: '',
  monthlyLeads: '',
  monthlyCustomers: '',
  monthlyMarketingBudget: '',
  performanceConfidence: 'unknown',
  bottleneckTags: [],
  bottleneckNotes: '',
  currentTraffic: '',
  currentLeadsOrders: '',
  currentCpaCac: '',
  conversionRates: '',
  knownBottlenecks: '',
  competitors: [],
  positioningNotes: '',
  differentiators: '',
  topCompetitors: '',
};

export interface ClientLifecycleProgress {
  stage: LifecycleStage;
  status: StageStatus;
  percentComplete: number;
  completedAt?: string;
}

export interface ProposalChecklistItem {
  key: string;
  label: string;
  complete: boolean;
}

/** Tracks onboarding context when user navigates from the wizard to a tab */
export interface OnboardingContinuation {
  /** The wizard step the user came from */
  sourceStep: string;
  /** The onboarding step being completed on the current tab */
  currentStep: string;
  /** The next onboarding step after this one */
  nextStep: string | null;
  /** The step the wizard should reopen at */
  returnStep: string;
}

/* ── Master Brief ── */

export interface MasterBriefExtractedInsights {
  audiences: string[];
  painPoints: string[];
  valueProps: string[];
  differentiators: string[];
  positioning: string;
  industries: string[];
  inferredCompetitors: string[];
  summary: string;
}

export interface MasterBrief {
  rawText: string;
  uploadedFileName?: string;
  uploadedFileType?: string;
  uploadedFileContent?: string;
  lastUpdatedAt?: string;
  extractedInsights?: MasterBriefExtractedInsights;
}

export const EMPTY_MASTER_BRIEF: MasterBrief = { rawText: '' };

export interface OnboardingData {
  lifecycleStage: LifecycleStage;
  stageProgress?: ClientLifecycleProgress[]; // deprecated — computed dynamically
  onboardingCompletedAt?: string;
  proposalReadyAt?: string;
  activatedAt?: string;
  discovery: ClientDiscovery;
  masterBrief?: MasterBrief;
  website?: string;
  geography?: string;
  serviceArea?: string;
  businessAddress?: string;
  businessModelType?: BusinessModel;
  primaryGrowthGoal?: GrowthGoal;
}

export const DEFAULT_ONBOARDING: OnboardingData = {
  lifecycleStage: 'lead',
  stageProgress: LIFECYCLE_STAGES.map(s => ({
    stage: s.key,
    status: s.key === 'lead' ? 'complete' as StageStatus : 'not_started' as StageStatus,
    percentComplete: s.key === 'lead' ? 100 : 0,
  })),
  discovery: { ...EMPTY_DISCOVERY },
};

/* Compute readiness for each stage */
interface ClientReadinessInput {
  strategySections: { clientSummary: { objective: string; priorities: string[] } }[];
  activeChannels: string[];
}

export function computeStageReadiness(
  onboarding: OnboardingData,
  client: ClientReadinessInput,
  hasGrowthModel: boolean,
): ClientLifecycleProgress[] {
  const progress: ClientLifecycleProgress[] = [];

  // Lead — always complete once client record exists
  progress.push({ stage: 'lead', status: 'complete', percentComplete: 100 });

  // Discovery
  const d = onboarding.discovery;
  const revenueModelSet = d.revenueModel && d.revenueModel.revenuePerConversion > 0 ? 'set' : '';
  const revenueTargetSet = d.revenueTarget > 0 ? 'set' : (d.revenueTargets || '');
  const customersTargetSet = d.newCustomersTarget > 0 ? 'set' : (d.customerLeadTargets || '');
  const discoveryFields = [
    d.primaryProducts, d.revenueStreams, revenueModelSet, d.coreCustomerSegments,
    revenueTargetSet, customersTargetSet, d.timeHorizon,
    d.funnelType, d.closeRate, d.salesCycleLength,
    d.monthlyVisitors || d.currentTraffic, d.monthlyLeads || d.currentLeadsOrders,
  ];
  const discoveryFilled = discoveryFields.filter(f => f && f.trim().length > 0).length;
  const discoveryPct = Math.round((discoveryFilled / discoveryFields.length) * 100);
  progress.push({
    stage: 'discovery',
    status: discoveryPct >= 80 ? 'complete' : discoveryPct > 0 ? 'in_progress' : 'not_started',
    percentComplete: discoveryPct,
  });

  // Strategy
  const hasMeaningfulStrategy = client.strategySections.some(s =>
    s.clientSummary.objective && s.clientSummary.priorities.length > 0
  );
  const stratPct = hasMeaningfulStrategy ? 100 : client.strategySections.length > 0 ? 40 : 0;
  progress.push({
    stage: 'strategy',
    status: stratPct >= 80 ? 'complete' : stratPct > 0 ? 'in_progress' : 'not_started',
    percentComplete: stratPct,
  });

  // Growth Model
  const gmPct = hasGrowthModel ? 100 : 0;
  progress.push({
    stage: 'growth_model',
    status: gmPct >= 80 ? 'complete' : gmPct > 0 ? 'in_progress' : 'not_started',
    percentComplete: gmPct,
  });

  // Proposal Ready
  const proposalChecks = [discoveryPct >= 80, hasMeaningfulStrategy, hasGrowthModel];
  const proposalPct = Math.round((proposalChecks.filter(Boolean).length / proposalChecks.length) * 100);
  progress.push({
    stage: 'proposal_ready',
    status: onboarding.proposalReadyAt ? 'complete' : proposalPct >= 100 ? 'in_progress' : 'not_started',
    percentComplete: onboarding.proposalReadyAt ? 100 : proposalPct,
  });

  // Active Client
  progress.push({
    stage: 'active_client',
    status: onboarding.activatedAt ? 'complete' : 'not_started',
    percentComplete: onboarding.activatedAt ? 100 : 0,
  });

  return progress;
}

export function getProposalChecklist(
  onboarding: OnboardingData,
  client: ClientReadinessInput,
  hasGrowthModel: boolean,
): ProposalChecklistItem[] {
  const d = onboarding.discovery;
  const revenueModelSet = d.revenueModel && d.revenueModel.revenuePerConversion > 0 ? 'set' : '';
  const revenueTargetSet = d.revenueTarget > 0 ? 'set' : (d.revenueTargets || '');
  const dFields = [d.primaryProducts, d.revenueStreams, revenueModelSet, revenueTargetSet, d.newCustomersTarget > 0 ? 'set' : (d.customerLeadTargets || '')];
  const dFilled = dFields.filter(f => f && String(f).trim().length > 0).length;

  return [
    { key: 'client_setup', label: 'Client setup complete', complete: true },
    { key: 'discovery', label: 'Discovery complete', complete: dFilled >= 4 },
    { key: 'strategy', label: 'At least one strategy module summarized', complete: client.strategySections.some(s => s.clientSummary.objective) },
    { key: 'growth_model', label: 'Growth model populated', complete: hasGrowthModel },
    { key: 'investment_totals', label: 'Investment totals available', complete: hasGrowthModel },
    { key: 'projected_outcomes', label: 'Projected outcomes available', complete: hasGrowthModel },
    { key: 'exec_summary', label: 'Executive summary drafted', complete: false },
  ];
}

export function getNextStepPrompt(onboarding: OnboardingData, stageProgress: ClientLifecycleProgress[]): { message: string; action: string; targetTab?: string; openWizard?: boolean } | null {
  const current = onboarding.lifecycleStage;

  const stageInfo = stageProgress.find(s => s.stage === current);
  if (!stageInfo) return null;

  switch (current) {
    case 'lead':
      return { message: 'Start discovery to understand this client\'s business and goals.', action: 'Begin Discovery', openWizard: true };
    case 'discovery':
      if (stageInfo.percentComplete < 80) {
        return { message: 'Complete discovery to unlock strategy recommendations.', action: 'Continue Discovery', openWizard: true };
      }
      return { message: 'Discovery is ready. Continue onboarding to draft your strategy.', action: 'Continue to Strategy', openWizard: true };
    case 'strategy':
      return { message: 'Strategy is in progress. Continue onboarding to build the Growth Model.', action: 'Continue Onboarding', openWizard: true };
    case 'growth_model':
      return { message: 'Review proposal readiness before presenting to client.', action: 'Check Proposal Readiness', openWizard: true };
    case 'proposal_ready':
      return { message: 'Activate this client after approval to begin operations.', action: 'Activate Client', targetTab: 'overview' };
    case 'active_client':
      return null;
    default:
      return null;
  }
}
