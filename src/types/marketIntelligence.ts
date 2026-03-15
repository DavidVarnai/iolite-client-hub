/**
 * Market Intelligence Engine types — structured research layer.
 * Supports channel-specific outputs: search-based vs audience-based.
 * Includes locality, approval workflow, and benchmark sequencing.
 */

/* ── Channel Classification ── */

export type ChannelType = 'search' | 'audience' | 'content' | 'email' | 'other';

export const CHANNEL_TYPE_MAP: Record<string, ChannelType> = {
  'Google Ads': 'search',
  'Google Search': 'search',
  'Bing Ads': 'search',
  'Meta Ads': 'audience',
  'Facebook Ads': 'audience',
  'Instagram Ads': 'audience',
  'TikTok': 'audience',
  'LinkedIn': 'audience',
  'Spotify': 'audience',
  'YouTube': 'audience',
  'Content/SEO': 'content',
  'Email': 'email',
  'Email/SMS': 'email',
};

export function getChannelType(channel: string): ChannelType {
  return CHANNEL_TYPE_MAP[channel] || 'other';
}

/* ── Locality ── */

export type LocalRadius = 5 | 10 | 25 | 50 | 'custom';

export const LOCAL_RADIUS_OPTIONS: { value: LocalRadius; label: string }[] = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 'custom', label: 'Custom' },
];

/* ── Keyword-based outputs (Search channels) ── */

export interface KeywordTheme {
  id: string;
  theme: string;
  intentType: 'informational' | 'navigational' | 'transactional' | 'commercial';
  keywordExamples: string[];
  demandCaptureRationale?: string;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
  localRelevance?: 'high' | 'medium' | 'low' | 'n/a';
}

/* ── Audience-based outputs (Meta, LinkedIn, Spotify, etc.) ── */

export interface AudienceModel {
  id: string;
  channel: string;
  channelType: ChannelType;
  audienceDefinition: string;
  targetingCriteria: string[];
  funnelStage: 'awareness' | 'consideration' | 'conversion' | 'retention';
  estimatedReachMin?: number;
  estimatedReachMax?: number;
  recommendedCPM?: number;
  recommendedCTR?: number;
  recommendedCVR?: number;
  reasoning: string;
}

/* ── Competitor Profiles ── */

export interface CompetitorProfile {
  id: string;
  name: string;
  geography: string;
  positioning: string;
  channelObservations: string;
  notes?: string;
  websiteUrl?: string;
  relevance?: 'high' | 'medium' | 'low';
  localRelevance?: 'high' | 'medium' | 'low' | 'n/a';
}

/* ── Channel Recommendations ── */

export interface ChannelRecommendation {
  channel: string;
  channelType: ChannelType;
  role: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

/* ── Benchmark Assumptions ── */

export interface BenchmarkAssumption {
  channel: string;
  channelType: ChannelType;
  metric: string;
  unit: string;
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
  /* Locality fields */
  primaryCity?: string;
  localRadius?: LocalRadius;
  customRadiusMiles?: number;
  /* Refinement */
  refinementNote?: string;
}

export interface MarketIntelligenceOutputs {
  keywordThemes: KeywordTheme[];
  competitorProfiles: CompetitorProfile[];
  audienceModels: AudienceModel[];
  channelRecommendations: ChannelRecommendation[];
  benchmarkAssumptions: BenchmarkAssumption[];
  researchSummary: string;
}

/* ── Approved Research ── */

export interface ApprovedResearch {
  approvedAt: string;
  approvedKeywords: KeywordTheme[];
  approvedCompetitors: CompetitorProfile[];
  approvedRadius?: LocalRadius;
  approvedCustomRadius?: number;
  approvedChannelRecommendations: ChannelRecommendation[];
  researchSummary: string;
}

/* ── Run ── */

export type MarketIntelligenceStatus = 'draft' | 'generating' | 'complete' | 'approved' | 'archived';

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
  approved?: ApprovedResearch;
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
