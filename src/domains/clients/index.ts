/**
 * Clients domain barrel — types, components, and data.
 */
export type { Client } from '@/types';
export type { OnboardingData, ClientLifecycleProgress, RevenueModelConfig, RevenueModelType, RevenueUnit, GrowthObjective } from '@/types/onboarding';
export { deriveRevenueUnit, estimatedContractValue, REVENUE_MODEL_UNIT_MAP, GROWTH_OBJECTIVE_LABELS } from '@/types/onboarding';
