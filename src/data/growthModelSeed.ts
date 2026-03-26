// Growth Model seed data for 3 clients

import type { GrowthModel } from '@/types/growthModel';

function mr(lineItemId: string, months: [string, number][]) {
  return months.map(([month, amt], i) => ({
    id: `${lineItemId}-mr${i}`, lineItemId, month, plannedAmount: amt,
  }));
}

function mmr(channelPlanId: string, months: [string, number][]) {
  return months.map(([month, budget], i) => ({
    id: `${channelPlanId}-mr${i}`, channelPlanId, month, plannedBudget: budget,
  }));
}

const months12 = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
  '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12',
];

// ===== C1: Meridian Commerce (Ecommerce) =====
const c1Model: GrowthModel = {
  id: 'gm-c1', clientId: 'c1', name: 'FY2026 Growth Plan',
  status: 'active', startMonth: '2026-01', monthCount: 12,
  funnelType: 'ecommerce', visibility: 'client',
  createdAt: '2025-12-15T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  performanceInputs: { targetCpa: 42, closeRate: 100, avgDealValue: 88 },
  scenarios: [{
    id: 'sc-c1-base', modelId: 'gm-c1', name: 'base', isDefault: true,
    createdAt: '2025-12-15T10:00:00Z',
    budgetLineItems: [
      { id: 'bli-c1-1', scenarioId: 'sc-c1-base', category: 'agency', name: 'Paid Media Management', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c1-1', months12.map(m => [m, 5000])) },
      { id: 'bli-c1-2', scenarioId: 'sc-c1-base', category: 'agency', name: 'Retention Marketing', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c1-2', months12.map(m => [m, 3500])) },
      { id: 'bli-c1-3', scenarioId: 'sc-c1-base', category: 'agency', name: 'Creative', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c1-3', months12.map(m => [m, 4000])) },
      { id: 'bli-c1-4', scenarioId: 'sc-c1-base', category: 'agency', name: 'SEO', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c1-4', months12.map(m => [m, 2500])) },
      { id: 'bli-c1-5', scenarioId: 'sc-c1-base', category: 'agency', name: 'Analytics', billingType: 'monthly', isInternal: true, notes: 'Internal cost tracking', monthlyRecords: mr('bli-c1-5', months12.map(m => [m, 1500])) },
      { id: 'bli-c1-6', scenarioId: 'sc-c1-base', category: 'agency', name: 'Web Design', billingType: 'phased', isInternal: false, notes: 'Q1-Q2 redesign project', monthlyRecords: mr('bli-c1-6', months12.slice(0, 6).map(m => [m, 6000])) },
      { id: 'bli-c1-7', scenarioId: 'sc-c1-base', category: 'other', name: 'Photography', billingType: 'one_time', isInternal: false, notes: 'Product shoot', monthlyRecords: mr('bli-c1-7', [['2026-02', 8000]]) },
      { id: 'bli-c1-8', scenarioId: 'sc-c1-base', category: 'other', name: 'Software/Platform Costs', billingType: 'monthly', isInternal: true, notes: 'Klaviyo, Shopify Plus', monthlyRecords: mr('bli-c1-8', months12.map(m => [m, 2000])) },
    ],
    mediaChannelPlans: [
      { id: 'mcp-c1-1', scenarioId: 'sc-c1-base', channel: 'Meta', objective: 'Prospecting & Retargeting', notes: '', monthlyRecords: mmr('mcp-c1-1', months12.map((m, i) => [m, 25000 + (i >= 9 ? 10000 : 0)])) },
      { id: 'mcp-c1-2', scenarioId: 'sc-c1-base', channel: 'Google', objective: 'Shopping & Search', notes: '', monthlyRecords: mmr('mcp-c1-2', months12.map((m, i) => [m, 20000 + (i >= 6 ? 5000 : 0)])) },
      { id: 'mcp-c1-3', scenarioId: 'sc-c1-base', channel: 'LinkedIn', objective: 'B2B wholesale leads', notes: 'Testing in Q2', monthlyRecords: mmr('mcp-c1-3', months12.slice(3, 12).map(m => [m, 3000])) },
    ],
    channelAssumptions: [
      { id: 'ca-c1-1', scenarioId: 'sc-c1-base', channel: 'Meta', cpm: 12, ctr: 1.8, cpc: 0.67, lpConvRate: 3.2, leadConvRate: 0, callConvRate: 0, qualRate: 0, closeRate: 100, targetCpl: 0, targetCpa: 42, aov: 85 },
      { id: 'ca-c1-2', scenarioId: 'sc-c1-base', channel: 'Google', cpm: 18, ctr: 3.5, cpc: 0.51, lpConvRate: 4.1, leadConvRate: 0, callConvRate: 0, qualRate: 0, closeRate: 100, targetCpl: 0, targetCpa: 35, aov: 92 },
      { id: 'ca-c1-3', scenarioId: 'sc-c1-base', channel: 'LinkedIn', cpm: 35, ctr: 0.8, cpc: 4.38, lpConvRate: 2.5, leadConvRate: 15, callConvRate: 0, qualRate: 40, closeRate: 20, targetCpl: 120, targetCpa: 600, aov: 5000 },
    ],
    revenueAssumption: {
      id: 'ra-c1', scenarioId: 'sc-c1-base', avgDealSize: 88, closeRate: 100,
      salesCycleLag: 0, repeatMultiplier: 1.3, grossMarginPct: 45,
      attributionWindow: 28, leadToSaleDelay: 0,
    },
  }],
  actuals: [
    { id: 'act-c1-1', modelId: 'gm-c1', month: '2026-01', channel: 'Meta', actualSpend: 24200, actualLeads: 580, actualCalls: 0, actualOrders: 580, actualRevenue: 49300, actualCpa: 41.7, actualCpl: 41.7, notes: '' },
    { id: 'act-c1-2', modelId: 'gm-c1', month: '2026-01', channel: 'Google', actualSpend: 19500, actualLeads: 620, actualCalls: 0, actualOrders: 620, actualRevenue: 57040, actualCpa: 31.5, actualCpl: 31.5, notes: '' },
    { id: 'act-c1-3', modelId: 'gm-c1', month: '2026-02', channel: 'Meta', actualSpend: 25800, actualLeads: 610, actualCalls: 0, actualOrders: 610, actualRevenue: 51850, actualCpa: 42.3, actualCpl: 42.3, notes: '' },
    { id: 'act-c1-4', modelId: 'gm-c1', month: '2026-02', channel: 'Google', actualSpend: 20100, actualLeads: 640, actualCalls: 0, actualOrders: 640, actualRevenue: 58880, actualCpa: 31.4, actualCpl: 31.4, notes: '' },
    { id: 'act-c1-5', modelId: 'gm-c1', month: '2026-03', channel: 'Meta', actualSpend: 26100, actualLeads: 630, actualCalls: 0, actualOrders: 630, actualRevenue: 53550, actualCpa: 41.4, actualCpl: 41.4, notes: '' },
    { id: 'act-c1-6', modelId: 'gm-c1', month: '2026-03', channel: 'Google', actualSpend: 21200, actualLeads: 670, actualCalls: 0, actualOrders: 670, actualRevenue: 61640, actualCpa: 31.6, actualCpl: 31.6, notes: '' },
  ],
  narratives: [
    { id: 'nar-c1-1', modelId: 'gm-c1', section: 'plan_summary', content: 'FY2026 growth plan targets aggressive e-commerce revenue growth through scaled paid media on Meta and Google, complemented by SEO and retention marketing. Total planned investment of ~$750K with projected revenue of $3.2M at a 4.2x ROM.', isInternal: false, updatedAt: '2026-01-10T10:00:00Z' },
    { id: 'nar-c1-2', modelId: 'gm-c1', section: 'performance_summary', content: 'Q1 performance is tracking ahead of plan. Meta and Google channels both exceeding ROAS targets. CAC trending below $42 target. Revenue run rate suggests we will beat annual forecast by 8-12%.', isInternal: false, updatedAt: '2026-03-10T10:00:00Z' },
    { id: 'nar-c1-3', modelId: 'gm-c1', section: 'variances', content: 'Spend is slightly under plan (-3%) due to delayed LinkedIn launch. Results are above plan (+6%) driven by strong Google Shopping performance. CPA is favorable at $36 vs $42 target.', isInternal: false, updatedAt: '2026-03-10T10:00:00Z' },
    { id: 'nar-c1-4', modelId: 'gm-c1', section: 'recommendations', content: 'Recommend accelerating Google PMax budget by 15% given strong ROAS. Consider reallocating LinkedIn test budget to Meta prospecting if Q2 LinkedIn performance doesn\'t improve. Explore TikTok for H2.', isInternal: true, updatedAt: '2026-03-10T10:00:00Z' },
  ],
  snapshots: [
    { id: 'snap-c1-1', modelId: 'gm-c1', name: 'Approved Plan', snapshotData: '{}', createdBy: 'Sarah Chen', createdAt: '2026-01-05T10:00:00Z' },
  ],
};

// ===== C2: Atlas Legal Group (Lead Gen / Service Business) =====
const c2Model: GrowthModel = {
  id: 'gm-c2', clientId: 'c2', name: 'H2 2026 Growth Plan',
  status: 'proposal', startMonth: '2026-04', monthCount: 6,
  funnelType: 'lead_gen', visibility: 'client',
  createdAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z',
  scenarios: [{
    id: 'sc-c2-base', modelId: 'gm-c2', name: 'base', isDefault: true,
    createdAt: '2026-03-08T10:00:00Z',
    budgetLineItems: [
      { id: 'bli-c2-1', scenarioId: 'sc-c2-base', category: 'agency', name: 'Fractional CMO', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c2-1', months12.slice(3, 9).map(m => [m, 8000])) },
      { id: 'bli-c2-2', scenarioId: 'sc-c2-base', category: 'agency', name: 'Paid Media Management', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c2-2', months12.slice(3, 9).map(m => [m, 3500])) },
      { id: 'bli-c2-3', scenarioId: 'sc-c2-base', category: 'agency', name: 'Copywriting', billingType: 'monthly', isInternal: false, notes: 'Thought leadership content', monthlyRecords: mr('bli-c2-3', months12.slice(3, 9).map(m => [m, 2500])) },
      { id: 'bli-c2-4', scenarioId: 'sc-c2-base', category: 'agency', name: 'SEO', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c2-4', months12.slice(3, 9).map(m => [m, 3000])) },
      { id: 'bli-c2-5', scenarioId: 'sc-c2-base', category: 'agency', name: 'Web Design', billingType: 'one_time', isInternal: false, notes: 'Website redesign', monthlyRecords: mr('bli-c2-5', [['2026-04', 15000], ['2026-05', 10000]]) },
      { id: 'bli-c2-6', scenarioId: 'sc-c2-base', category: 'other', name: 'Call Tracking', billingType: 'monthly', isInternal: false, notes: 'CallRail', monthlyRecords: mr('bli-c2-6', months12.slice(3, 9).map(m => [m, 500])) },
    ],
    mediaChannelPlans: [
      { id: 'mcp-c2-1', scenarioId: 'sc-c2-base', channel: 'Google', objective: 'Legal service search campaigns', notes: '', monthlyRecords: mmr('mcp-c2-1', months12.slice(3, 9).map(m => [m, 12000])) },
      { id: 'mcp-c2-2', scenarioId: 'sc-c2-base', channel: 'LinkedIn', objective: 'Thought leadership & lead gen', notes: '', monthlyRecords: mmr('mcp-c2-2', months12.slice(3, 9).map(m => [m, 5000])) },
      { id: 'mcp-c2-3', scenarioId: 'sc-c2-base', channel: 'Yelp', objective: 'Local visibility', notes: '', monthlyRecords: mmr('mcp-c2-3', months12.slice(3, 9).map(m => [m, 2000])) },
    ],
    channelAssumptions: [
      { id: 'ca-c2-1', scenarioId: 'sc-c2-base', channel: 'Google', cpm: 28, ctr: 4.2, cpc: 6.67, lpConvRate: 5.5, leadConvRate: 25, callConvRate: 0, qualRate: 35, closeRate: 15, targetCpl: 85, targetCpa: 1200, aov: 15000 },
      { id: 'ca-c2-2', scenarioId: 'sc-c2-base', channel: 'LinkedIn', cpm: 42, ctr: 0.6, cpc: 7.0, lpConvRate: 3.0, leadConvRate: 20, callConvRate: 0, qualRate: 30, closeRate: 12, targetCpl: 150, targetCpa: 2500, aov: 25000 },
      { id: 'ca-c2-3', scenarioId: 'sc-c2-base', channel: 'Yelp', cpm: 15, ctr: 2.0, cpc: 0.75, lpConvRate: 8.0, leadConvRate: 30, callConvRate: 0, qualRate: 25, closeRate: 10, targetCpl: 50, targetCpa: 800, aov: 8000 },
    ],
    revenueAssumption: {
      id: 'ra-c2', scenarioId: 'sc-c2-base', avgDealSize: 15000, closeRate: 15,
      salesCycleLag: 2, repeatMultiplier: 1.0, grossMarginPct: 65,
      attributionWindow: 90, leadToSaleDelay: 45,
    },
  }],
  actuals: [],
  narratives: [
    { id: 'nar-c2-1', modelId: 'gm-c2', section: 'plan_summary', content: 'Proposed 6-month growth engagement to establish Atlas Legal\'s digital presence and generate qualified leads through paid search, LinkedIn thought leadership, and local visibility. Total investment of ~$180K with a target of 40+ qualified leads and projected new revenue of $900K.', isInternal: false, updatedAt: '2026-03-10T10:00:00Z' },
    { id: 'nar-c2-2', modelId: 'gm-c2', section: 'recommendations', content: 'Frame the proposal around thought leadership ROI. Partners respond to "authority building" not "lead gen." Website redesign should be positioned as the cornerstone. Avoid discussing cost-per-lead with partners directly — focus on deal value.', isInternal: true, updatedAt: '2026-03-10T10:00:00Z' },
  ],
  snapshots: [],
};

// ===== C3: Pinnacle Academy (Education / Hybrid) =====
const c3Model: GrowthModel = {
  id: 'gm-c3', clientId: 'c3', name: 'Enrollment Season 2026',
  status: 'active', startMonth: '2026-01', monthCount: 12,
  funnelType: 'hybrid', visibility: 'client',
  createdAt: '2025-11-20T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z',
  scenarios: [{
    id: 'sc-c3-base', modelId: 'gm-c3', name: 'base', isDefault: true,
    createdAt: '2025-11-20T10:00:00Z',
    budgetLineItems: [
      { id: 'bli-c3-1', scenarioId: 'sc-c3-base', category: 'agency', name: 'Social Media Management', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c3-1', months12.map(m => [m, 3000])) },
      { id: 'bli-c3-2', scenarioId: 'sc-c3-base', category: 'agency', name: 'Paid Media Management', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c3-2', months12.map(m => [m, 2500])) },
      { id: 'bli-c3-3', scenarioId: 'sc-c3-base', category: 'agency', name: 'Copywriting', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c3-3', months12.map(m => [m, 1500])) },
      { id: 'bli-c3-4', scenarioId: 'sc-c3-base', category: 'agency', name: 'Creative', billingType: 'monthly', isInternal: false, notes: '', monthlyRecords: mr('bli-c3-4', months12.map(m => [m, 2000])) },
      { id: 'bli-c3-5', scenarioId: 'sc-c3-base', category: 'other', name: 'Video Production', billingType: 'phased', isInternal: false, notes: 'Campus tour videos', monthlyRecords: mr('bli-c3-5', [['2026-01', 5000], ['2026-02', 5000]]) },
      { id: 'bli-c3-6', scenarioId: 'sc-c3-base', category: 'other', name: 'Photography', billingType: 'one_time', isInternal: false, notes: 'Campus photos', monthlyRecords: mr('bli-c3-6', [['2026-01', 3000]]) },
    ],
    mediaChannelPlans: [
      { id: 'mcp-c3-1', scenarioId: 'sc-c3-base', channel: 'Meta', objective: 'Enrollment awareness & inquiry gen', notes: '', monthlyRecords: mmr('mcp-c3-1', months12.map((m, i) => [m, i >= 1 && i <= 4 ? 8000 : 4000])) },
      { id: 'mcp-c3-2', scenarioId: 'sc-c3-base', channel: 'Google', objective: 'Private school search campaigns', notes: '', monthlyRecords: mmr('mcp-c3-2', months12.map((m, i) => [m, i >= 1 && i <= 4 ? 6000 : 3000])) },
      { id: 'mcp-c3-3', scenarioId: 'sc-c3-base', channel: 'Spotify', objective: 'Parent demographic targeting', notes: 'Testing Q1-Q2', monthlyRecords: mmr('mcp-c3-3', months12.slice(0, 6).map(m => [m, 1500])) },
    ],
    channelAssumptions: [
      { id: 'ca-c3-1', scenarioId: 'sc-c3-base', channel: 'Meta', cpm: 14, ctr: 1.2, cpc: 1.17, lpConvRate: 4.0, leadConvRate: 30, callConvRate: 2.5, qualRate: 45, closeRate: 25, targetCpl: 65, targetCpa: 450, aov: 22000 },
      { id: 'ca-c3-2', scenarioId: 'sc-c3-base', channel: 'Google', cpm: 22, ctr: 3.8, cpc: 0.58, lpConvRate: 6.0, leadConvRate: 35, callConvRate: 4.0, qualRate: 50, closeRate: 30, targetCpl: 40, targetCpa: 320, aov: 22000 },
      { id: 'ca-c3-3', scenarioId: 'sc-c3-base', channel: 'Spotify', cpm: 8, ctr: 0.4, cpc: 2.0, lpConvRate: 2.0, leadConvRate: 15, callConvRate: 1.0, qualRate: 30, closeRate: 15, targetCpl: 200, targetCpa: 1500, aov: 22000 },
    ],
    revenueAssumption: {
      id: 'ra-c3', scenarioId: 'sc-c3-base', avgDealSize: 22000, closeRate: 25,
      salesCycleLag: 1, repeatMultiplier: 1.0, grossMarginPct: 70,
      attributionWindow: 60, leadToSaleDelay: 30,
    },
  }],
  actuals: [
    { id: 'act-c3-1', modelId: 'gm-c3', month: '2026-01', channel: 'Meta', actualSpend: 3800, actualLeads: 12, actualCalls: 3, actualOrders: 0, actualRevenue: 0, actualCpa: 0, actualCpl: 253, notes: 'Ramp-up month' },
    { id: 'act-c3-2', modelId: 'gm-c3', month: '2026-01', channel: 'Google', actualSpend: 2900, actualLeads: 18, actualCalls: 5, actualOrders: 0, actualRevenue: 0, actualCpa: 0, actualCpl: 126, notes: '' },
    { id: 'act-c3-3', modelId: 'gm-c3', month: '2026-02', channel: 'Meta', actualSpend: 7800, actualLeads: 28, actualCalls: 8, actualOrders: 0, actualRevenue: 66000, actualCpa: 0, actualCpl: 217, notes: 'Enrollment season ramp' },
    { id: 'act-c3-4', modelId: 'gm-c3', month: '2026-02', channel: 'Google', actualSpend: 5900, actualLeads: 35, actualCalls: 12, actualOrders: 0, actualRevenue: 88000, actualCpa: 0, actualCpl: 125, notes: '' },
    { id: 'act-c3-5', modelId: 'gm-c3', month: '2026-03', channel: 'Meta', actualSpend: 8200, actualLeads: 32, actualCalls: 10, actualOrders: 0, actualRevenue: 88000, actualCpa: 0, actualCpl: 195, notes: '' },
    { id: 'act-c3-6', modelId: 'gm-c3', month: '2026-03', channel: 'Google', actualSpend: 6100, actualLeads: 38, actualCalls: 14, actualOrders: 0, actualRevenue: 110000, actualCpa: 0, actualCpl: 117, notes: '' },
  ],
  narratives: [
    { id: 'nar-c3-1', modelId: 'gm-c3', section: 'plan_summary', content: 'Enrollment Season 2026 plan focuses on driving inquiries and campus tour bookings through a hybrid digital strategy combining paid social, paid search, and audio advertising. Peak investment during Feb-May enrollment window with sustained presence year-round.', isInternal: false, updatedAt: '2025-12-01T10:00:00Z' },
    { id: 'nar-c3-2', modelId: 'gm-c3', section: 'performance_summary', content: 'Q1 enrollment inquiries are tracking 15% above forecast. Google is the standout performer with CPL 20% below target. Meta improving month-over-month as creative testing matures. Spotify awareness campaign showing early brand lift signals.', isInternal: false, updatedAt: '2026-03-05T10:00:00Z' },
    { id: 'nar-c3-3', modelId: 'gm-c3', section: 'variances', content: 'Spend on track (+2% vs plan). Lead volume above forecast (+15%). Google CPL significantly below target ($117 vs $150 target). Meta CPL trending toward target but still elevated. Spotify difficult to attribute directly.', isInternal: false, updatedAt: '2026-03-05T10:00:00Z' },
    { id: 'nar-c3-4', modelId: 'gm-c3', section: 'recommendations', content: 'Increase Google budget by 20% for Apr-May peak. Reduce Spotify if no lift observed by end of Q2. Focus Meta creative on parent testimonial format which is driving highest engagement. Explore retargeting campus tour page visitors.', isInternal: true, updatedAt: '2026-03-05T10:00:00Z' },
  ],
  snapshots: [
    { id: 'snap-c3-1', modelId: 'gm-c3', name: 'Approved Plan', snapshotData: '{}', createdBy: 'Marcus Webb', createdAt: '2025-12-01T10:00:00Z' },
    { id: 'snap-c3-2', modelId: 'gm-c3', name: 'Q1 Review', snapshotData: '{}', createdBy: 'Marcus Webb', createdAt: '2026-03-05T10:00:00Z' },
  ],
};

export const seedGrowthModels: GrowthModel[] = [c1Model, c2Model, c3Model];

export function getGrowthModelForClient(clientId: string): GrowthModel | undefined {
  return seedGrowthModels.find(m => m.clientId === clientId);
}
