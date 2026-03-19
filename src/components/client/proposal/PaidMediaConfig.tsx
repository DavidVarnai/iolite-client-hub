/**
 * PaidMediaConfig — inline configuration for Paid Media pricing.
 * Supports percent-of-spend, tiered, and flat fee modes.
 */
import { useMemo } from 'react';
import type { PaidMediaPricingConfig, PaidMediaFeeMode, PaidMediaSpendTier } from '@/types/commercialServices';
import { calcPaidMediaFee, DEFAULT_PAID_MEDIA_CONFIG } from '@/types/commercialServices';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/parsing';
import { Plus, Trash2, AlertCircle, Calculator, Zap } from 'lucide-react';

const FEE_MODE_LABELS: Record<PaidMediaFeeMode, string> = {
  flat: 'Flat Fee',
  percent_of_spend: '% of Media Spend',
  tiered: 'Tiered by Spend',
};

interface Props {
  config: PaidMediaPricingConfig;
  onChange: (config: PaidMediaPricingConfig) => void;
  monthlyMediaSpend: number;
  hasMediaPlan: boolean;
}

export default function PaidMediaConfig({ config, onChange, monthlyMediaSpend, hasMediaPlan }: Props) {
  const { fee, source } = useMemo(
    () => calcPaidMediaFee(config, monthlyMediaSpend),
    [config, monthlyMediaSpend],
  );

  const sourceLabel = {
    manual_override: 'Manual override',
    minimum_floor: 'Minimum fee applied',
    spend_based: `${config.percentOfSpend}% of spend`,
    tiered: 'Tiered calculation',
  }[source];

  const handleAddTier = () => {
    const lastTier = config.tiers[config.tiers.length - 1];
    const newTier: PaidMediaSpendTier = {
      upToSpend: (lastTier?.upToSpend || 0) + 10000,
      feePercent: lastTier ? Math.max(lastTier.feePercent - 2, 5) : 15,
    };
    onChange({ ...config, tiers: [...config.tiers, newTier] });
  };

  const handleUpdateTier = (idx: number, field: keyof PaidMediaSpendTier, value: number) => {
    const updated = config.tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t);
    onChange({ ...config, tiers: updated });
  };

  const handleRemoveTier = (idx: number) => {
    onChange({ ...config, tiers: config.tiers.filter((_, i) => i !== idx) });
  };

  return (
    <div className="bg-muted/20 border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Paid Media Pricing</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Fee Mode</label>
          <Select value={config.feeMode} onValueChange={v => onChange({ ...config, feeMode: v as PaidMediaFeeMode })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FEE_MODE_LABELS).map(([k, l]) => (
                <SelectItem key={k} value={k}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Minimum Fee</label>
          <Input type="number" value={config.minimumFee || ''} className="h-8 text-xs"
            onChange={e => onChange({ ...config, minimumFee: parseFloat(e.target.value) || 0 })}
            placeholder="$0" />
        </div>

        {config.feeMode === 'percent_of_spend' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">% of Spend</label>
            <Input type="number" value={config.percentOfSpend || ''} className="h-8 text-xs"
              onChange={e => onChange({ ...config, percentOfSpend: parseFloat(e.target.value) || 0 })}
              placeholder="15" step="0.5" />
          </div>
        )}
      </div>

      {/* Tiered config */}
      {config.feeMode === 'tiered' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Spend Tiers</label>
            <button onClick={handleAddTier}
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3 w-3" /> Add Tier
            </button>
          </div>
          {config.tiers.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No tiers defined. Add at least one tier.</p>
          )}
          {config.tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">Up to</span>
              <Input type="number" value={tier.upToSpend || ''} className="h-7 text-xs w-28"
                onChange={e => handleUpdateTier(idx, 'upToSpend', parseFloat(e.target.value) || 0)}
                placeholder="$10,000" />
              <span className="text-xs text-muted-foreground">→</span>
              <Input type="number" value={tier.feePercent || ''} className="h-7 text-xs w-20"
                onChange={e => handleUpdateTier(idx, 'feePercent', parseFloat(e.target.value) || 0)}
                placeholder="15" step="0.5" />
              <span className="text-xs text-muted-foreground">%</span>
              <button onClick={() => handleRemoveTier(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Media plan linkage */}
      <div className="flex items-center justify-between pt-1 border-t">
        <div className="flex items-center gap-2">
          <Switch checked={config.useMediaPlanSpend}
            onCheckedChange={v => onChange({ ...config, useMediaPlanSpend: v })} />
          <span className="text-xs text-muted-foreground">Use media plan spend</span>
        </div>
        {config.useMediaPlanSpend && !hasMediaPlan && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            <span>No media plan yet</span>
          </div>
        )}
      </div>

      {/* Manual override */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Manual Override</label>
          <Input type="number" className="h-8 text-xs"
            value={config.manualOverrideFee ?? ''}
            onChange={e => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value) || 0;
              onChange({ ...config, manualOverrideFee: val });
            }}
            placeholder="Leave blank for auto-calc" />
        </div>
      </div>

      {/* Calculated fee preview */}
      <div className="bg-background border rounded-md px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Calculated Monthly Fee</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(fee)}</p>
          <p className="text-[10px] text-muted-foreground">{sourceLabel}{config.useMediaPlanSpend && hasMediaPlan ? ` · ${formatCurrency(monthlyMediaSpend)}/mo spend` : ''}</p>
        </div>
      </div>
    </div>
  );
}
