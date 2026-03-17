/**
 * Clients domain barrel — types, components, and data.
 */
export type { Client } from '@/types';
export type { OnboardingData, ClientLifecycleProgress, RevenueModelConfig, RevenueModelType, RevenueUnit } from '@/types/onboarding';
export { deriveRevenueUnit, estimatedContractValue, REVENUE_MODEL_UNIT_MAP } from '@/types/onboarding';
