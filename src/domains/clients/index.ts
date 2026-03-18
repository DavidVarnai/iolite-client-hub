/**
 * Clients domain barrel — types, components, and data.
 */
export type { Client } from '@/types';
export type { OnboardingData, ClientLifecycleProgress, RevenueModelConfig, RevenueModelType, RevenueUnit, GrowthObjective, MasterBrief, MasterBriefExtractedInsights, RevenueStream, RevenueStreamType, DocumentChunk, ChunkProcessingStatus, ExtractionMode, ExtractionSourceType } from '@/types/onboarding';
export { deriveRevenueUnit, estimatedContractValue, REVENUE_MODEL_UNIT_MAP, GROWTH_OBJECTIVE_LABELS, EMPTY_MASTER_BRIEF, REVENUE_STREAM_TYPE_LABELS } from '@/types/onboarding';
