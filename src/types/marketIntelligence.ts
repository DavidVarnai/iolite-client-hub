/**
 * Market Intelligence Engine types — structured research layer.
 * Supports channel-specific outputs: search-based vs audience-based.
 * Includes locality, approval workflow, benchmark sequencing,
 * and source-ranked evidence metadata.
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

/* ── Evidence Metadata ── */

export type SourceType =
  | 'manual'
  | 'google_serp'
  | 'google_maps'
  | 'ai_inference'
  | 'prior_approved_research'
  | 'internal_benchmark';

export type SourceConfidence = 'high' | 'medium' | 'low';

/** Trust ranking: lower index = higher trust. AI must never overwrite higher-trust evidence. */
export const SOURCE_TRUST_ORDER: SourceType[] = [
  'manual',
  'google_serp',
  'google_maps',
  'prior_approved_research',
  'internal_benchmark',
  'ai_inference',
];

export function getTrustRank(source: SourceType): number {
  const idx = SOURCE_TRUST_ORDER.indexOf(source);
  return idx === -1 ? SOURCE_TRUST_ORDER.length : idx;
}

export interface EvidenceMetadata {
  sourceType: SourceType;
  sourceConfidence: SourceConfidence;
  approved?: boolean;
  manuallyAdded?: boolean;
  sourceKeyword?: string;
  evidenceRefs?: string[];
}

/* ── Keyword-based outputs (Search channels) ── */

export interface KeywordTheme extends Partial<EvidenceMetadata> {
  id: string;
  theme: string;
  intentType: 'informational' | 'navigational' | 'transactional' | 'commercial';
  keywordExamples: string[];
  demandCaptureRationale?: string;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
  localRelevance?: 'high' | 'medium' | 'low' | 'n/a';
  localIntent?: boolean;
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

export type CompetitorType = 'direct' | 'indirect' | 'directory_platform';

/** How a competitor was discovered in SERP results */
export type SERPSource = 'organic' | 'paid' | 'both';

export interface CompetitorProfile extends Partial<EvidenceMetadata> {
  id: string;
  name: string;
  geography: string;
  positioning: string;
  channelObservations: string;
  notes?: string;
  websiteUrl?: string;
  competitorType?: CompetitorType;
  relevance?: 'high' | 'medium' | 'low';
  localRelevance?: 'high' | 'medium' | 'low' | 'n/a';
  rankingKeywords?: string[];
  estimatedDomainAuthority?: number;
  paidAdsPresence?: boolean;
  /** Whether found in organic results, paid ads, or both */
  serpSource?: SERPSource;
  /** Number of queries this competitor appeared in (frequency score) */
  queryFrequency?: number;
  /** Total queries searched */
  totalQueries?: number;
  /** Confidence score 0-100 based on frequency and source type */
  confidenceScore?: number;
}

/* ── Channel Recommendations ── */

export interface ChannelRecommendation extends Partial<EvidenceMetadata> {
  channel: string;
  channelType: ChannelType;
  role: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

/* ── Benchmark Assumptions ── */

export interface BenchmarkAssumption extends Partial<EvidenceMetadata> {
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
  /** Core keywords used to drive competitor discovery */
  coreSearchKeywords?: string[];
  /** Search queries used for SERP-based competitor discovery */
  discoveryQueries?: string[];
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
