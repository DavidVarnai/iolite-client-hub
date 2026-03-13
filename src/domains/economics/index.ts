/**
 * Economics domain barrel — team management, compensation, unit economics.
 */
export type {
  TeamMember,
  CompensationComponent,
  ClientTeamAssignment,
  ClientEconomics,
  ClientRevenueEntry,
  OtherCostEntry,
  EconomicsDefaults,
  MarginSummary,
  WorkerType,
  TeamMemberStatus,
  CompensationComponentType,
  RevenueCategory,
} from '@/types/economics';

export {
  WORKER_TYPE_LABELS,
  COMP_TYPE_LABELS,
  REVENUE_CATEGORY_LABELS,
} from '@/types/economics';

export {
  calcSalaryAllocation,
  calcFlatFee,
  calcHourlyEstimate,
  calcRevenueShare,
  calcProfitShare,
  calcThresholdShare,
  calcMarginSummary,
  computeClientTeamCosts,
} from '@/lib/calculations/economics';

export type { FormulaLine, TeamMemberCostLine } from '@/lib/calculations/economics';
