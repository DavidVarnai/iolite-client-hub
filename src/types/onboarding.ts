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

export interface ClientDiscovery {
  // A. Business Overview
  businessModel: BusinessModel;
  primaryProducts: string;
  revenueStreams: string;
  avgOrderValue: string;
  coreCustomerSegments: string;

  // B. Growth Targets
  revenueTargets: string;
  customerLeadTargets: string;
  timeHorizon: string;
  majorGrowthPriorities: string;

  // C. Sales Process
  funnelType: string;
  leadQualSaleStructure: string;
  closeRate: string;
  salesCycleLength: string;

  // D. Current Marketing Stack
  paidMediaPlatforms: string;
  crm: string;
  emailPlatform: string;
  analyticsStack: string;
  websitePlatform: string;

  // E. Current Performance
  currentTraffic: string;
  currentLeadsOrders: string;
  currentCpaCac: string;
  conversionRates: string;
  knownBottlenecks: string;

  // F. Competitive Landscape
  topCompetitors: string;
  positioningNotes: string;
  differentiators: string;
}

export const EMPTY_DISCOVERY: ClientDiscovery = {
  businessModel: 'other',
  primaryProducts: '',
  revenueStreams: '',
  avgOrderValue: '',
  coreCustomerSegments: '',
  revenueTargets: '',
  customerLeadTargets: '',
  timeHorizon: '',
  majorGrowthPriorities: '',
  funnelType: '',
  leadQualSaleStructure: '',
  closeRate: '',
  salesCycleLength: '',
  paidMediaPlatforms: '',
  crm: '',
  emailPlatform: '',
  analyticsStack: '',
  websitePlatform: '',
  currentTraffic: '',
  currentLeadsOrders: '',
  currentCpaCac: '',
  conversionRates: '',
  knownBottlenecks: '',
  topCompetitors: '',
  positioningNotes: '',
  differentiators: '',
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

export interface OnboardingData {
  lifecycleStage: LifecycleStage;
  stageProgress: ClientLifecycleProgress[];
  onboardingCompletedAt?: string;
  proposalReadyAt?: string;
  activatedAt?: string;
  discovery: ClientDiscovery;
  website?: string;
  geography?: string;
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
export function computeStageReadiness(
  onboarding: OnboardingData,
  client: { strategySections: any[]; activeChannels: any[] },
  hasGrowthModel: boolean,
): ClientLifecycleProgress[] {
  const progress: ClientLifecycleProgress[] = [];

  // Lead — always complete once client record exists
  progress.push({ stage: 'lead', status: 'complete', percentComplete: 100 });

  // Discovery
  const d = onboarding.discovery;
  const discoveryFields = [
    d.primaryProducts, d.revenueStreams, d.avgOrderValue, d.coreCustomerSegments,
    d.revenueTargets, d.customerLeadTargets, d.timeHorizon,
    d.funnelType, d.closeRate, d.salesCycleLength,
    d.currentTraffic, d.currentLeadsOrders,
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
  client: { strategySections: any[]; activeChannels: any[] },
  hasGrowthModel: boolean,
): ProposalChecklistItem[] {
  const d = onboarding.discovery;
  const dFields = [d.primaryProducts, d.revenueStreams, d.avgOrderValue, d.revenueTargets, d.customerLeadTargets];
  const dFilled = dFields.filter(f => f && f.trim().length > 0).length;

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

export function getNextStepPrompt(onboarding: OnboardingData, stageProgress: ClientLifecycleProgress[]): { message: string; action: string; targetTab?: string } | null {
  const current = onboarding.lifecycleStage;

  const stageInfo = stageProgress.find(s => s.stage === current);
  if (!stageInfo) return null;

  switch (current) {
    case 'lead':
      return { message: 'Start discovery to understand this client\'s business and goals.', action: 'Begin Discovery', targetTab: 'overview' };
    case 'discovery':
      if (stageInfo.percentComplete < 80) {
        return { message: 'Complete discovery to unlock strategy recommendations.', action: 'Continue Discovery', targetTab: 'overview' };
      }
      return { message: 'Discovery is ready. Start building the strategy.', action: 'Draft Strategy', targetTab: 'strategy' };
    case 'strategy':
      return { message: 'Add channel assumptions to finalize the Growth Model.', action: 'Build Growth Model', targetTab: 'growth-model' };
    case 'growth_model':
      return { message: 'Review proposal readiness before presenting to client.', action: 'Check Proposal', targetTab: 'overview' };
    case 'proposal_ready':
      return { message: 'Activate this client after approval to begin operations.', action: 'Activate Client', targetTab: 'overview' };
    case 'active_client':
      return null;
    default:
      return null;
  }
}
