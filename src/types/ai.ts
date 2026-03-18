/* AI Assistance Layer — Types & Contracts */

export type AiToolId =
  | 'market_research'
  | 'strategy_draft'
  | 'benchmark_suggestions'
  | 'performance_analysis'
  | 'summary_writer';

export type AiActionStatus = 'idle' | 'loading' | 'success' | 'error';

// ─── Market Research ───

export interface MarketResearchRequest {
  clientWebsite?: string;
  industry: string;
  geography?: string;
  serviceArea?: string;
  businessModel?: string;
  primaryProducts?: string;
  coreCustomerSegments?: string;
  keywords?: string[];
  knownCompetitors?: string[];
}

export interface MarketResearchResult {
  marketOverview: string;
  topCompetitors: { name: string; url?: string; notes: string }[];
  acquisitionChannels: string[];
  positioningThemes: string[];
  benchmarkNotes: { metric: string; range: string; notes: string }[];
}

// ─── Strategy Draft ───

export interface StrategyDraftRequest {
  channel: string;
  industry: string;
  businessModel?: string;
  growthGoals?: string;
  geography?: string;
  discoveryContext?: string;
  budgetContext?: string;
  /** Approved Master Brief insights — separate from discovery context */
  approvedMasterBriefInsights?: string;
}

export interface StrategyDraftResult {
  objectives: string;
  keyInitiatives: string[];
  timelineIdeas: string;
  dependencies: string[];
  successMetrics: string[];
}

// ─── Benchmark Suggestions ───

export interface BenchmarkRequest {
  industry: string;
  geography?: string;
  businessModel?: string;
  channel: string;
  campaignObjective?: string;
}

export interface BenchmarkSuggestion {
  metric: string;
  low: number;
  mid: number;
  high: number;
  unit: string;
  notes: string;
}

export interface BenchmarkResult {
  channel: string;
  benchmarks: BenchmarkSuggestion[];
}

// ─── Performance Analysis ───

export interface PerformanceAnalysisRequest {
  months: { month: string; forecastSpend: number; actualSpend: number; forecastResults: number; actualResults: number; forecastRevenue: number; actualRevenue: number }[];
  channels?: string[];
}

export interface PerformanceAnalysisResult {
  summary: string;
  keyDrivers: string[];
  risks: string[];
  recommendedActions: string[];
}

// ─── Summary Writer ───

export type SummaryType = 'proposal' | 'investment' | 'monthly_performance' | 'quarterly_review';

export interface SummaryWriterRequest {
  summaryType: SummaryType;
  clientName: string;
  strategySummaries?: { channel: string; objective: string }[];
  investmentTotal?: number;
  mediaTotal?: number;
  projectedRevenue?: number;
  actualPerformance?: string;
  additionalContext?: string;
}

export interface SummaryWriterResult {
  title: string;
  content: string;
  sections: { heading: string; body: string }[];
}

// ─── AI Artifacts (persisted outputs) ───

export type AiArtifactType =
  | 'market_research'
  | 'strategy_draft'
  | 'benchmark_suggestion'
  | 'performance_summary'
  | 'proposal_summary';

export interface AiArtifact {
  id: string;
  clientId: string;
  type: AiArtifactType;
  sourceModule: string;
  contextId?: string;
  content: Record<string, unknown>;
  status: 'draft' | 'accepted' | 'discarded';
  createdAt: string;
  acceptedAt?: string;
}

// ─── Generic AI Action ───

export interface AiActionState<T> {
  status: AiActionStatus;
  result: T | null;
  error: string | null;
}
