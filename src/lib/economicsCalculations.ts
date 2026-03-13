/**
 * Pure calculation functions for unit economics.
 */
import type {
  CompensationComponent,
  ClientTeamAssignment,
  ClientRevenueEntry,
  OtherCostEntry,
  MarginSummary,
  TeamMember,
} from '@/types/economics';
import { COMP_TYPE_LABELS, REVENUE_CATEGORY_LABELS } from '@/types/economics';

/** A single formula line for display in the UI */
export interface FormulaLine {
  label: string;
  formula: string;
  amount: number;
}

/** Compute the allocated monthly cost of one team member to one client. */
export interface TeamMemberCostLine {
  teamMemberId: string;
  name: string;
  role: string;
  compensationBasis: string;
  estimatedMonthlyCost: number;
  formula: string;
  formulaLines: FormulaLine[];
}

export function calcSalaryAllocation(monthlyCost: number, allocationPercent: number): number {
  return monthlyCost * (allocationPercent / 100);
}

export function calcFlatFee(defaultFee: number, override?: number): number {
  return override ?? defaultFee;
}

export function calcHourlyEstimate(rate: number, estimatedHours: number): number {
  return rate * estimatedHours;
}

export function calcRevenueShare(
  sharePercent: number,
  relevantRevenue: number,
  cap?: number
): number {
  const raw = sharePercent * relevantRevenue;
  return cap ? Math.min(raw, cap) : raw;
}

export function calcProfitShare(
  sharePercent: number,
  relevantProfit: number,
  cap?: number
): number {
  const raw = sharePercent * relevantProfit;
  return cap ? Math.min(raw, cap) : raw;
}

/** Threshold share: share applies only to revenue above a base threshold. */
export function calcThresholdShare(
  sharePercent: number,
  relevantRevenue: number,
  thresholdAmount: number,
  cap?: number
): number {
  const incremental = Math.max(0, relevantRevenue - thresholdAmount);
  const raw = sharePercent * incremental;
  return cap ? Math.min(raw, cap) : raw;
}

export function calcMarginSummary(
  totalRevenue: number,
  totalTeamCost: number,
  totalOtherCosts: number
): MarginSummary {
  const totalEstimatedCost = totalTeamCost + totalOtherCosts;
  const estimatedGrossProfit = totalRevenue - totalEstimatedCost;
  const estimatedMarginPercent = totalRevenue > 0
    ? (estimatedGrossProfit / totalRevenue) * 100
    : 0;

  return {
    totalRevenue,
    totalTeamCost,
    totalOtherCosts,
    totalEstimatedCost,
    estimatedGrossProfit,
    estimatedMarginPercent,
  };
}

/**
 * Compute all team cost lines for a single client.
 */
export function computeClientTeamCosts(
  clientId: string,
  assignments: ClientTeamAssignment[],
  members: TeamMember[],
  compensations: CompensationComponent[],
  revenueEntries: ClientRevenueEntry[]
): TeamMemberCostLine[] {
  const clientAssignments = assignments.filter(a => a.clientId === clientId && a.isActive);
  const revenueMap = new Map(revenueEntries.map(r => [r.category, r.monthlyAmount]));

  return clientAssignments.map(assignment => {
    const member = members.find(m => m.id === assignment.teamMemberId);
    if (!member) return null;

    const memberComps = compensations.filter(c => c.teamMemberId === member.id);
    let totalCost = 0;
    const formulaLines: FormulaLine[] = [];

    for (const comp of memberComps) {
      switch (comp.componentType) {
        case 'salary_allocation': {
          const pct = assignment.allocationPercent ?? 0;
          const cost = calcSalaryAllocation(comp.amount, pct);
          totalCost += cost;
          formulaLines.push({
            label: 'Salary Allocation',
            formula: `${pct}% of $${comp.amount.toLocaleString()}/mo`,
            amount: cost,
          });
          break;
        }
        case 'flat_client_fee': {
          const cost = calcFlatFee(comp.amount, assignment.flatFeeOverride);
          const isOverride = assignment.flatFeeOverride != null;
          totalCost += cost;
          formulaLines.push({
            label: isOverride ? 'Flat Fee (override)' : 'Flat Fee (default)',
            formula: `$${cost.toLocaleString()}/mo`,
            amount: cost,
          });
          break;
        }
        case 'hourly': {
          const rate = assignment.hourlyRateOverride ?? comp.amount;
          const isOverride = assignment.hourlyRateOverride != null;
          const cost = calcHourlyEstimate(rate, 20);
          totalCost += cost;
          formulaLines.push({
            label: isOverride ? 'Hourly (override)' : 'Hourly (default)',
            formula: `$${rate}/hr × 20 hrs est.`,
            amount: cost,
          });
          break;
        }
        case 'revenue_share': {
          const pct = assignment.revenueShareOverride ?? comp.sharePercent ?? 0;
          const isOverride = assignment.revenueShareOverride != null;
          const categoryLabel = comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'N/A';
          const rev = comp.appliesToCategory ? (revenueMap.get(comp.appliesToCategory) ?? 0) : 0;
          const cost = calcRevenueShare(pct, rev, comp.capAmount);
          totalCost += cost;
          formulaLines.push({
            label: isOverride ? `Rev Share (override)` : `Rev Share`,
            formula: `${(pct * 100).toFixed(0)}% of ${categoryLabel} ($${rev.toLocaleString()})${comp.capAmount ? ` · cap $${comp.capAmount.toLocaleString()}` : ''}`,
            amount: cost,
          });
          break;
        }
        case 'profit_share': {
          const pct = assignment.profitShareOverride ?? comp.sharePercent ?? 0;
          const isOverride = assignment.profitShareOverride != null;
          const categoryLabel = comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'N/A';
          const rev = comp.appliesToCategory ? (revenueMap.get(comp.appliesToCategory) ?? 0) : 0;
          const estProfit = rev * 0.6;
          const cost = calcProfitShare(pct, estProfit, comp.capAmount);
          totalCost += cost;
          formulaLines.push({
            label: isOverride ? `Profit Share (override)` : `Profit Share`,
            formula: `${(pct * 100).toFixed(0)}% of ${categoryLabel} est. profit ($${estProfit.toLocaleString()})${comp.capAmount ? ` · cap $${comp.capAmount.toLocaleString()}` : ''}`,
            amount: cost,
          });
          break;
        }
      }
    }

    return {
      teamMemberId: member.id,
      name: member.name,
      role: assignment.roleOnClient || member.role,
      compensationBasis: memberComps.map(c => {
        const isOverride =
          (c.componentType === 'flat_client_fee' && assignment.flatFeeOverride != null) ||
          (c.componentType === 'hourly' && assignment.hourlyRateOverride != null) ||
          (c.componentType === 'revenue_share' && assignment.revenueShareOverride != null) ||
          (c.componentType === 'profit_share' && assignment.profitShareOverride != null);
        return COMP_TYPE_LABELS[c.componentType] + (isOverride ? '*' : '');
      }).join(' + '),
      estimatedMonthlyCost: totalCost,
      formula: formulaLines.map(fl => `${fl.label}: ${fl.formula} = $${fl.amount.toLocaleString()}`).join(' | '),
      formulaLines,
    } as TeamMemberCostLine;
  }).filter(Boolean) as TeamMemberCostLine[];
}
