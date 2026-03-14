/**
 * Market Intelligence Engine types — structured research layer.
 */

/* ── Sub-types ── */

export interface KeywordTheme {
  id: string;
  theme: string;
  intentType: 'informational' | 'navigational' | 'transactional' | 'commercial';
  keywordExamples: string[];
  notes?: string;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  geography: string;
  positioning: string;
  channelObservations: string;
  notes?: string;
}

export interface AudienceModel {
  id: string;
  channel: string;
  audienceDefinition: string;
  estimatedReachMin?: number;
  estimatedReachMax?: number;
  reasoning: string;
}

export interface ChannelRecommendation {
  channel: string;
  role: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BenchmarkAssumption {
  channel: string;
  metric: string;
  low: number;
  high: number;
  recommended: number;
  rationale: string;
}

/* ── Inputs / Outputs ── */

export interface MarketIntelligenceInputs {
  industry: string;
  serviceArea: string;
  geography: string;
  businessModel: string;
  website: string;
  productsOrServices: string;
  targetAudience: string;
  knownCompetitors?: string[];
  primaryGoal: string;
  budgetRange: string;
  selectedChannels: string[];
}

export interface MarketIntelligenceOutputs {
  keywordThemes: KeywordTheme[];
  competitorProfiles: CompetitorProfile[];
  audienceModels: AudienceModel[];
  channelRecommendations: ChannelRecommendation[];
  benchmarkAssumptions: BenchmarkAssumption[];
  researchSummary: string;
}

/* ── Run ── */

export type MarketIntelligenceStatus = 'draft' | 'generating' | 'complete' | 'archived';

export interface MarketIntelligenceRun {
  id: string;
  clientId: string;
  status: MarketIntelligenceStatus;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  inputs: MarketIntelligenceInputs;
  outputs: MarketIntelligenceOutputs;
  notes?: string;
}

/* ── Admin Defaults ── */

export interface MarketIntelligenceDefaults {
  defaultChannels: string[];
  defaultBenchmarkProfiles: BenchmarkAssumption[];
  researchPromptSettings: {
    tone: string;
    depth: 'light' | 'standard' | 'deep';
    includeKeywords: boolean;
    includeCompetitors: boolean;
    includeAudiences: boolean;
  };
  outputVisibility: {
    keywordThemes: boolean;
    competitorProfiles: boolean;
    audienceModels: boolean;
    channelRecommendations: boolean;
    benchmarkAssumptions: boolean;
    researchSummary: boolean;
  };
}
