import { useState, useMemo, useCallback } from 'react';
import type { GrowthModel, GrowthModelScenario, MediaChannelPlan } from '@/types/growthModel';
import { MEDIA_CHANNELS } from '@/types/growthModel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, X, Scale } from 'lucide-react';
import { parseCurrency, formatCurrency } from '@/lib/parsing';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  months: string[];
  onUpdate: (model: GrowthModel) => void;
}

const DEFAULT_DSPS = MEDIA_CHANNELS.filter(
  ch => !ch.startsWith('Custom') && ch !== 'Other' && ch !== 'Offline Publication'
);

function getActiveDSPs(scenario: GrowthModelScenario): string[] {
  return scenario.mediaChannelPlans.map(mp => mp.channel);
}

function buildDefaultAllocation(channels: string[]): Record<string, number> {
  if (channels.length === 0) return {};
  const share = Math.floor(100 / channels.length);
  const alloc: Record<string, number> = {};
  channels.forEach((ch, i) => {
    alloc[ch] = i === 0 ? 100 - share * (channels.length - 1) : share;
  });
  return alloc;
}

export default function MediaBudgetDistribution({ model, scenario, months, onUpdate }: Props) {
  const activeDSPs = useMemo(() => getActiveDSPs(scenario), [scenario]);

  const [budgetRaw, setBudgetRaw] = useState('');
  const [budgetDisplay, setBudgetDisplay] = useState('');
  const [period, setPeriod] = useState<'3' | '6' | '12'>('6');
  const [allocation, setAllocation] = useState<Record<string, number>>(() =>
    buildDefaultAllocation(activeDSPs)
  );
  const [customDSP, setCustomDSP] = useState('');

  const totalBudget = parseCurrency(budgetRaw);
  const periodMonths = parseInt(period);
  const monthlyBudget = periodMonths > 0 ? totalBudget / periodMonths : 0;
  const allocSum = Object.values(allocation).reduce((s, v) => s + v, 0);
  const isValid = monthlyBudget > 0 && allocSum === 100;

  // Available DSPs not yet active
  const availableDSPs = useMemo(() =>
    [...DEFAULT_DSPS, 'Offline Publication', 'Other'].filter(ch => !activeDSPs.includes(ch)),
    [activeDSPs]
  );

  const handleBudgetChange = (value: string) => {
    setBudgetRaw(value);
    const parsed = parseCurrency(value);
    if (parsed > 0) {
      setBudgetDisplay(formatCurrency(parsed));
    } else {
      setBudgetDisplay('');
    }
  };

  const handleBudgetBlur = () => {
    const parsed = parseCurrency(budgetRaw);
    if (parsed > 0) {
      setBudgetRaw(formatCurrency(parsed));
    }
  };

  const handleBudgetFocus = () => {
    const parsed = parseCurrency(budgetRaw);
    if (parsed > 0) {
      setBudgetRaw(String(parsed));
    }
  };

  const addDSP = (channel: string) => {
    const newPlan: MediaChannelPlan = {
      id: `mp-${Date.now()}-${channel.replace(/\s/g, '')}`,
      scenarioId: scenario.id,
      channel,
      objective: '',
      notes: '',
      monthlyRecords: [],
    };

    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return { ...s, mediaChannelPlans: [...s.mediaChannelPlans, newPlan] };
    });

    // Add to allocation with 0%
    setAllocation(prev => ({ ...prev, [channel]: 0 }));
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const addCustomDSP = () => {
    const name = customDSP.trim();
    if (!name || activeDSPs.includes(name)) return;
    addDSP(name);
    setCustomDSP('');
  };

  const removeDSP = (channel: string) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        mediaChannelPlans: s.mediaChannelPlans.filter(mp => mp.channel !== channel),
        channelAssumptions: s.channelAssumptions.filter(ca => ca.channel !== channel),
      };
    });
    setAllocation(prev => {
      const next = { ...prev };
      delete next[channel];
      return next;
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const normalizeAllocation = () => {
    if (allocSum === 0 || activeDSPs.length === 0) return;
    const factor = 100 / allocSum;
    const normalized: Record<string, number> = {};
    const keys = Object.keys(allocation);
    let remaining = 100;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        normalized[k] = remaining;
      } else {
        normalized[k] = Math.round((allocation[k] || 0) * factor);
        remaining -= normalized[k];
      }
    });
    setAllocation(normalized);
  };

  const handleDistribute = () => {
    if (!isValid) return;
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        mediaChannelPlans: s.mediaChannelPlans.map(mp => {
          const pct = allocation[mp.channel] || 0;
          const channelMonthly = monthlyBudget * (pct / 100);
          const applicableMonths = months.slice(0, periodMonths);
          const updatedRecords = applicableMonths.map(month => {
            const existing = mp.monthlyRecords.find(r => r.month === month);
            return existing
              ? { ...existing, plannedBudget: channelMonthly }
              : { id: `${mp.id}-${month}`, channelPlanId: mp.id, month, plannedBudget: channelMonthly };
          });
          const otherRecords = mp.monthlyRecords.filter(r => !applicableMonths.includes(r.month));
          return { ...mp, monthlyRecords: [...otherRecords, ...updatedRecords] };
        }),
      };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  return (
    <div className="mx-6 mt-4 panel p-5 space-y-5">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Media Budget & DSP Allocation</h3>
      </div>

      {/* ── Active DSPs ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active DSPs</p>
        <div className="flex flex-wrap gap-1.5">
          {activeDSPs.map(ch => (
            <Badge key={ch} variant="secondary" className="gap-1 text-xs pr-1">
              {ch}
              <button
                onClick={() => removeDSP(ch)}
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {activeDSPs.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No DSPs selected — add channels below</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Select onValueChange={(v) => addDSP(v)}>
            <SelectTrigger className="h-8 text-xs w-48">
              <SelectValue placeholder="Add a DSP…" />
            </SelectTrigger>
            <SelectContent>
              {availableDSPs.map(ch => (
                <SelectItem key={ch} value={ch} className="text-xs">{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Input
              value={customDSP}
              onChange={(e) => setCustomDSP(e.target.value)}
              placeholder="Custom DSP…"
              className="h-8 text-xs w-36"
              onKeyDown={(e) => e.key === 'Enter' && addCustomDSP()}
            />
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={addCustomDSP} disabled={!customDSP.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {activeDSPs.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Select DSPs above to configure budget allocation.</p>
      )}

      {activeDSPs.length > 0 && (
        <>
          {/* ── Budget & Period ── */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Total Media Budget
              </label>
              <Input
                type="text"
                value={budgetRaw}
                onChange={(e) => handleBudgetChange(e.target.value)}
                onBlur={handleBudgetBlur}
                onFocus={handleBudgetFocus}
                placeholder="$0"
                className="h-8 text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Period
              </label>
              <Select value={period} onValueChange={(v) => setPeriod(v as '3' | '6' | '12')}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3" className="text-xs">3 months</SelectItem>
                  <SelectItem value="6" className="text-xs">6 months</SelectItem>
                  <SelectItem value="12" className="text-xs">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Monthly Budget
              </label>
              <div className="h-8 flex items-center text-sm font-semibold text-primary tabular-nums">
                {monthlyBudget > 0 ? formatCurrency(monthlyBudget) : '—'}
              </div>
            </div>
          </div>

          {/* ── Channel Allocation ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Channel Allocation
                <span className={`ml-1.5 font-semibold ${allocSum === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  ({allocSum}%)
                </span>
              </p>
              {allocSum !== 100 && allocSum > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                  onClick={normalizeAllocation}
                >
                  <Scale className="h-3 w-3" />
                  Normalize to 100%
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeDSPs.map(ch => (
                <div key={ch} className="flex items-center gap-2">
                  <span className="text-xs text-foreground w-32 truncate" title={ch}>{ch}</span>
                  <Input
                    type="number"
                    value={allocation[ch] ?? 0}
                    onChange={(e) => setAllocation(prev => ({ ...prev, [ch]: parseInt(e.target.value) || 0 }))}
                    className="h-7 text-xs tabular-nums w-20"
                    min={0}
                    max={100}
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                  {monthlyBudget > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatCurrency(monthlyBudget * ((allocation[ch] || 0) / 100))}/mo
                    </span>
                  )}
                </div>
              ))}
            </div>
            {allocSum !== 100 && allocSum > 0 && (
              <p className="text-[10px] text-amber-600">
                Allocation total is {allocSum}% — {allocSum < 100 ? `${100 - allocSum}% remaining` : `${allocSum - 100}% over budget`}
              </p>
            )}
          </div>

          {/* ── Apply ── */}
          <Button
            onClick={handleDistribute}
            disabled={!isValid}
            className="text-xs"
            size="sm"
          >
            Apply Budget Distribution
          </Button>
        </>
      )}
    </div>
  );
}
