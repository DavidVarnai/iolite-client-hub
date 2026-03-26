// Growth Model types — normalized, scenario-aware data model

export type FunnelType = 'ecommerce' | 'lead_gen' | 'phone_calls' | 'hybrid';
export type ModelStatus = 'draft' | 'proposal' | 'approved' | 'active' | 'archived';
export type ModelVisibility = 'internal' | 'client';
export type ScenarioName = 'base' | 'conservative' | 'aggressive' | 'custom';
export type BillingType = 'monthly' | 'one_time' | 'phased';
export type BudgetCategory = 'agency' | 'other';
export type NarrativeSection = 'plan_summary' | 'performance_summary' | 'variances' | 'recommendations';
export type GrowthModelMode = 'planning' | 'operating';

export const AGENCY_SERVICES = [
  'Fractional CMO', 'Paid Media Management', 'Social Media Management',
  'Retention Marketing', 'Web Design', 'Creative', 'Development',
  'SEO', 'Copywriting', 'Analytics',
] as const;

export const MEDIA_CHANNELS = [
  'Google', 'Meta', 'LinkedIn', 'Yelp', 'Spotify',
  'Custom Media Buy 1', 'Custom Media Buy 2', 'Offline Publication', 'Other',
] as const;

export const OTHER_COST_TYPES = [
  'Photography', 'Video Production', 'Landing Page Build',
  'Call Tracking', 'Software/Platform Costs', 'Creative Production', 'Other',
] as const;

export interface PerformanceInputs {
  targetCpa: number;   // cost per acquisition/lead
  closeRate: number;   // percentage (0-100)
  avgDealValue: number; // revenue per closed customer
}

export interface GrowthModel {
  id: string;
  clientId: string;
  name: string;
  status: ModelStatus;
  startMonth: string; // YYYY-MM
  monthCount: number;
  funnelType: FunnelType;
  visibility: ModelVisibility;
  createdAt: string;
  updatedAt: string;
  performanceInputs: PerformanceInputs;
  scenarios: GrowthModelScenario[];
  actuals: MonthlyActual[];
  narratives: ModelNarrative[];
  snapshots: ModelSnapshot[];
}

export interface GrowthModelScenario {
  id: string;
  modelId: string;
  name: ScenarioName;
  isDefault: boolean;
  createdAt: string;
  budgetLineItems: BudgetLineItem[];
  mediaChannelPlans: MediaChannelPlan[];
  channelAssumptions: ChannelAssumption[];
  revenueAssumption: RevenueAssumption;
}

export interface BudgetLineItem {
  id: string;
  scenarioId: string;
  category: BudgetCategory;
  name: string;
  billingType: BillingType;
  isInternal: boolean;
  notes: string;
  monthlyRecords: MonthlyBudgetRecord[];
}

export interface MonthlyBudgetRecord {
  id: string;
  lineItemId: string;
  month: string; // YYYY-MM
  plannedAmount: number;
}

export interface MediaChannelPlan {
  id: string;
  scenarioId: string;
  channel: string;
  objective: string;
  notes: string;
  monthlyRecords: MonthlyMediaRecord[];
}

export interface MonthlyMediaRecord {
  id: string;
  channelPlanId: string;
  month: string; // YYYY-MM
  plannedBudget: number;
}

export interface ChannelAssumption {
  id: string;
  scenarioId: string;
  channel: string;
  // User inputs
  cpm: number;
  ctr: number; // percentage
  cpc: number;
  lpConvRate: number; // percentage
  leadConvRate: number; // percentage
  callConvRate: number; // percentage
  qualRate: number; // percentage
  closeRate: number; // percentage
  targetCpl: number;
  targetCpa: number;
  aov: number;
}

export interface RevenueAssumption {
  id: string;
  scenarioId: string;
  avgDealSize: number;
  closeRate: number; // percentage
  salesCycleLag: number; // months
  repeatMultiplier: number;
  grossMarginPct: number; // percentage
  attributionWindow: number; // days
  leadToSaleDelay: number; // days
}

export interface MonthlyActual {
  id: string;
  modelId: string;
  month: string; // YYYY-MM
  channel: string;
  actualSpend: number;
  actualLeads: number;
  actualCalls: number;
  actualOrders: number;
  actualRevenue: number;
  actualCpa: number;
  actualCpl: number;
  notes: string;
}

export interface ModelNarrative {
  id: string;
  modelId: string;
  section: NarrativeSection;
  content: string;
  isInternal: boolean;
  updatedAt: string;
}

export interface ModelSnapshot {
  id: string;
  modelId: string;
  name: string;
  snapshotData: string; // JSON serialized
  createdBy: string;
  createdAt: string;
}

// Calculated output types
export interface FunnelOutput {
  impressions: number;
  clicks: number;
  sessions: number;
  leads: number;
  calls: number;
  mqls: number;
  sqls: number;
  opportunities: number;
  customers: number;
  revenue: number;
}

export interface VarianceResult {
  forecast: number;
  actual: number;
  delta: number;
  pct: number;
  direction: 'favorable' | 'unfavorable' | 'neutral';
}

export interface MonthlyRevenueProjection {
  month: string;
  forecastRevenue: number;
  cumulativeRevenue: number;
  grossMargin: number;
  cac: number;
  rom: number;
}

export interface ForecastVsActualRow {
  month: string;
  channel: string;
  forecastSpend: number;
  actualSpend: number;
  spendVariancePct: number;
  forecastResults: number;
  actualResults: number;
  resultVariancePct: number;
  forecastCpl: number;
  actualCpl: number;
  forecastRevenue: number;
  actualRevenue: number;
  forecastRom: number;
  actualRom: number;
}

export interface Rollups {
  totalAgencyFees: number;
  totalMediaBudget: number;
  totalOtherCosts: number;
  totalInvestment: number;
  forecastRevenue: number;
  forecastCpa: number;
  forecastCpl: number;
  actualSpend: number;
  actualRevenue: number;
  variance: number;
}
