/**
 * Pure calculation functions for unit economics.
 * Re-exports from the calculations module for backward compatibility.
 */
export {
  calcSalaryAllocation,
  calcFlatFee,
  calcHourlyEstimate,
  calcRevenueShare,
  calcProfitShare,
  calcThresholdShare,
  calcMarginSummary,
  computeClientTeamCosts,
} from './calculations/economics';

export type { FormulaLine, TeamMemberCostLine } from './calculations/economics';
