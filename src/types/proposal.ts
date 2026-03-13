/**
 * Proposal data model — generated proposal view model and related types.
 */

/* ── Status ── */

export type ProposalStatus = 'draft' | 'ready' | 'presented' | 'approved' | 'archived';

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  presented: 'Presented',
  approved: 'Approved',
  archived: 'Archived',
};

/* ── Pricing Line ── */

export interface ProposalPricingLine {
  id: string;
  label: string;
  description?: string;
  type: 'service' | 'package' | 'add_on';
  serviceLineId?: string;
  packageId?: string;
  monthlyPrice: number;
  setupFee?: number;
  notes?: string;
}

/* ── Summary Data ── */

export interface ProposalSummaryData {
  executiveSummary: string;
  strategySummary: string;
  scopeSummary: string;
  expectedOutcomesSummary: string;
}

/* ── Pricing Data ── */

export interface ProposalPricingData {
  lines: ProposalPricingLine[];
  subtotal: number;
  discountLabel?: string;
  discountAmount?: number;
  total: number;
}

/* ── Projection Data ── */

export interface ProposalProjectionData {
  projectedMonthlyInvestment: number;
  projectedOutcomes: string[];
  projectedRevenueImpact?: string;
  kpiHighlights: { label: string; target: string }[];
}

/* ── Timeline Data ── */

export interface ProposalTimelineData {
  kickoffDate?: string;
  first30: string;
  first60: string;
  first90: string;
  implementationNotes?: string;
}

/* ── Proposal ── */

export interface Proposal {
  id: string;
  clientId: string;
  name: string;
  status: ProposalStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  selectedBundleId?: string;
  selectedServiceLineIds: string[];
  selectedPackageIds: string[];
  selectedAddOnIds: string[];
  summaryData: ProposalSummaryData;
  pricingData: ProposalPricingData;
  projectionData: ProposalProjectionData;
  timelineData: ProposalTimelineData;
  notes?: string;
}

/* ── Proposal Defaults (Admin) ── */

export interface ProposalDefaults {
  titleFormat: string;
  defaultExecutiveIntro: string;
  defaultTimelineLabels: { first30: string; first60: string; first90: string };
  defaultCtaText: string;
  defaultAssumptionsNote: string;
  showPricingBreakdown: boolean;
  showProjections: boolean;
  showTimeline: boolean;
}
