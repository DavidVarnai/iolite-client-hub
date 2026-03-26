import { useMemo, useCallback } from 'react';
import type { GrowthModel, GrowthModelScenario, PerformanceInputs } from '@/types/growthModel';
import { calcSimpleProjection, calcBreakEven, calcROM } from '@/lib/growthModelCalculations';
import { generateMonths, formatMonth } from '@/lib/growthModelTransformers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate?: (model: GrowthModel) => void;
}

// Ramp-up curve: reflects realistic optimization timeline
const RAMP_CURVE = [0, 0.15, 0.35, 0.60, 0.80, 1.0];
const RAMP_LABELS = ['Setup', 'Early Data', 'Initial Optimization', 'Benchmark Setting', 'Scaling', 'Steady State'];

function getRampMultiplier(monthIndex: number): number {
  return monthIndex < RAMP_CURVE.length ? RAMP_CURVE[monthIndex] : 1.0;
}

function getRampLabel(monthIndex: number): string {
  if (monthIndex < RAMP_LABELS.length) return RAMP_LABELS[monthIndex];
  return 'Steady State';
}

function EditableInputField({ label, value, suffix, onChange }: {
  label: string; value: number; suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-8 text-xs tabular-nums pr-8"
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function RevenueModel({ model, scenario, onUpdate }: Props) {
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model]);
  const perf = model.performanceInputs;

  const updatePerf = useCallback((patch: Partial<PerformanceInputs>) => {
    if (!onUpdate) return;
    onUpdate({
      ...model,
      performanceInputs: { ...model.performanceInputs, ...patch },
      updatedAt: new Date().toISOString(),
    });
  }, [model, onUpdate]);

  // Monthly media spend per month
  const monthlySpend = useMemo(() => {
    return months.map(month => {
      let spend = 0;
      for (const mp of scenario.mediaChannelPlans) {
        const rec = mp.monthlyRecords.find(r => r.month === month);
        spend += rec?.plannedBudget || 0;
      }
      for (const li of scenario.budgetLineItems) {
        const rec = li.monthlyRecords.find(r => r.month === month);
        spend += rec?.plannedAmount || 0;
      }
      return { month, spend };
    });
  }, [months, scenario]);

  const revenueTable = useMemo(() => {
    let cumRevenue = 0;
    let cumSpend = 0;

    return monthlySpend.map((ms, i) => {
      const ramp = getRampMultiplier(i);
      const rampLabel = getRampLabel(i);
      const mediaOnly = scenario.mediaChannelPlans.reduce((s, mp) => {
        const rec = mp.monthlyRecords.find(r => r.month === ms.month);
        return s + (rec?.plannedBudget || 0);
      }, 0);
      const ramped = mediaOnly * ramp;
      const proj = calcSimpleProjection(ramped, perf);
      cumRevenue += proj.revenue;
      cumSpend += ms.spend;
      const cac = proj.customers > 0 ? cumSpend / proj.customers : 0;
      const rom = calcROM(cumRevenue, cumSpend);

      return {
        month: ms.month,
        leads: proj.leads,
        customers: proj.customers,
        revenue: proj.revenue,
        cumRevenue,
        spend: ms.spend,
        cac,
        rom,
        rampLabel,
        rampPct: Math.round(ramp * 100),
      };
    });
  }, [monthlySpend, scenario, perf]);

  const totalRevenue = revenueTable.reduce((s, r) => s + r.revenue, 0);
  const totalSpend = revenueTable.reduce((s, r) => s + r.spend, 0);
  const breakEven = calcBreakEven(totalSpend, totalRevenue / model.monthCount);
  const finalRom = calcROM(totalRevenue, totalSpend);

  return (
    <div className="p-6 space-y-6">
      {/* Performance Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Inputs</CardTitle>
            {!onUpdate && (
              <p className="text-[10px] text-muted-foreground italic">Read-only</p>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            leads = media spend ÷ target CPA &nbsp;·&nbsp; customers = leads × close rate &nbsp;·&nbsp; revenue = customers × deal value
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <EditableInputField label="Target CPA" value={perf.targetCpa} suffix="$"
              onChange={(v) => updatePerf({ targetCpa: v })} />
            <EditableInputField label="Close Rate" value={perf.closeRate} suffix="%"
              onChange={(v) => updatePerf({ closeRate: v })} />
            <EditableInputField label="Avg Deal Value" value={perf.avgDealValue} suffix="$"
              onChange={(v) => updatePerf({ avgDealValue: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Ramp-up visualization */}
      <div className="panel p-4">
        <p className="text-xs font-medium text-foreground mb-2">Performance Ramp-Up Curve</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Results follow a realistic ramp-up: ~3 months to see early results, then 3 months of optimization before reaching steady state.
        </p>
        <div className="flex gap-1">
          {RAMP_CURVE.map((pct, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all"
                  style={{ height: `${pct * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">M{i + 1}</p>
              <p className="text-[9px] font-medium text-foreground">{Math.round(pct * 100)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Forecast Revenue', value: fmt(totalRevenue), primary: true },
          { label: 'Total Investment', value: fmt(totalSpend) },
          { label: 'ROM', value: `${finalRom.toFixed(1)}x` },
          { label: 'Break-even', value: breakEven === Infinity ? 'N/A' : `${breakEven} mo` },
        ].map(item => (
          <div key={item.label} className="panel p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-lg font-semibold tabular-nums ${item.primary ? 'text-primary' : 'text-foreground'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly projection table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Month</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Phase</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Ramp</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Leads</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Customers</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Revenue</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Cumulative</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">CAC</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">ROM</th>
              </tr>
            </thead>
            <tbody>
              {revenueTable.map(row => (
                <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground">{formatMonth(row.month)}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                      row.rampPct === 0 ? 'bg-muted text-muted-foreground'
                        : row.rampPct < 60 ? 'bg-amber-500/10 text-amber-600'
                        : row.rampPct < 100 ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {row.rampLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.rampPct}%</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.leads}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.customers}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.revenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.cumRevenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.cac > 0 ? fmt(row.cac) : '—'}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">{row.rom.toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
