/**
 * Market Intelligence domain barrel.
 */
export type {
  ChannelType,
  SourceType,
  SourceConfidence,
  EvidenceMetadata,
  CompetitorType,
  SERPSource,
  KeywordTheme,
  CompetitorProfile,
  AudienceModel,
  ChannelRecommendation,
  BenchmarkAssumption,
  MarketIntelligenceInputs,
  MarketIntelligenceOutputs,
  MarketIntelligenceStatus,
  MarketIntelligenceRun,
  MarketIntelligenceDefaults,
  ResearchSourceMode,
  MasterBriefSignals,
} from '@/types/marketIntelligence';

export { CHANNEL_TYPE_MAP, getChannelType, SOURCE_TRUST_ORDER, getTrustRank } from '@/types/marketIntelligence';

export type { CompetitorSearchResult, CompetitorSearchContext } from '@/lib/ai/competitorSearchProvider';
export { searchCompetitors } from '@/lib/ai/competitorSearchProvider';
