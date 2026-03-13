/**
 * Team Management & Unit Economics types.
 */

/* ── Revenue / Service Categories ── */

export type RevenueCategory =
  | 'fractional_cmo'
  | 'paid_media_management'
  | 'social_media_management'
  | 'retention_marketing'
  | 'web_design'
  | 'creative'
  | 'development'
  | 'seo'
  | 'copywriting'
  | 'analytics';

export const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  fractional_cmo: 'Fractional CMO',
  paid_media_management: 'Paid Media Management',
  social_media_management: 'Social Media Management',
  retention_marketing: 'Retention Marketing',
  web_design: 'Web Design',
  creative: 'Creative',
  development: 'Development',
  seo: 'SEO',
  copywriting: 'Copywriting',
  analytics: 'Analytics',
};

/* ── Worker & Status ── */

export type WorkerType = 'full_time' | 'contractor' | 'freelance' | 'part_time';
export type TeamMemberStatus = 'active' | 'inactive';

export const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  full_time: 'Full-Time',
  contractor: 'Contractor',
  freelance: 'Freelance',
  part_time: 'Part-Time',
};

/* ── Team Member ── */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  workerType: WorkerType;
  status: TeamMemberStatus;
  notes: string;
}

/* ── Compensation Components (stackable) ── */

export type CompensationComponentType =
  | 'salary_allocation'
  | 'flat_client_fee'
  | 'hourly'
  | 'revenue_share'
  | 'profit_share'
  | 'threshold_share';

export const COMP_TYPE_LABELS: Record<CompensationComponentType, string> = {
  salary_allocation: 'Salary Allocation',
  flat_client_fee: 'Flat Client Fee',
  hourly: 'Hourly',
  revenue_share: 'Revenue Share',
  profit_share: 'Profit Share',
  threshold_share: 'Threshold Share',
};

export interface CompensationComponent {
  id: string;
  teamMemberId: string;
  componentType: CompensationComponentType;
  /** Monthly cost for salary, flat fee default, or hourly rate */
  amount: number;
  /** For revenue/profit share: percentage as decimal (e.g. 0.10 = 10%) */
  sharePercent?: number;
  /** Category the share applies to */
  appliesToCategory?: RevenueCategory;
  /** Optional cap on share payout */
  capAmount?: number;
  /** For threshold_share: the base fee threshold above which the share applies */
  thresholdAmount?: number;
  /** Whether this is the default (vs client-specific override) */
  isDefault: boolean;
}

/* ── Client Team Assignment ── */

export interface ClientTeamAssignment {
  id: string;
  teamMemberId: string;
  clientId: string;
  roleOnClient: string;
  allocationPercent?: number;
  flatFeeOverride?: number;
  hourlyRateOverride?: number;
  revenueShareOverride?: number;
  profitShareOverride?: number;
  isActive: boolean;
  notes: string;
}

/* ── Client Economics ── */

export interface ClientRevenueEntry {
  category: RevenueCategory;
  monthlyAmount: number;
}

export interface OtherCostEntry {
  id: string;
  label: string;
  monthlyAmount: number;
}

export interface ClientEconomics {
  clientId: string;
  revenueEntries: ClientRevenueEntry[];
  otherCosts: OtherCostEntry[];
}

/* ── Paid Media Fee Model (placeholder) ── */

export type PaidMediaFeeType = 'percent_of_spend' | 'flat' | 'tiered';

export interface PaidMediaFeeModel {
  feeType: PaidMediaFeeType;
  percentOfSpend?: number;
  minimumFee?: number;
  spendTiers?: { minSpend: number; maxSpend: number; feePercent: number }[];
}

/* ── Economics Defaults ── */

export interface EconomicsDefaults {
  currency: string;
  marginTarget: number;
  defaultRevenueCategories: RevenueCategory[];
  defaultCompensationCategories: CompensationComponentType[];
}

/* ── Margin Summary (computed) ── */

export interface MarginSummary {
  totalRevenue: number;
  totalTeamCost: number;
  totalOtherCosts: number;
  totalEstimatedCost: number;
  estimatedGrossProfit: number;
  estimatedMarginPercent: number;
}
