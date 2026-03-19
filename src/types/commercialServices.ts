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
}
