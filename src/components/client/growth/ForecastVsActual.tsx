import { useState, useMemo } from 'react';
import type { GrowthModel, GrowthModelScenario, MonthlyActual } from '@/types/growthModel';
import { generateMonths, formatMonth, toForecastVsActualRows } from '@/lib/growthModelTransformers';
import { calcVariance } from '@/lib/growthModelCalculations';
import { Input } from '@/components/ui/input';
import AiActionButton from '@/components/ai/AiActionButton';
import AiResultPanel from '@/components/ai/AiResultPanel';
import { runPerformanceAnalysis } from '@/lib/ai/aiActions';
import type { AiActionStatus, PerformanceAnalysisResult } from '@/types/ai';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

type ViewMode = 'detailed' | 'summary';

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

// === Summary View: one row per month, aggregated across channels ===

interface MonthlySummaryRow {
  month: string;
  forecastSpend: number;
  actualSpend: number;
  spendVarPct: number;
  forecastResults: number;
  actualResults: number;
  resultVarPct: number;
  forecastRevenue: number;
  actualRevenue: number;
  revenueVarPct: number;
}

function SummaryView({ model, scenario, months, onUpdate }: Props & { months: string[] }) {
  const rows = useMemo(() => toForecastVsActualRows(scenario, model.actuals, months, model.funnelType), [scenario, model.actuals, months, model.funnelType]);

  const summaryRows: MonthlySummaryRow[] = useMemo(() => {
    return months.map(month => {
      const monthRows = rows.filter(r => r.month === month);
      const forecastSpend = monthRows.reduce((s, r) => s + r.forecastSpend, 0);
      const actualSpend = monthRows.reduce((s, r) => s + r.actualSpend, 0);
      const forecastResults = monthRows.reduce((s, r) => s + r.forecastResults, 0);
      const actualResults = monthRows.reduce((s, r) => s + r.actualResults, 0);
      const forecastRevenue = monthRows.reduce((s, r) => s + r.forecastRevenue, 0);
      const actualRevenue = monthRows.reduce((s, r) => s + r.actualRevenue, 0);

      const spendVar = calcVariance(forecastSpend, actualSpend, true);
      const resultVar = calcVariance(forecastResults, actualResults);
      const revVar = calcVariance(forecastRevenue, actualRevenue);

      return {
        month,
        forecastSpend, actualSpend, spendVarPct: spendVar.pct,
        forecastResults, actualResults, resultVarPct: resultVar.pct,
        forecastRevenue, actualRevenue, revenueVarPct: revVar.pct,
      };
    });
  }, [months, rows]);

  const handleSummaryChange = (month: string, field: 'actualSpend' | 'actualLeads' | 'actualRevenue', value: number) => {
    // Distribute value evenly across channels for that month
    const channels = scenario.mediaChannelPlans.map(mp => mp.channel);
    const perChannel = channels.length > 0 ? value / channels.length : 0;
    let updatedActuals = [...model.actuals];

    for (const channel of channels) {
      const idx = updatedActuals.findIndex(a => a.month === month && a.channel === channel);
      if (idx >= 0) {
        updatedActuals[idx] = { ...updatedActuals[idx], [field]: perChannel };
      } else {
        updatedActuals.push({
          id: `act-sum-${Date.now()}-${channel}`, modelId: model.id, month, channel,
          actualSpend: 0, actualLeads: 0, actualCalls: 0, actualOrders: 0,
          actualRevenue: 0, actualCpa: 0, actualCpl: 0, notes: '',
          [field]: perChannel,
        });
      }
    }
    onUpdate({ ...model, actuals: updatedActuals });
  };

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground min-w-[100px]">Month</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Fcst Spend</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Actual Spend</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Var</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Fcst Results</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Actual Results</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Var</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Fcst Revenue</th>
              <th className="text-right px-2 py-2.5 font-medium text-muted-foreground">Actual Revenue</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Var</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map(row => {
              const hasActual = row.actualSpend > 0 || row.actualResults > 0 || row.actualRevenue > 0;
              return (
                <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground">{formatMonth(row.month)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-foreground">{fmt(row.forecastSpend)}</td>
                  <td className="px-1 py-1">
                    <Input
                      type="number"
                      value={row.actualSpend || ''}
                      onChange={(e) => handleSummaryChange(row.month, 'actualSpend', parseFloat(e.target.value) || 0)}
                      className="h-7 text-right text-xs tabular-nums w-24 border-transparent hover:border-input focus:border-input bg-transparent"
                      placeholder="—"
                    />
                  </td>
                  <td className={`px-2 py-2 text-right tabular-nums font-medium ${hasActual ? varianceClass(row.spendVarPct, true) : 'text-muted-foreground'} ${hasActual ? varianceBg(row.spendVarPct, true) : ''}`}>
                    {hasActual ? `${row.spendVarPct > 0 ? '+' : ''}${row.spendVarPct}%` : '—'}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-foreground">{row.forecastResults}</td>
                  <td className="px-1 py-1">
                    <Input
                      type="number"
                      value={row.actualResults || ''}
                      onChange={(e) => handleSummaryChange(row.month, 'actualLeads', parseFloat(e.target.value) || 0)}
                      className="h-7 text-right text-xs tabular-nums w-20 border-transparent hover:border-input focus:border-input bg-transparent"
                      placeholder="—"
                    />
                  </td>
                  <td className={`px-2 py-2 text-right tabular-nums font-medium ${hasActual ? varianceClass(row.resultVarPct) : 'text-muted-foreground'} ${hasActual ? varianceBg(row.resultVarPct) : ''}`}>
                    {hasActual ? `${row.resultVarPct > 0 ? '+' : ''}${row.resultVarPct}%` : '—'}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-foreground">{fmt(row.forecastRevenue)}</td>
                  <td className="px-1 py-1">
                    <Input
                      type="number"
                      value={row.actualRevenue || ''}
                      onChange={(e) => handleSummaryChange(row.month, 'actualRevenue', parseFloat(e.target.value) || 0)}
                      className="h-7 text-right text-xs tabular-nums w-24 border-transparent hover:border-input focus:border-input bg-transparent"
                      placeholder="—"
                    />
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums font-medium ${hasActual ? varianceClass(row.revenueVarPct) : 'text-muted-foreground'} ${hasActual ? varianceBg(row.revenueVarPct) : ''}`}>
                    {hasActual ? `${row.revenueVarPct > 0 ? '+' : ''}${row.revenueVarPct}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === Detailed View: per-channel per-month (original) ===

function DetailedView({ model, scenario, months, onUpdate }: Props & { months: string[] }) {
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

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof rows> = {};
    for (const row of rows) {
      if (!groups[row.month]) groups[row.month] = [];
      groups[row.month].push(row);
    }
    return groups;
  }, [rows]);

  return (
    <>
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
    </>
  );
}

// === Main Component ===

export default function ForecastVsActual({ model, scenario, onUpdate }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model]);
  const [analysisStatus, setAnalysisStatus] = useState<AiActionStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<PerformanceAnalysisResult | null>(null);

  const rows = useMemo(() => toForecastVsActualRows(scenario, model.actuals, months, model.funnelType), [scenario, model.actuals, months, model.funnelType]);

  const handleAnalyze = async () => {
    setAnalysisStatus('loading');
    try {
      const monthData = months.map(month => {
        const monthRows = rows.filter(r => r.month === month);
        return {
          month,
          forecastSpend: monthRows.reduce((s, r) => s + r.forecastSpend, 0),
          actualSpend: monthRows.reduce((s, r) => s + r.actualSpend, 0),
          forecastResults: monthRows.reduce((s, r) => s + r.forecastResults, 0),
          actualResults: monthRows.reduce((s, r) => s + r.actualResults, 0),
          forecastRevenue: monthRows.reduce((s, r) => s + r.forecastRevenue, 0),
          actualRevenue: monthRows.reduce((s, r) => s + r.actualRevenue, 0),
        };
      });
      const result = await runPerformanceAnalysis({ months: monthData });
      setAnalysisResult(result);
      setAnalysisStatus('success');
    } catch {
      setAnalysisStatus('error');
    }
  };
        <h3 className="text-sm font-semibold text-foreground">Forecast vs Actual Performance</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Favorable</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive"></span> Unfavorable</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground"></span> No data</span>
          </div>
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                viewMode === 'summary' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                viewMode === 'detailed' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              By Channel
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <SummaryView model={model} scenario={scenario} months={months} onUpdate={onUpdate} />
      ) : (
        <DetailedView model={model} scenario={scenario} months={months} onUpdate={onUpdate} />
      )}
    </div>
  );
}
