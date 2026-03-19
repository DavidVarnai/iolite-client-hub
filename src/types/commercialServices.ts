/**
 * Commercial services types — recommended services (Strategy) and proposed agency services (Proposal Ready).
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

/* ── Pricing Model Types (Proposal Ready layer) ── */

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
  upToSpend: number;       // e.g. 10000
  feePercent: number;       // e.g. 15
}

export interface PaidMediaPricingConfig {
  feeMode: PaidMediaFeeMode;
  /** Minimum monthly management fee */
  minimumFee: number;
  /** Flat percent of spend (used when feeMode='percent_of_spend') */
  percentOfSpend: number;
  /** Tiered fee schedule (used when feeMode='tiered') */
  tiers: PaidMediaSpendTier[];
  /** Link to growth model media spend for auto-calculation */
  useMediaPlanSpend: boolean;
  /** Manual override — when set, bypasses calculated fee */
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
 * Final fee = max(minimumFee, spend-based fee)
 * If manualOverrideFee is set, it wins.
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
    // Find the tier that covers the spend
    const sorted = [...config.tiers].sort((a, b) => a.upToSpend - b.upToSpend);
    const tier = sorted.find(t => monthlyMediaSpend <= t.upToSpend) || sorted[sorted.length - 1];
    spendBasedFee = monthlyMediaSpend * (tier.feePercent / 100);
    source = 'tiered';
  } else if (config.feeMode === 'flat') {
    // Flat mode uses the minimumFee directly
    return { fee: config.minimumFee, source: 'minimum_floor' };
  }

  if (spendBasedFee < config.minimumFee) {
    return { fee: config.minimumFee, source: 'minimum_floor' };
  }

  return { fee: Math.round(spendBasedFee * 100) / 100, source };
}

/* ── Proposed Agency Service (Proposal Ready layer — source of truth for pricing) ── */

export interface ProposedAgencyService {
  id: string;
  serviceLine: string;
  pricingModelType: ProposalPricingModelType;
  packageOrScope: string;
  billingCadence: BillingCadence;
  startMonth: string; // YYYY-MM
  durationMonths: number;
  monthlyFee: number;
  setupFee: number;
  notes: string;
  /** Paid Media-specific pricing config (only for 'Paid Media Management' service line) */
  paidMediaConfig?: PaidMediaPricingConfig;
}
