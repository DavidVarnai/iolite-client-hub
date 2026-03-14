import { useMemo } from 'react';
import type { GrowthModel, GrowthModelScenario } from '@/types/growthModel';
import { generateMonths, formatMonth, toMonthlyGrid, GridRow } from '@/lib/growthModelTransformers';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';
import MediaBudgetDistribution from './MediaBudgetDistribution';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

const fmt = formatCurrency;
}

function EditableGrid({ rows, months, onChange, label }: {
  rows: GridRow[];
  months: string[];
  onChange: (rowId: string, month: string, value: number) => void;
  label: string;
}) {
  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    let grand = 0;
    for (const m of months) {
      t[m] = rows.reduce((s, r) => s + (r.values[m] || 0), 0);
      grand += t[m];
    }
    t['_total'] = grand;
    return t;
  }, [rows, months]);

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-6 py-3 hover:bg-muted/50 transition-colors group">
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground ml-auto">{fmt(totals['_total'])}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground sticky left-0 bg-background min-w-[180px]">
                  Line Item
                </th>
                <th className="text-left px-2 py-2 font-medium text-muted-foreground min-w-[80px]">Type</th>
                {months.map(m => (
                  <th key={m} className="text-right px-2 py-2 font-medium text-muted-foreground min-w-[90px]">
                    {formatMonth(m)}
                  </th>
                ))}
                <th className="text-right px-4 py-2 font-medium text-muted-foreground min-w-[100px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-1.5 sticky left-0 bg-background font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {row.name}
                      {row.isInternal && <span className="internal-indicator text-[10px]">Internal</span>}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground capitalize">{row.billingType || '—'}</td>
                  {months.map(m => (
                    <td key={m} className="px-1 py-1">
                      <Input
                        type="number"
                        value={row.values[m] || ''}
                        onChange={(e) => onChange(row.id, m, parseFloat(e.target.value) || 0)}
                        className="h-7 text-right text-xs tabular-nums w-full border-transparent hover:border-input focus:border-input bg-transparent"
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-1.5 text-right font-semibold text-foreground tabular-nums">{fmt(row.total)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-muted/50 font-semibold">
                <td className="px-4 py-2 sticky left-0 bg-muted/50 text-foreground">Total {label}</td>
                <td></td>
                {months.map(m => (
                  <td key={m} className="px-2 py-2 text-right text-foreground tabular-nums">{fmt(totals[m])}</td>
                ))}
                <td className="px-4 py-2 text-right text-primary tabular-nums">{fmt(totals['_total'])}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Media Budget Distribution Panel ──
function MediaBudgetDistribution({ model, scenario, months, onUpdate }: {
  model: GrowthModel; scenario: GrowthModelScenario; months: string[];
  onUpdate: (model: GrowthModel) => void;
}) {
  const channels = scenario.mediaChannelPlans.map(mp => mp.channel);
  const [totalBudget, setTotalBudget] = useState('');
  const [period, setPeriod] = useState<'3' | '6' | '12'>('6');
  const [distribution, setDistribution] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    const share = channels.length > 0 ? Math.floor(100 / channels.length) : 0;
    channels.forEach((ch, i) => {
      // Give Google-like channels more by default
      if (ch.toLowerCase().includes('google') || ch.toLowerCase().includes('search')) {
        defaults[ch] = 55;
      } else if (ch.toLowerCase().includes('meta') || ch.toLowerCase().includes('facebook')) {
        defaults[ch] = 30;
      } else {
        defaults[ch] = share;
      }
    });
    // Normalize to 100
    const sum = Object.values(defaults).reduce((s, v) => s + v, 0);
    if (sum > 0 && sum !== 100) {
      const factor = 100 / sum;
      Object.keys(defaults).forEach(k => defaults[k] = Math.round(defaults[k] * factor));
    }
    return defaults;
  });

  const totalParsed = parseFloat(totalBudget.replace(/[^0-9.]/g, '')) || 0;
  const periodMonths = parseInt(period);
  const monthlyTotal = periodMonths > 0 ? totalParsed / periodMonths : 0;
  const distSum = Object.values(distribution).reduce((s, v) => s + v, 0);

  const handleDistribute = () => {
    if (monthlyTotal <= 0 || distSum === 0) return;
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        mediaChannelPlans: s.mediaChannelPlans.map(mp => {
          const pct = distribution[mp.channel] || 0;
          const channelMonthly = monthlyTotal * (pct / 100);
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

  if (channels.length === 0) return null;

  return (
    <div className="mx-6 mt-4 panel p-4 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Total Media Budget & Distribution</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Total Media Budget</label>
          <Input
            type="text"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="e.g., $60,000"
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Period</label>
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
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Monthly Budget</label>
          <div className="h-8 flex items-center text-sm font-semibold text-primary tabular-nums">
            {monthlyTotal > 0 ? fmt(monthlyTotal) : '—'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Channel Allocation ({distSum}%)</p>
        <div className="grid grid-cols-2 gap-2">
          {channels.map(ch => (
            <div key={ch} className="flex items-center gap-2">
              <span className="text-xs text-foreground w-32 truncate">{ch}</span>
              <Input
                type="number"
                value={distribution[ch] || 0}
                onChange={(e) => setDistribution(prev => ({ ...prev, [ch]: parseInt(e.target.value) || 0 }))}
                className="h-7 text-xs tabular-nums w-20"
                min={0}
                max={100}
              />
              <span className="text-[10px] text-muted-foreground">%</span>
              {monthlyTotal > 0 && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {fmt(monthlyTotal * ((distribution[ch] || 0) / 100))}/mo
                </span>
              )}
            </div>
          ))}
        </div>
        {distSum !== 100 && distSum > 0 && (
          <p className="text-[10px] text-amber-600">Allocation total is {distSum}% — adjust to reach 100%</p>
        )}
      </div>

      <button
        onClick={handleDistribute}
        disabled={monthlyTotal <= 0 || distSum !== 100}
        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Apply Budget Distribution
      </button>
    </div>
  );
}

export default function InvestmentPlan({ model, scenario, onUpdate }: Props) {
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model.startMonth, model.monthCount]);

  const agencyItems = useMemo(() => toMonthlyGrid(
    scenario.budgetLineItems.filter(li => li.category === 'agency'), months
  ), [scenario, months]);

  const otherItems = useMemo(() => toMonthlyGrid(
    scenario.budgetLineItems.filter(li => li.category === 'other'), months
  ), [scenario, months]);

  const mediaItems = useMemo(() => toMonthlyGrid(scenario.mediaChannelPlans, months), [scenario, months]);

  const handleBudgetChange = (rowId: string, month: string, value: number) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        budgetLineItems: s.budgetLineItems.map(li => {
          if (li.id !== rowId) return li;
          const existing = li.monthlyRecords.find(r => r.month === month);
          if (existing) {
            return { ...li, monthlyRecords: li.monthlyRecords.map(r => r.month === month ? { ...r, plannedAmount: value } : r) };
          }
          return { ...li, monthlyRecords: [...li.monthlyRecords, { id: `${li.id}-${month}`, lineItemId: li.id, month, plannedAmount: value }] };
        }),
      };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const handleMediaChange = (rowId: string, month: string, value: number) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        mediaChannelPlans: s.mediaChannelPlans.map(mp => {
          if (mp.id !== rowId) return mp;
          const existing = mp.monthlyRecords.find(r => r.month === month);
          if (existing) {
            return { ...mp, monthlyRecords: mp.monthlyRecords.map(r => r.month === month ? { ...r, plannedBudget: value } : r) };
          }
          return { ...mp, monthlyRecords: [...mp.monthlyRecords, { id: `${mp.id}-${month}`, channelPlanId: mp.id, month, plannedBudget: value }] };
        }),
      };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  // Grand totals
  const grandTotal = useMemo(() => {
    const agency = agencyItems.reduce((s, r) => s + r.total, 0);
    const media = mediaItems.reduce((s, r) => s + r.total, 0);
    const other = otherItems.reduce((s, r) => s + r.total, 0);
    return { agency, media, other, total: agency + media + other };
  }, [agencyItems, mediaItems, otherItems]);

  return (
    <div className="pb-8">
      <MediaBudgetDistribution model={model} scenario={scenario} months={months} onUpdate={onUpdate} />

      <EditableGrid rows={agencyItems} months={months} onChange={handleBudgetChange} label="Agency Services" />
      <EditableGrid rows={mediaItems} months={months} onChange={handleMediaChange} label="Media Budget" />
      <EditableGrid rows={otherItems} months={months} onChange={handleBudgetChange} label="Other Costs" />

      {/* Grand summary */}
      <div className="mx-6 mt-6 panel p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Investment Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Agency Fees', value: grandTotal.agency },
            { label: 'Total Media Budget', value: grandTotal.media },
            { label: 'Total Other Costs', value: grandTotal.other },
            { label: 'Total Marketing Investment', value: grandTotal.total, primary: true },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-lg font-semibold tabular-nums ${item.primary ? 'text-primary' : 'text-foreground'}`}>
                {fmt(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
