// Pure calculation functions for Growth Model

import type {
  ChannelAssumption, FunnelType, FunnelOutput, RevenueAssumption,
  MonthlyRevenueProjection, VarianceResult, BudgetLineItem, MediaChannelPlan,
  MonthlyActual, Rollups, GrowthModelScenario, GrowthModel, PerformanceInputs,
} from '@/types/growthModel';

/** Simple CPA-based projection: leads = spend / CPA, customers = leads * closeRate, revenue = customers * dealValue */
export function calcSimpleProjection(mediaSpend: number, perf: PerformanceInputs | undefined) {
  if (!perf) return { leads: 0, customers: 0, revenue: 0 };
  const leads = perf.targetCpa > 0 ? Math.round(mediaSpend / perf.targetCpa) : 0;
  const customers = Math.round(leads * (perf.closeRate / 100));
  const revenue = customers * perf.avgDealValue;
  return { leads, customers, revenue };
}

export function calcImpressions(budget: number, cpm: number): number {
  if (cpm <= 0) return 0;
  return Math.round((budget / cpm) * 1000);
}

export function calcClicks(impressions: number, ctr: number): number {
  return Math.round(impressions * (ctr / 100));
}

export function calcLeads(clicks: number, convRate: number): number {
  return Math.round(clicks * (convRate / 100));
}

export function calcFunnelOutputs(
  assumption: ChannelAssumption,
  monthlyBudget: number,
  funnelType: FunnelType,
): FunnelOutput {
  const impressions = calcImpressions(monthlyBudget, assumption.cpm);
  const clicks = calcClicks(impressions, assumption.ctr);
  const sessions = clicks; // 1:1 for simplicity

  let leads = 0, calls = 0, mqls = 0, sqls = 0, opportunities = 0, customers = 0, revenue = 0;

  switch (funnelType) {
    case 'ecommerce': {
      const orders = calcLeads(sessions, assumption.lpConvRate);
      customers = orders;
      revenue = customers * assumption.aov;
      leads = orders;
      break;
    }
    case 'lead_gen': {
      leads = calcLeads(sessions, assumption.lpConvRate);
      mqls = Math.round(leads * (assumption.qualRate / 100));
      sqls = Math.round(mqls * (assumption.leadConvRate / 100));
      opportunities = sqls;
      customers = Math.round(sqls * (assumption.closeRate / 100));
      revenue = customers * assumption.aov;
      break;
    }
    case 'phone_calls': {
      calls = calcLeads(sessions, assumption.callConvRate);
      leads = calls;
      const qualified = Math.round(calls * (assumption.qualRate / 100));
      customers = Math.round(qualified * (assumption.closeRate / 100));
      revenue = customers * assumption.aov;
      mqls = qualified;
      sqls = qualified;
      opportunities = qualified;
      break;
    }
    case 'hybrid': {
      leads = calcLeads(sessions, assumption.lpConvRate);
      calls = calcLeads(sessions, assumption.callConvRate);
      const totalLeads = leads + calls;
      mqls = Math.round(totalLeads * (assumption.qualRate / 100));
      sqls = Math.round(mqls * (assumption.leadConvRate / 100));
      opportunities = sqls;
      customers = Math.round(sqls * (assumption.closeRate / 100));
      revenue = customers * assumption.aov;
      break;
    }
  }

  return { impressions, clicks, sessions, leads, calls, mqls, sqls, opportunities, customers, revenue };
}

export function calcRevenueProjection(
  monthlyLeadsOrOrders: number[],
  monthlySpend: number[],
  assumption: RevenueAssumption,
): MonthlyRevenueProjection[] {
  const projections: MonthlyRevenueProjection[] = [];
  let cumulative = 0;

  for (let i = 0; i < monthlyLeadsOrOrders.length; i++) {
    const lagIndex = Math.max(0, i - assumption.salesCycleLag);
    const effectiveLeads = monthlyLeadsOrOrders[lagIndex] || 0;
    const customers = Math.round(effectiveLeads * (assumption.closeRate / 100));
    const baseRevenue = customers * assumption.avgDealSize;
    const forecastRevenue = baseRevenue * assumption.repeatMultiplier;
    cumulative += forecastRevenue;
    const grossMargin = forecastRevenue * (assumption.grossMarginPct / 100);
    const totalSpendToDate = monthlySpend.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const cac = customers > 0 ? totalSpendToDate / customers : 0;
    const rom = totalSpendToDate > 0 ? cumulative / totalSpendToDate : 0;

    projections.push({
      month: '', // set by caller
      forecastRevenue,
      cumulativeRevenue: cumulative,
      grossMargin,
      cac,
      rom,
    });
  }

  return projections;
}

export function calcVariance(forecast: number, actual: number, lowerIsBetter = false): VarianceResult {
  const delta = actual - forecast;
  const pct = forecast !== 0 ? (delta / forecast) * 100 : 0;
  let direction: VarianceResult['direction'] = 'neutral';

  if (Math.abs(pct) > 1) {
    if (lowerIsBetter) {
      direction = delta < 0 ? 'favorable' : 'unfavorable';
    } else {
      direction = delta > 0 ? 'favorable' : 'unfavorable';
    }
  }

  return { forecast, actual, delta, pct: Math.round(pct * 10) / 10, direction };
}

export function calcRollups(model: GrowthModel): Rollups {
  const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];
  if (!scenario) {
    return { totalAgencyFees: 0, totalMediaBudget: 0, totalOtherCosts: 0, totalInvestment: 0, forecastRevenue: 0, forecastCpa: 0, forecastCpl: 0, actualSpend: 0, actualRevenue: 0, variance: 0 };
  }

  const totalAgencyFees = scenario.budgetLineItems
    .filter(li => li.category === 'agency')
    .reduce((sum, li) => sum + li.monthlyRecords.reduce((s, r) => s + r.plannedAmount, 0), 0);

  const totalMediaBudget = scenario.mediaChannelPlans
    .reduce((sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0);

  const totalOtherCosts = scenario.budgetLineItems
    .filter(li => li.category === 'other')
    .reduce((sum, li) => sum + li.monthlyRecords.reduce((s, r) => s + r.plannedAmount, 0), 0);

  const totalInvestment = totalAgencyFees + totalMediaBudget + totalOtherCosts;

  // Calculate forecast revenue from funnel
  let forecastLeads = 0;
  let forecastRevenue = 0;
  for (const ca of scenario.channelAssumptions) {
    const mp = scenario.mediaChannelPlans.find(m => m.channel === ca.channel);
    const totalBudget = mp?.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0) || 0;
    const avgMonthly = mp && mp.monthlyRecords.length > 0 ? totalBudget / mp.monthlyRecords.length : 0;
    const output = calcFunnelOutputs(ca, avgMonthly, model.funnelType);
    forecastLeads += output.leads * (mp?.monthlyRecords.length || 1);
    forecastRevenue += output.revenue * (mp?.monthlyRecords.length || 1);
  }

  const forecastCpl = forecastLeads > 0 ? totalMediaBudget / forecastLeads : 0;
  const forecastCpa = forecastLeads > 0 ? totalInvestment / forecastLeads : 0;

  const actualSpend = model.actuals.reduce((s, a) => s + a.actualSpend, 0);
  const actualRevenue = model.actuals.reduce((s, a) => s + a.actualRevenue, 0);
  const variance = totalInvestment > 0 ? ((actualRevenue - forecastRevenue) / forecastRevenue) * 100 : 0;

  return {
    totalAgencyFees, totalMediaBudget, totalOtherCosts, totalInvestment,
    forecastRevenue: Math.round(forecastRevenue),
    forecastCpa: Math.round(forecastCpa),
    forecastCpl: Math.round(forecastCpl),
    actualSpend, actualRevenue,
    variance: Math.round(variance * 10) / 10,
  };
}

export function calcBreakEven(totalInvestment: number, monthlyRevenue: number): number {
  if (monthlyRevenue <= 0) return Infinity;
  return Math.ceil(totalInvestment / monthlyRevenue);
}

export function calcROM(revenue: number, investment: number): number {
  if (investment <= 0) return 0;
  return Math.round((revenue / investment) * 100) / 100;
}
