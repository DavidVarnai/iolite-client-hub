import { useMemo } from 'react';
import type { GrowthModel, GrowthModelScenario } from '@/types/growthModel';
import { generateMonths, formatMonth, toMonthlyGrid, GridRow } from '@/lib/growthModelTransformers';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';
import MediaBudgetDistribution from './MediaBudgetDistribution';
import { currentUser } from '@/data/seed';
import { isAdminUser } from '@/types/admin';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

const fmt = formatCurrency;

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
