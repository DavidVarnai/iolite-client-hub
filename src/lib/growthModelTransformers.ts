// Data transformation utilities for Growth Model

import type {
  BudgetLineItem, MediaChannelPlan, MonthlyActual,
  GrowthModel, GrowthModelScenario, ForecastVsActualRow,
  ChannelAssumption, FunnelType,
} from '@/types/growthModel';
import { calcFunnelOutputs, calcVariance } from './growthModelCalculations';

export function generateMonths(startMonth: string, count: number): string[] {
  const months: string[] = [];
  const [year, month] = startMonth.split('-').map(Number);
  for (let i = 0; i < count; i++) {
    const d = new Date(year, month - 1 + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export interface GridRow {
  id: string;
  name: string;
  category?: string;
  billingType?: string;
  notes: string;
  isInternal?: boolean;
  values: Record<string, number>; // month -> amount
  total: number;
}

export function toMonthlyGrid(
  items: BudgetLineItem[] | MediaChannelPlan[],
  months: string[],
): GridRow[] {
  return items.map(item => {
    const values: Record<string, number> = {};
    let total = 0;

    if ('monthlyRecords' in item && 'category' in item) {
      // BudgetLineItem
      const bli = item as BudgetLineItem;
      for (const m of months) {
        const rec = bli.monthlyRecords.find(r => r.month === m);
        values[m] = rec?.plannedAmount || 0;
        total += values[m];
      }
      return {
        id: bli.id, name: bli.name, category: bli.category,
        billingType: bli.billingType, notes: bli.notes,
        isInternal: bli.isInternal, values, total,
      };
    } else {
      // MediaChannelPlan
      const mcp = item as MediaChannelPlan;
      for (const m of months) {
        const rec = mcp.monthlyRecords.find(r => r.month === m);
        values[m] = rec?.plannedBudget || 0;
        total += values[m];
      }
      return {
        id: mcp.id, name: mcp.channel, notes: mcp.notes,
        values, total,
      };
    }
  });
}

export function toForecastVsActualRows(
  scenario: GrowthModelScenario,
  actuals: MonthlyActual[],
  months: string[],
  funnelType: FunnelType,
): ForecastVsActualRow[] {
  const rows: ForecastVsActualRow[] = [];

  for (const month of months) {
    for (const mp of scenario.mediaChannelPlans) {
      const monthRec = mp.monthlyRecords.find(r => r.month === month);
      const forecastSpend = monthRec?.plannedBudget || 0;
      const ca = scenario.channelAssumptions.find(a => a.channel === mp.channel);
      const funnel = ca ? calcFunnelOutputs(ca, forecastSpend, funnelType) : null;
      const forecastResults = funnel?.leads || 0;
      const forecastRevenue = funnel?.revenue || 0;
      const forecastCpl = forecastResults > 0 ? forecastSpend / forecastResults : 0;
      const forecastRom = forecastSpend > 0 ? forecastRevenue / forecastSpend : 0;

      const actual = actuals.find(a => a.month === month && a.channel === mp.channel);
      const actualSpend = actual?.actualSpend || 0;
      const actualResults = (actual?.actualLeads || 0) + (actual?.actualOrders || 0);
      const actualRevenue = actual?.actualRevenue || 0;
      const actualCpl = actual?.actualCpl || (actualResults > 0 ? actualSpend / actualResults : 0);
      const actualRom = actualSpend > 0 ? actualRevenue / actualSpend : 0;

      const spendVar = calcVariance(forecastSpend, actualSpend, true);
      const resultVar = calcVariance(forecastResults, actualResults);

      rows.push({
        month,
        channel: mp.channel,
        forecastSpend, actualSpend,
        spendVariancePct: spendVar.pct,
        forecastResults, actualResults,
        resultVariancePct: resultVar.pct,
        forecastCpl: Math.round(forecastCpl),
        actualCpl: Math.round(actualCpl),
        forecastRevenue: Math.round(forecastRevenue),
        actualRevenue: Math.round(actualRevenue),
        forecastRom: Math.round(forecastRom * 100) / 100,
        actualRom: Math.round(actualRom * 100) / 100,
      });
    }
  }

  return rows;
}

export interface ChartDataPoint {
  month: string;
  label: string;
  forecastInvestment: number;
  forecastRevenue: number;
  actualInvestment: number;
  actualRevenue: number;
  forecastLeads: number;
  actualLeads: number;
  forecastCpa: number;
  actualCpa: number;
}

export function toChartData(model: GrowthModel): ChartDataPoint[] {
  const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];
  if (!scenario) return [];

  const months = generateMonths(model.startMonth, model.monthCount);
  return months.map(month => {
    const label = formatMonth(month);
    let forecastInvestment = 0;
    let forecastLeads = 0;
    let forecastRevenue = 0;

    for (const mp of scenario.mediaChannelPlans) {
      const rec = mp.monthlyRecords.find(r => r.month === month);
      const budget = rec?.plannedBudget || 0;
      forecastInvestment += budget;
      const ca = scenario.channelAssumptions.find(a => a.channel === mp.channel);
      if (ca) {
        const funnel = calcFunnelOutputs(ca, budget, model.funnelType);
        forecastLeads += funnel.leads;
        forecastRevenue += funnel.revenue;
      }
    }

    for (const li of scenario.budgetLineItems) {
      const rec = li.monthlyRecords.find(r => r.month === month);
      forecastInvestment += rec?.plannedAmount || 0;
    }

    const monthActuals = model.actuals.filter(a => a.month === month);
    const actualInvestment = monthActuals.reduce((s, a) => s + a.actualSpend, 0);
    const actualLeads = monthActuals.reduce((s, a) => s + a.actualLeads + a.actualOrders, 0);
    const actualRevenue = monthActuals.reduce((s, a) => s + a.actualRevenue, 0);
    const forecastCpa = forecastLeads > 0 ? forecastInvestment / forecastLeads : 0;
    const actualCpa = actualLeads > 0 ? actualInvestment / actualLeads : 0;

    return {
      month, label,
      forecastInvestment: Math.round(forecastInvestment),
      forecastRevenue: Math.round(forecastRevenue),
      actualInvestment: Math.round(actualInvestment),
      actualRevenue: Math.round(actualRevenue),
      forecastLeads, actualLeads,
      forecastCpa: Math.round(forecastCpa),
      actualCpa: Math.round(actualCpa),
    };
  });
}

export function filterClientVisible(model: GrowthModel): GrowthModel {
  return {
    ...model,
    scenarios: model.scenarios.map(s => ({
      ...s,
      budgetLineItems: s.budgetLineItems.filter(li => !li.isInternal),
    })),
    narratives: model.narratives.filter(n => !n.isInternal),
  };
}

export function toChannelAllocationData(scenario: GrowthModelScenario): { channel: string; budget: number }[] {
  return scenario.mediaChannelPlans.map(mp => ({
    channel: mp.channel,
    budget: mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0),
  })).filter(d => d.budget > 0);
}
