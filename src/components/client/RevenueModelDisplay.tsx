/**
 * RevenueModelDisplay — read-only structured display of the Revenue per Conversion
 * sourced from Discovery. Used in Strategy, Growth Model, and Proposal views.
 */
import type { RevenueModelConfig } from '@/types/onboarding';
import { REVENUE_MODEL_TYPE_LABELS } from '@/types/onboarding';
import { Info, Pencil } from 'lucide-react';

interface Props {
  revenueModel: RevenueModelConfig;
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

export default function RevenueModelDisplay({
  revenueModel,
  showEditHint = true,
  onEditClick,
  variant = 'card',
}: Props) {
  const { revenueModelType, revenuePerConversion, revenueUnit, avgContractLengthMonths } = revenueModel;
  const hasValue = revenuePerConversion > 0;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Revenue per Conversion:</span>
        <span className="font-semibold text-primary">{fmtCurrency(revenuePerConversion)}</span>
        {hasValue && (
          <span className="text-muted-foreground">· {REVENUE_MODEL_TYPE_LABELS[revenueModelType]}</span>
        )}
        {avgContractLengthMonths && avgContractLengthMonths > 0 && (
          <span className="text-muted-foreground">· {avgContractLengthMonths}mo contract</span>
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
        </p>
        {hasValue && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {REVENUE_MODEL_TYPE_LABELS[revenueModelType]}
            </span>
            {avgContractLengthMonths && avgContractLengthMonths > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Contract: {avgContractLengthMonths} months
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

/** Calculate effective revenue per conversion for Growth Model calculations */
export function getEffectiveRevenuePerConversion(
  revenueModel: RevenueModelConfig,
  monthCount?: number,
): number {
  const { revenueModelType, revenuePerConversion, avgContractLengthMonths } = revenueModel;
  if (revenuePerConversion <= 0) return 0;

  switch (revenueModelType) {
    case 'one_time':
      return revenuePerConversion;
    case 'monthly_recurring':
      // revenue = value × months (use contract length or model month count)
      return revenuePerConversion * (avgContractLengthMonths || monthCount || 1);
    case 'annual_contract':
      return revenuePerConversion;
    default:
      return revenuePerConversion;
  }
}
