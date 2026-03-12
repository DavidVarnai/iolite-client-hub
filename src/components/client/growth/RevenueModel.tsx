import { useMemo, useState } from 'react';
import type { GrowthModel, GrowthModelScenario, RevenueAssumption } from '@/types/growthModel';
import { calcFunnelOutputs, calcBreakEven, calcROM } from '@/lib/growthModelCalculations';
import { generateMonths, formatMonth } from '@/lib/growthModelTransformers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
}

function InputField({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input type="number" value={value || ''} readOnly className="h-8 text-xs tabular-nums pr-8 bg-muted/30" />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function RevenueModel({ model, scenario }: Props) {
  const months = useMemo(() => generateMonths(model.startMonth, model.monthCount), [model]);
  const ra = scenario.revenueAssumption;

  const projections = useMemo(() => {
    // Get monthly leads and spend totals from funnel
    return months.map(month => {
      let totalLeads = 0;
      let totalSpend = 0;

      for (const mp of scenario.mediaChannelPlans) {
        const rec = mp.monthlyRecords.find(r => r.month === month);
        const budget = rec?.plannedBudget || 0;
        totalSpend += budget;
        const ca = scenario.channelAssumptions.find(a => a.channel === mp.channel);
        if (ca) {
          const output = calcFunnelOutputs(ca, budget, model.funnelType);
          totalLeads += output.leads || output.customers;
        }
      }

      // Add agency + other costs
      for (const li of scenario.budgetLineItems) {
        const rec = li.monthlyRecords.find(r => r.month === month);
        totalSpend += rec?.plannedAmount || 0;
      }

      return { month, totalLeads, totalSpend };
    });
  }, [months, scenario, model.funnelType]);

  const revenueTable = useMemo(() => {
    let cumRevenue = 0;
    let cumSpend = 0;

    return projections.map((p, i) => {
      const lagIdx = Math.max(0, i - ra.salesCycleLag);
      const effectiveLeads = projections[lagIdx]?.totalLeads || 0;
      const customers = Math.round(effectiveLeads * (ra.closeRate / 100));
      const revenue = customers * ra.avgDealSize * ra.repeatMultiplier;
      cumRevenue += revenue;
      cumSpend += p.totalSpend;
      const margin = revenue * (ra.grossMarginPct / 100);
      const cac = customers > 0 ? cumSpend / customers : 0;
      const rom = calcROM(cumRevenue, cumSpend);

      return {
        month: p.month,
        leads: p.totalLeads,
        customers,
        revenue,
        cumRevenue,
        margin,
        cac,
        rom,
        spend: p.totalSpend,
      };
    });
  }, [projections, ra]);

  const totalRevenue = revenueTable.reduce((s, r) => s + r.revenue, 0);
  const totalSpend = revenueTable.reduce((s, r) => s + r.spend, 0);
  const totalMargin = totalRevenue * (ra.grossMarginPct / 100);
  const breakEven = calcBreakEven(totalSpend, totalRevenue / model.monthCount);
  const finalRom = calcROM(totalRevenue, totalSpend);

  return (
    <div className="p-6 space-y-6">
      {/* Assumptions display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Revenue Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <InputField label="Avg Deal Size" value={ra.avgDealSize} suffix="$" />
            <InputField label="Close Rate" value={ra.closeRate} suffix="%" />
            <InputField label="Sales Cycle Lag" value={ra.salesCycleLag} suffix="mo" />
            <InputField label="Repeat Multiplier" value={ra.repeatMultiplier} suffix="x" />
            <InputField label="Gross Margin" value={ra.grossMarginPct} suffix="%" />
            <InputField label="Attribution Window" value={ra.attributionWindow} suffix="d" />
            <InputField label="Lead-to-Sale Delay" value={ra.leadToSaleDelay} suffix="d" />
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Forecast Revenue', value: fmt(totalRevenue), primary: true },
          { label: 'Gross Margin', value: fmt(totalMargin) },
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
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Leads</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Customers</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Revenue</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Cumulative</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Margin</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">CAC</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">ROM</th>
              </tr>
            </thead>
            <tbody>
              {revenueTable.map(row => (
                <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground">{formatMonth(row.month)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.leads}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.customers}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.revenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.cumRevenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.margin)}</td>
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
