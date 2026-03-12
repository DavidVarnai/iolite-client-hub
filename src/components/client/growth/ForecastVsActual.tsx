import { useMemo } from 'react';
import type { GrowthModel, GrowthModelScenario, MonthlyActual } from '@/types/growthModel';
import { generateMonths, formatMonth, toForecastVsActualRows } from '@/lib/growthModelTransformers';
import { Input } from '@/components/ui/input';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

function varianceClass(pct: number, lowerIsBetter = false): string {
  if (pct === 0) return 'text-muted-foreground';
  if (lowerIsBetter) return pct < 0 ? 'text-emerald-600' : 'text-destructive';
  return pct > 0 ? 'text-emerald-600' : 'text-destructive';
}

function varianceBg(pct: number, lowerIsBetter = false): string {
  if (pct === 0) return '';
  if (lowerIsBetter) return pct < 0 ? 'bg-emerald-50' : 'bg-red-50';
  return pct > 0 ? 'bg-emerald-50' : 'bg-red-50';
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function ForecastVsActual({ model, scenario, onUpdate }: Props) {
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model]);
  const rows = useMemo(() => toForecastVsActualRows(scenario, model.actuals, months, model.funnelType), [scenario, model.actuals, months, model.funnelType]);

  const handleActualChange = (month: string, channel: string, field: keyof MonthlyActual, value: number) => {
    const existing = model.actuals.find(a => a.month === month && a.channel === channel);
    if (existing) {
      onUpdate({
        ...model,
        actuals: model.actuals.map(a =>
          a.month === month && a.channel === channel ? { ...a, [field]: value } : a
        ),
      });
    } else {
      const newActual: MonthlyActual = {
        id: `act-new-${Date.now()}`, modelId: model.id, month, channel,
        actualSpend: 0, actualLeads: 0, actualCalls: 0, actualOrders: 0,
        actualRevenue: 0, actualCpa: 0, actualCpl: 0, notes: '',
        [field]: value,
      };
      onUpdate({ ...model, actuals: [...model.actuals, newActual] });
    }
  };

  // Group rows by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof rows> = {};
    for (const row of rows) {
      if (!groups[row.month]) groups[row.month] = [];
      groups[row.month].push(row);
    }
    return groups;
  }, [rows]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Forecast vs Actual Performance</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Favorable</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive"></span> Unfavorable</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground"></span> No data</span>
        </div>
      </div>

      {Object.entries(groupedByMonth).map(([month, monthRows]) => (
        <div key={month} className="panel overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b">
            <span className="text-xs font-semibold text-foreground">{formatMonth(month)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground min-w-[120px]">Channel</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Fcst Spend</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Actual Spend</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Var %</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Fcst Results</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Actual Results</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Var %</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Fcst CPL</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Actual CPL</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Fcst Rev</th>
                  <th className="text-right px-2 py-2 font-medium text-muted-foreground">Actual Rev</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">ROM</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map(row => {
                  const hasActual = row.actualSpend > 0 || row.actualResults > 0;
                  return (
                    <tr key={`${row.month}-${row.channel}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-1.5 font-medium text-foreground">{row.channel}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{fmt(row.forecastSpend)}</td>
                      <td className="px-1 py-1">
                        <Input
                          type="number"
                          value={row.actualSpend || ''}
                          onChange={(e) => handleActualChange(month, row.channel, 'actualSpend', parseFloat(e.target.value) || 0)}
                          className="h-7 text-right text-xs tabular-nums w-20 border-transparent hover:border-input focus:border-input bg-transparent"
                          placeholder="—"
                        />
                      </td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${hasActual ? varianceClass(row.spendVariancePct, true) : 'text-muted-foreground'} ${hasActual ? varianceBg(row.spendVariancePct, true) : ''}`}>
                        {hasActual ? `${row.spendVariancePct > 0 ? '+' : ''}${row.spendVariancePct}%` : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{row.forecastResults}</td>
                      <td className="px-1 py-1">
                        <Input
                          type="number"
                          value={row.actualResults || ''}
                          onChange={(e) => handleActualChange(month, row.channel, 'actualLeads', parseFloat(e.target.value) || 0)}
                          className="h-7 text-right text-xs tabular-nums w-16 border-transparent hover:border-input focus:border-input bg-transparent"
                          placeholder="—"
                        />
                      </td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${hasActual ? varianceClass(row.resultVariancePct) : 'text-muted-foreground'} ${hasActual ? varianceBg(row.resultVariancePct) : ''}`}>
                        {hasActual ? `${row.resultVariancePct > 0 ? '+' : ''}${row.resultVariancePct}%` : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{row.forecastCpl > 0 ? fmt(row.forecastCpl) : '—'}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{row.actualCpl > 0 ? fmt(row.actualCpl) : '—'}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{fmt(row.forecastRevenue)}</td>
                      <td className="px-1 py-1">
                        <Input
                          type="number"
                          value={row.actualRevenue || ''}
                          onChange={(e) => handleActualChange(month, row.channel, 'actualRevenue', parseFloat(e.target.value) || 0)}
                          className="h-7 text-right text-xs tabular-nums w-20 border-transparent hover:border-input focus:border-input bg-transparent"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-foreground">{row.actualRom > 0 ? `${row.actualRom}x` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
