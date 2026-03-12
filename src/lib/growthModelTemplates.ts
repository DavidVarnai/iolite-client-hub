// Reusable templates for initializing Growth Models by client/proposal type

import type {
  BudgetLineItem, MediaChannelPlan, ChannelAssumption, RevenueAssumption,
  FunnelType, BillingType,
} from '@/types/growthModel';

export type TemplateType = 'ecommerce' | 'lead_gen_services' | 'education' | 'saas' | 'local_business';

export interface GrowthModelTemplate {
  id: string;
  name: string;
  description: string;
  funnelType: FunnelType;
  defaultMonthCount: number;
  agencyServices: ServiceTemplate[];
  mediaChannels: MediaTemplate[];
  otherCosts: ServiceTemplate[];
  channelDefaults: ChannelAssumptionTemplate[];
  revenueDefaults: Omit<RevenueAssumption, 'id' | 'scenarioId'>;
}

export interface ServiceTemplate {
  name: string;
  billingType: BillingType;
  defaultMonthlyAmount: number;
  isInternal: boolean;
}

export interface MediaTemplate {
  channel: string;
  objective: string;
  defaultMonthlyBudget: number;
}

export interface ChannelAssumptionTemplate {
  channel: string;
  cpm: number;
  ctr: number;
  cpc: number;
  lpConvRate: number;
  leadConvRate: number;
  callConvRate: number;
  qualRate: number;
  closeRate: number;
  targetCpl: number;
  targetCpa: number;
  aov: number;
}

export const GROWTH_MODEL_TEMPLATES: GrowthModelTemplate[] = [
  {
    id: 'tpl-ecommerce',
    name: 'Ecommerce Brand',
    description: 'DTC or retail ecommerce with paid media, retention, and creative services',
    funnelType: 'ecommerce',
    defaultMonthCount: 12,
    agencyServices: [
      { name: 'Paid Media Management', billingType: 'monthly', defaultMonthlyAmount: 5000, isInternal: false },
      { name: 'Retention Marketing', billingType: 'monthly', defaultMonthlyAmount: 3500, isInternal: false },
      { name: 'Creative', billingType: 'monthly', defaultMonthlyAmount: 4000, isInternal: false },
      { name: 'SEO', billingType: 'monthly', defaultMonthlyAmount: 2500, isInternal: false },
      { name: 'Analytics', billingType: 'monthly', defaultMonthlyAmount: 1500, isInternal: true },
      { name: 'Web Design', billingType: 'phased', defaultMonthlyAmount: 6000, isInternal: false },
    ],
    mediaChannels: [
      { channel: 'Meta', objective: 'Prospecting & Retargeting', defaultMonthlyBudget: 25000 },
      { channel: 'Google', objective: 'Shopping & Search', defaultMonthlyBudget: 20000 },
      { channel: 'LinkedIn', objective: 'B2B / Wholesale', defaultMonthlyBudget: 3000 },
    ],
    otherCosts: [
      { name: 'Photography', billingType: 'one_time', defaultMonthlyAmount: 8000, isInternal: false },
      { name: 'Software/Platform Costs', billingType: 'monthly', defaultMonthlyAmount: 2000, isInternal: true },
    ],
    channelDefaults: [
      { channel: 'Meta', cpm: 12, ctr: 1.8, cpc: 0.67, lpConvRate: 3.2, leadConvRate: 0, callConvRate: 0, qualRate: 0, closeRate: 100, targetCpl: 0, targetCpa: 42, aov: 85 },
      { channel: 'Google', cpm: 18, ctr: 3.5, cpc: 0.51, lpConvRate: 4.1, leadConvRate: 0, callConvRate: 0, qualRate: 0, closeRate: 100, targetCpl: 0, targetCpa: 35, aov: 92 },
      { channel: 'LinkedIn', cpm: 35, ctr: 0.8, cpc: 4.38, lpConvRate: 2.5, leadConvRate: 15, callConvRate: 0, qualRate: 40, closeRate: 20, targetCpl: 120, targetCpa: 600, aov: 5000 },
    ],
    revenueDefaults: {
      avgDealSize: 88, closeRate: 100, salesCycleLag: 0,
      repeatMultiplier: 1.3, grossMarginPct: 45, attributionWindow: 28, leadToSaleDelay: 0,
    },
  },
  {
    id: 'tpl-lead-gen',
    name: 'Lead Gen / Services',
    description: 'Professional services, legal, medical, or B2B lead generation',
    funnelType: 'lead_gen',
    defaultMonthCount: 6,
    agencyServices: [
      { name: 'Fractional CMO', billingType: 'monthly', defaultMonthlyAmount: 8000, isInternal: false },
      { name: 'Paid Media Management', billingType: 'monthly', defaultMonthlyAmount: 3500, isInternal: false },
      { name: 'Copywriting', billingType: 'monthly', defaultMonthlyAmount: 2500, isInternal: false },
      { name: 'SEO', billingType: 'monthly', defaultMonthlyAmount: 3000, isInternal: false },
      { name: 'Web Design', billingType: 'one_time', defaultMonthlyAmount: 15000, isInternal: false },
    ],
    mediaChannels: [
      { channel: 'Google', objective: 'Search campaigns', defaultMonthlyBudget: 12000 },
      { channel: 'LinkedIn', objective: 'Thought leadership & lead gen', defaultMonthlyBudget: 5000 },
      { channel: 'Yelp', objective: 'Local visibility', defaultMonthlyBudget: 2000 },
    ],
    otherCosts: [
      { name: 'Call Tracking', billingType: 'monthly', defaultMonthlyAmount: 500, isInternal: false },
    ],
    channelDefaults: [
      { channel: 'Google', cpm: 28, ctr: 4.2, cpc: 6.67, lpConvRate: 5.5, leadConvRate: 25, callConvRate: 0, qualRate: 35, closeRate: 15, targetCpl: 85, targetCpa: 1200, aov: 15000 },
      { channel: 'LinkedIn', cpm: 42, ctr: 0.6, cpc: 7.0, lpConvRate: 3.0, leadConvRate: 20, callConvRate: 0, qualRate: 30, closeRate: 12, targetCpl: 150, targetCpa: 2500, aov: 25000 },
      { channel: 'Yelp', cpm: 15, ctr: 2.0, cpc: 0.75, lpConvRate: 8.0, leadConvRate: 30, callConvRate: 0, qualRate: 25, closeRate: 10, targetCpl: 50, targetCpa: 800, aov: 8000 },
    ],
    revenueDefaults: {
      avgDealSize: 15000, closeRate: 15, salesCycleLag: 2,
      repeatMultiplier: 1.0, grossMarginPct: 65, attributionWindow: 90, leadToSaleDelay: 45,
    },
  },
  {
    id: 'tpl-education',
    name: 'Education / Enrollment',
    description: 'Schools, universities, or training programs with enrollment cycles',
    funnelType: 'hybrid',
    defaultMonthCount: 12,
    agencyServices: [
      { name: 'Social Media Management', billingType: 'monthly', defaultMonthlyAmount: 3000, isInternal: false },
      { name: 'Paid Media Management', billingType: 'monthly', defaultMonthlyAmount: 2500, isInternal: false },
      { name: 'Copywriting', billingType: 'monthly', defaultMonthlyAmount: 1500, isInternal: false },
      { name: 'Creative', billingType: 'monthly', defaultMonthlyAmount: 2000, isInternal: false },
    ],
    mediaChannels: [
      { channel: 'Meta', objective: 'Enrollment awareness & inquiry gen', defaultMonthlyBudget: 6000 },
      { channel: 'Google', objective: 'Private school search campaigns', defaultMonthlyBudget: 4500 },
      { channel: 'Spotify', objective: 'Parent demographic targeting', defaultMonthlyBudget: 1500 },
    ],
    otherCosts: [
      { name: 'Video Production', billingType: 'phased', defaultMonthlyAmount: 5000, isInternal: false },
      { name: 'Photography', billingType: 'one_time', defaultMonthlyAmount: 3000, isInternal: false },
    ],
    channelDefaults: [
      { channel: 'Meta', cpm: 14, ctr: 1.2, cpc: 1.17, lpConvRate: 4.0, leadConvRate: 30, callConvRate: 2.5, qualRate: 45, closeRate: 25, targetCpl: 65, targetCpa: 450, aov: 22000 },
      { channel: 'Google', cpm: 22, ctr: 3.8, cpc: 0.58, lpConvRate: 6.0, leadConvRate: 35, callConvRate: 4.0, qualRate: 50, closeRate: 30, targetCpl: 40, targetCpa: 320, aov: 22000 },
      { channel: 'Spotify', cpm: 8, ctr: 0.4, cpc: 2.0, lpConvRate: 2.0, leadConvRate: 15, callConvRate: 1.0, qualRate: 30, closeRate: 15, targetCpl: 200, targetCpa: 1500, aov: 22000 },
    ],
    revenueDefaults: {
      avgDealSize: 22000, closeRate: 25, salesCycleLag: 1,
      repeatMultiplier: 1.0, grossMarginPct: 70, attributionWindow: 60, leadToSaleDelay: 30,
    },
  },
  {
    id: 'tpl-local',
    name: 'Local / Call-Driven Business',
    description: 'Home services, medical practices, legal firms relying on phone calls',
    funnelType: 'phone_calls',
    defaultMonthCount: 12,
    agencyServices: [
      { name: 'Paid Media Management', billingType: 'monthly', defaultMonthlyAmount: 2500, isInternal: false },
      { name: 'SEO', billingType: 'monthly', defaultMonthlyAmount: 2000, isInternal: false },
      { name: 'Web Design', billingType: 'one_time', defaultMonthlyAmount: 8000, isInternal: false },
    ],
    mediaChannels: [
      { channel: 'Google', objective: 'Local search & LSA', defaultMonthlyBudget: 8000 },
      { channel: 'Yelp', objective: 'Local directory', defaultMonthlyBudget: 3000 },
      { channel: 'Meta', objective: 'Local awareness', defaultMonthlyBudget: 2000 },
    ],
    otherCosts: [
      { name: 'Call Tracking', billingType: 'monthly', defaultMonthlyAmount: 300, isInternal: false },
    ],
    channelDefaults: [
      { channel: 'Google', cpm: 20, ctr: 5.0, cpc: 4.0, lpConvRate: 3.0, leadConvRate: 0, callConvRate: 8.0, qualRate: 40, closeRate: 25, targetCpl: 50, targetCpa: 200, aov: 1500 },
      { channel: 'Yelp', cpm: 12, ctr: 2.5, cpc: 4.8, lpConvRate: 2.0, leadConvRate: 0, callConvRate: 6.0, qualRate: 35, closeRate: 20, targetCpl: 80, targetCpa: 400, aov: 1500 },
      { channel: 'Meta', cpm: 10, ctr: 1.0, cpc: 1.0, lpConvRate: 2.0, leadConvRate: 0, callConvRate: 3.0, qualRate: 30, closeRate: 15, targetCpl: 100, targetCpa: 500, aov: 1500 },
    ],
    revenueDefaults: {
      avgDealSize: 1500, closeRate: 25, salesCycleLag: 0,
      repeatMultiplier: 2.0, grossMarginPct: 50, attributionWindow: 14, leadToSaleDelay: 3,
    },
  },
];

export function getTemplateById(id: string): GrowthModelTemplate | undefined {
  return GROWTH_MODEL_TEMPLATES.find(t => t.id === id);
}

// Generate a full model structure from a template
export function initializeFromTemplate(
  template: GrowthModelTemplate,
  clientId: string,
  modelName: string,
  startMonth: string,
): {
  budgetLineItems: BudgetLineItem[];
  mediaChannelPlans: MediaChannelPlan[];
  channelAssumptions: ChannelAssumption[];
  revenueAssumption: RevenueAssumption;
  funnelType: FunnelType;
  monthCount: number;
} {
  const scenarioId = `sc-${Date.now()}`;
  const months = generateTemplateMonths(startMonth, template.defaultMonthCount);

  const budgetLineItems: BudgetLineItem[] = [
    ...template.agencyServices.map((s, i) => ({
      id: `bli-tpl-a${i}-${Date.now()}`,
      scenarioId,
      category: 'agency' as const,
      name: s.name,
      billingType: s.billingType,
      isInternal: s.isInternal,
      notes: '',
      monthlyRecords: s.billingType === 'one_time'
        ? [{ id: `mr-a${i}-0`, lineItemId: `bli-tpl-a${i}-${Date.now()}`, month: months[0], plannedAmount: s.defaultMonthlyAmount }]
        : months.map((m, mi) => ({ id: `mr-a${i}-${mi}`, lineItemId: `bli-tpl-a${i}-${Date.now()}`, month: m, plannedAmount: s.defaultMonthlyAmount })),
    })),
    ...template.otherCosts.map((s, i) => ({
      id: `bli-tpl-o${i}-${Date.now()}`,
      scenarioId,
      category: 'other' as const,
      name: s.name,
      billingType: s.billingType,
      isInternal: s.isInternal,
      notes: '',
      monthlyRecords: s.billingType === 'one_time'
        ? [{ id: `mr-o${i}-0`, lineItemId: `bli-tpl-o${i}-${Date.now()}`, month: months[0], plannedAmount: s.defaultMonthlyAmount }]
        : months.map((m, mi) => ({ id: `mr-o${i}-${mi}`, lineItemId: `bli-tpl-o${i}-${Date.now()}`, month: m, plannedAmount: s.defaultMonthlyAmount })),
    })),
  ];

  const mediaChannelPlans: MediaChannelPlan[] = template.mediaChannels.map((mc, i) => ({
    id: `mcp-tpl-${i}-${Date.now()}`,
    scenarioId,
    channel: mc.channel,
    objective: mc.objective,
    notes: '',
    monthlyRecords: months.map((m, mi) => ({
      id: `mmr-${i}-${mi}`,
      channelPlanId: `mcp-tpl-${i}-${Date.now()}`,
      month: m,
      plannedBudget: mc.defaultMonthlyBudget,
    })),
  }));

  const channelAssumptions: ChannelAssumption[] = template.channelDefaults.map((cd, i) => ({
    id: `ca-tpl-${i}-${Date.now()}`,
    scenarioId,
    ...cd,
  }));

  const revenueAssumption: RevenueAssumption = {
    id: `ra-tpl-${Date.now()}`,
    scenarioId,
    ...template.revenueDefaults,
  };

  return {
    budgetLineItems,
    mediaChannelPlans,
    channelAssumptions,
    revenueAssumption,
    funnelType: template.funnelType,
    monthCount: template.defaultMonthCount,
  };
}

function generateTemplateMonths(startMonth: string, count: number): string[] {
  const [year, month] = startMonth.split('-').map(Number);
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(year, month - 1 + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}
