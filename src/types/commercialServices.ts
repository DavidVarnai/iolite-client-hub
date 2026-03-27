/**
 * Commercial services types — recommended services (Strategy) and proposed agency services (deal builder).
 */

/* ── Scope Levels (Strategy) ── */

export type ScopeLevel = 'light' | 'standard' | 'aggressive';

export const SCOPE_LEVEL_LABELS: Record<ScopeLevel, string> = {
  light: 'Light',
  standard: 'Standard',
  aggressive: 'Aggressive',
};

/* ── Recommended Service (Strategy layer) ── */

export interface RecommendedService {
  id: string;
  serviceLine: string;
  linkedChannel: string;
  rationale: string;
  scopeLevel: ScopeLevel;
  deliveryNotes: string;
}

/* ── Pricing Model Types (kept for display labels) ── */

export type ProposalPricingModelType =
  | 'flat_monthly'
  | 'hourly_block'
  | 'one_time_project'
  | 'spend_based'
  | 'minimum_plus_spend'
  | 'milestone';

export const PROPOSAL_PRICING_MODEL_LABELS: Record<ProposalPricingModelType, string> = {
  flat_monthly: 'Flat Monthly Retainer',
  hourly_block: 'Hourly / Block Hours',
  one_time_project: 'One-Time Project',
  spend_based: 'Spend-Based Fee',
  minimum_plus_spend: 'Minimum + Spend-Based Fee',
  milestone: 'Milestone Billing',
};

export type BillingCadence = 'monthly' | 'quarterly' | 'one_time' | 'milestone';

export const BILLING_CADENCE_LABELS: Record<BillingCadence, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  one_time: 'One-Time',
  milestone: 'Milestone',
};

/* ── Paid Media Pricing Config ── */

export type PaidMediaFeeMode = 'flat' | 'percent_of_spend' | 'tiered';

export interface PaidMediaSpendTier {
  upToSpend: number;
  feePercent: number;
}

export interface PaidMediaPricingConfig {
  feeMode: PaidMediaFeeMode;
  minimumFee: number;
  percentOfSpend: number;
  tiers: PaidMediaSpendTier[];
  useMediaPlanSpend: boolean;
  manualOverrideFee: number | null;
}

export const DEFAULT_PAID_MEDIA_CONFIG: PaidMediaPricingConfig = {
  feeMode: 'percent_of_spend',
  minimumFee: 1500,
  percentOfSpend: 15,
  tiers: [],
  useMediaPlanSpend: true,
  manualOverrideFee: null,
};

/**
 * Calculate Paid Media management fee from config + media spend.
 */
export function calcPaidMediaFee(
  config: PaidMediaPricingConfig,
  monthlyMediaSpend: number,
): { fee: number; source: 'manual_override' | 'minimum_floor' | 'spend_based' | 'tiered' } {
  if (config.manualOverrideFee !== null && config.manualOverrideFee > 0) {
    return { fee: config.manualOverrideFee, source: 'manual_override' };
  }

  let spendBasedFee = 0;
  let source: 'minimum_floor' | 'spend_based' | 'tiered' = 'spend_based';

  if (config.feeMode === 'percent_of_spend') {
    spendBasedFee = monthlyMediaSpend * (config.percentOfSpend / 100);
  } else if (config.feeMode === 'tiered' && config.tiers.length > 0) {
    const sorted = [...config.tiers].sort((a, b) => a.upToSpend - b.upToSpend);
    const tier = sorted.find(t => monthlyMediaSpend <= t.upToSpend) || sorted[sorted.length - 1];
    spendBasedFee = monthlyMediaSpend * (tier.feePercent / 100);
    source = 'tiered';
  } else if (config.feeMode === 'flat') {
    return { fee: config.minimumFee, source: 'minimum_floor' };
  }

  if (spendBasedFee < config.minimumFee) {
    return { fee: config.minimumFee, source: 'minimum_floor' };
  }

  return { fee: Math.round(spendBasedFee * 100) / 100, source };
}

/* ── Proposed Agency Service (Package-based deal builder) ── */

export interface PricingOverrides {
  monthlyFee?: number;
  setupFee?: number;
}

export interface ProposedAgencyService {
  id: string;
  /** Service line name (e.g. 'Paid Media Management') */
  serviceLine: string;
  /** Service line ID from admin */
  serviceLineId: string;
  /** Selected package ID from admin packages */
  selectedPackageId: string;
  /** Start month YYYY-MM */
  startMonth: string;
  /** Duration in months */
  durationMonths: number;
  /** Notes */
  notes: string;
  /** Whether pricing overrides are enabled */
  overrideEnabled: boolean;
  /** Manual pricing overrides (only used when overrideEnabled) */
  pricingOverrides: PricingOverrides;
  /** Paid Media-specific pricing config (only for Paid Media service line) */
  paidMediaConfig?: PaidMediaPricingConfig;
  /** Estimated monthly hours (for hourly packages) */
  estimatedMonthlyHours?: number;

  // ── Legacy fields (kept for backward compat, ignored in new flow) ──
  /** @deprecated Use selectedPackageId + package basePrice */
  pricingModelType?: ProposalPricingModelType;
  /** @deprecated */
  packageOrScope?: string;
  /** @deprecated */
  billingCadence?: BillingCadence;
  /** @deprecated Use package basePrice or pricingOverrides */
  monthlyFee?: number;
  /** @deprecated Use package basePrice or pricingOverrides */
  setupFee?: number;
}

/**
 * Resolve the effective monthly fee for a proposed service.
 * Priority: override > paid media calc > package basePrice > legacy monthlyFee > 0
 */
export function resolveServiceFee(
  svc: ProposedAgencyService,
  packageBasePrice: number,
  monthlyMediaSpend: number,
): number {
  // Manual override
  if (svc.overrideEnabled && svc.pricingOverrides.monthlyFee != null) {
    return svc.pricingOverrides.monthlyFee;
  }
  // Paid media auto-calc
  if (svc.paidMediaConfig) {
    return calcPaidMediaFee(svc.paidMediaConfig, monthlyMediaSpend).fee;
  }
  // Package base price
  if (packageBasePrice > 0) return packageBasePrice;
  // Legacy fallback
  return svc.monthlyFee ?? 0;
}

/**
 * Resolve the effective setup fee for a proposed service.
 */
export function resolveSetupFee(svc: ProposedAgencyService): number {
  if (svc.overrideEnabled && svc.pricingOverrides.setupFee != null) {
    return svc.pricingOverrides.setupFee;
  }
  return svc.setupFee ?? 0;
}
