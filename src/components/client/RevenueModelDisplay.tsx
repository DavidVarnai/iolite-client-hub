/**
 * RevenueModelDisplay — read-only structured display of the Revenue per Conversion
 * sourced from Discovery. Used in Strategy, Growth Model, and Proposal views.
 *
 * Revenue interpretation for Growth Model calculations:
 *   - one_time: revenue = conversions × revenuePerConversion
 *   - monthly_recurring: revenue per conversion = value × min(avgContractLengthMonths, modelWindowMonths)
 *     i.e. revenue *recognised within the model window*, not the full contract value.
 *   - annual_contract: revenue = conversions × revenuePerConversion (the annual value)
 */
import type { RevenueModelConfig, RevenueModelType, RevenueStream } from '@/types/onboarding';
import { REVENUE_MODEL_TYPE_LABELS, estimatedContractValue, deriveRevenueUnit, REVENUE_UNIT_LABELS, REVENUE_STREAM_TYPE_LABELS } from '@/types/onboarding';
import { Info, Pencil } from 'lucide-react';

interface Props {
  revenueModel: RevenueModelConfig;
  /** Structured revenue streams (preferred over revenueModel when present) */
  revenueStreams?: RevenueStream[];
  /** Show "Edit in Discovery" link */
  showEditHint?: boolean;
  /** Callback when user clicks the edit action */
  onEditClick?: () => void;
  /** Compact inline variant */
  variant?: 'card' | 'inline';
}

function fmtCurrency(value: number): string {
  return value > 0
    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : 'Not set';
}

/** Human-readable unit suffix, e.g. "per month" */
function unitSuffix(type: RevenueModelType): string {
  return REVENUE_UNIT_LABELS[deriveRevenueUnit(type)].toLowerCase();
}

export default function RevenueModelDisplay({
  revenueModel,
  showEditHint = true,
  onEditClick,
  variant = 'card',
}: Props) {
  const { revenueModelType, revenuePerConversion, avgContractLengthMonths } = revenueModel;
  const hasValue = revenuePerConversion > 0;
  const ecv = estimatedContractValue(revenueModel);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Revenue per Conversion:</span>
        <span className="font-semibold text-primary">{fmtCurrency(revenuePerConversion)}</span>
        {hasValue && (
          <span className="text-muted-foreground">· {unitSuffix(revenueModelType)}</span>
        )}
        {avgContractLengthMonths && avgContractLengthMonths > 0 && (
          <span className="text-muted-foreground">· {avgContractLengthMonths}mo contract</span>
        )}
        {ecv !== null && (
          <span className="text-muted-foreground">· est. {fmtCurrency(ecv)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="panel p-4 flex items-start gap-3">
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Revenue per Conversion
          </p>
          {showEditHint && onEditClick && (
            <button
              onClick={onEditClick}
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <Pencil className="h-2.5 w-2.5" /> Edit in Discovery
            </button>
          )}
        </div>
        <p className={`text-lg font-semibold tabular-nums ${hasValue ? 'text-primary' : 'text-muted-foreground'}`}>
          {fmtCurrency(revenuePerConversion)}
          {hasValue && <span className="text-sm font-normal text-muted-foreground ml-1">{unitSuffix(revenueModelType)}</span>}
        </p>
        {hasValue && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {REVENUE_MODEL_TYPE_LABELS[revenueModelType]}
            </span>
            {avgContractLengthMonths && avgContractLengthMonths > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {avgContractLengthMonths}-month avg contract
              </span>
            )}
            {ecv !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-medium">
                Est. contract value: {fmtCurrency(ecv)}
              </span>
            )}
          </div>
        )}
        {showEditHint && !onEditClick && (
          <p className="text-[10px] text-muted-foreground">
            Defined in Discovery → Business Overview. Read-only here.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate effective revenue per conversion for Growth Model calculations.
 *
 * Interpretation:
 *   - one_time: full value per conversion
 *   - monthly_recurring: value × min(contractLength, modelWindowMonths)
 *     → revenue *recognised within the model time window*
 *   - annual_contract: full annual value per conversion
 *
 * @param revenueModel  The structured revenue config from Discovery
 * @param modelWindowMonths  How many months the growth model covers (e.g. 12)
 */
export function getEffectiveRevenuePerConversion(
  revenueModel: RevenueModelConfig,
  modelWindowMonths?: number,
): number {
  const { revenueModelType, revenuePerConversion, avgContractLengthMonths } = revenueModel;
  if (revenuePerConversion <= 0) return 0;

  switch (revenueModelType) {
    case 'one_time':
      return revenuePerConversion;
    case 'monthly_recurring': {
      // Revenue recognised within the model window
      const months = avgContractLengthMonths && modelWindowMonths
        ? Math.min(avgContractLengthMonths, modelWindowMonths)
        : avgContractLengthMonths || modelWindowMonths || 1;
      return revenuePerConversion * months;
    }
    case 'annual_contract':
      return revenuePerConversion;
    default:
      return revenuePerConversion;
  }
}
