/**
 * Market Intelligence domain barrel.
 */
export type {
  ChannelType,
  SourceType,
  SourceConfidence,
  EvidenceMetadata,
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
} from '@/types/marketIntelligence';

export { CHANNEL_TYPE_MAP, getChannelType, SOURCE_TRUST_ORDER, getTrustRank } from '@/types/marketIntelligence';
