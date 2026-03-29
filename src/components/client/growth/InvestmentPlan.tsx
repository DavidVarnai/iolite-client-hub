import { useMemo, useState } from 'react';
import type { GrowthModel, GrowthModelScenario, BillingType } from '@/types/growthModel';
import { generateMonths, formatMonth, toMonthlyGrid, GridRow } from '@/lib/growthModelTransformers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';
import MediaBudgetDistribution from './MediaBudgetDistribution';
import AgencyFeesSummaryCard from './AgencyFeesSummaryCard';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

const fmt = formatCurrency;

function EditableGrid({ rows, months, onChange, label, onDelete }: {
  rows: GridRow[];
  months: string[];
  onChange: (rowId: string, month: string, value: number) => void;
  label: string;
  onDelete?: (rowId: string) => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleDeleteClick = (row: GridRow) => {
    if (!onDelete) return;
    if (row.total > 0) {
      setConfirmDeleteId(row.id);
    } else {
      onDelete(row.id);
    }
  };

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-6 py-3 hover:bg-muted/50 transition-colors group">
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground ml-auto">{fmt(totals['_total'])}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {rows.length === 0 ? (
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-muted-foreground">No other costs added yet. Add software, tools, subscriptions, or vendor costs.</p>
            </div>
          ) : (
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
                    {onDelete && <th className="w-8"></th>}
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
                      {onDelete && (
                        <td className="px-1 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-muted/50 font-semibold">
                    <td className="px-4 py-2 sticky left-0 bg-muted/50 text-foreground">Total {label}</td>
                    <td></td>
                    {months.map(m => (
                      <td key={m} className="px-2 py-2 text-right text-foreground tabular-nums">{fmt(totals[m])}</td>
                    ))}
                    <td className="px-4 py-2 text-right text-primary tabular-nums">{fmt(totals['_total'])}</td>
                    {onDelete && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete line item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item has planned amounts. Deleting it will remove all its data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteId && onDelete) onDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AddOtherCostPopover({ onAdd }: { onAdd: (name: string, billingType: BillingType | 'custom_schedule') => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [billingType, setBillingType] = useState<BillingType | 'custom_schedule'>('monthly');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), billingType);
    setName('');
    setBillingType('monthly');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-6 mt-2 mb-4 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Other Cost
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Call Tracking, Software"
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Billing Type</label>
            <Select value={billingType} onValueChange={(v) => setBillingType(v as BillingType | 'custom_schedule')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="one_time">One-Time</SelectItem>
                <SelectItem value="custom_schedule">Custom Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="w-full" onClick={handleSubmit} disabled={!name.trim()}>
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function InvestmentPlan({ model, scenario, onUpdate }: Props) {
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model.startMonth, model.monthCount]);

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

  const handleAddOtherCost = (name: string, billingType: BillingType | 'custom_schedule') => {
    const newItem = {
      id: `bli-other-${Date.now()}`,
      scenarioId: scenario.id,
      category: 'other' as const,
      name,
      billingType: billingType as BillingType,
      isInternal: false,
      notes: '',
      monthlyRecords: [],
    };
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return { ...s, budgetLineItems: [...s.budgetLineItems, newItem] };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const handleDeleteOtherCost = (rowId: string) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return { ...s, budgetLineItems: s.budgetLineItems.filter(li => li.id !== rowId) };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const grandTotal = useMemo(() => {
    const media = mediaItems.reduce((s, r) => s + r.total, 0);
    const other = otherItems.reduce((s, r) => s + r.total, 0);
    return { media, other, total: media + other };
  }, [mediaItems, otherItems]);

  return (
    <div className="pb-8">
      <MediaBudgetDistribution model={model} scenario={scenario} months={months} onUpdate={onUpdate} />
      <AgencyFeesSummaryCard />

      <EditableGrid rows={mediaItems} months={months} onChange={handleMediaChange} label="Media Budget" />
      <EditableGrid rows={otherItems} months={months} onChange={handleBudgetChange} label="Other Costs" onDelete={handleDeleteOtherCost} />
      <AddOtherCostPopover onAdd={handleAddOtherCost} />

      <div className="mx-6 mt-6 panel p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Investment Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Media Budget</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{fmt(grandTotal.media)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Other Costs</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{fmt(grandTotal.other)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Marketing Investment</p>
            <p className="text-lg font-semibold tabular-nums text-primary">{fmt(grandTotal.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
