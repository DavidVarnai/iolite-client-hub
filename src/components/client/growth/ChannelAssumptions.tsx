import { useMemo, useState } from 'react';
import type { GrowthModel, GrowthModelScenario, FunnelType, ChannelAssumption } from '@/types/growthModel';
import { calcFunnelOutputs } from '@/lib/growthModelCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

const FUNNEL_TYPES: { value: FunnelType; label: string }[] = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'lead_gen', label: 'Lead Gen' },
  { value: 'phone_calls', label: 'Phone Calls' },
  { value: 'hybrid', label: 'Hybrid' },
];

function InputField({ label, value, onChange, suffix }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-8 text-xs tabular-nums pr-8"
          step="any"
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

export default function ChannelAssumptions({ model, scenario, onUpdate }: Props) {
  const handleFunnelChange = (ft: FunnelType) => {
    onUpdate({ ...model, funnelType: ft });
  };

  const handleAssumptionChange = (channelId: string, field: keyof ChannelAssumption, value: number) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        channelAssumptions: s.channelAssumptions.map(ca =>
          ca.id === channelId ? { ...ca, [field]: value } : ca
        ),
      };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Funnel type selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-foreground">Funnel Model</label>
        <Select value={model.funnelType} onValueChange={(v) => handleFunnelChange(v as FunnelType)}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUNNEL_TYPES.map(ft => (
              <SelectItem key={ft.value} value={ft.value} className="text-xs">{ft.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Channel cards */}
      <div className="grid gap-4">
        {scenario.channelAssumptions.map(ca => {
          const mp = scenario.mediaChannelPlans.find(m => m.channel === ca.channel);
          const avgBudget = mp && mp.monthlyRecords.length > 0
            ? mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0) / mp.monthlyRecords.length : 0;
          const output = calcFunnelOutputs(ca, avgBudget, model.funnelType);

          return (
            <Card key={ca.id} className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{ca.channel}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Avg. monthly budget: ${avgBudget.toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input fields */}
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assumptions (Inputs)</h4>
                  <div className="grid grid-cols-5 gap-3">
                    <InputField label="CPM" value={ca.cpm} onChange={(v) => handleAssumptionChange(ca.id, 'cpm', v)} suffix="$" />
                    <InputField label="CTR" value={ca.ctr} onChange={(v) => handleAssumptionChange(ca.id, 'ctr', v)} suffix="%" />
                    <InputField label="CPC" value={ca.cpc} onChange={(v) => handleAssumptionChange(ca.id, 'cpc', v)} suffix="$" />
                    <InputField label="LP Conv Rate" value={ca.lpConvRate} onChange={(v) => handleAssumptionChange(ca.id, 'lpConvRate', v)} suffix="%" />
                    <InputField label="AOV / Deal" value={ca.aov} onChange={(v) => handleAssumptionChange(ca.id, 'aov', v)} suffix="$" />
                    {(model.funnelType === 'lead_gen' || model.funnelType === 'hybrid') && (
                      <>
                        <InputField label="Lead Conv" value={ca.leadConvRate} onChange={(v) => handleAssumptionChange(ca.id, 'leadConvRate', v)} suffix="%" />
                        <InputField label="Qual Rate" value={ca.qualRate} onChange={(v) => handleAssumptionChange(ca.id, 'qualRate', v)} suffix="%" />
                        <InputField label="Close Rate" value={ca.closeRate} onChange={(v) => handleAssumptionChange(ca.id, 'closeRate', v)} suffix="%" />
                      </>
                    )}
                    {(model.funnelType === 'phone_calls' || model.funnelType === 'hybrid') && (
                      <InputField label="Call Conv" value={ca.callConvRate} onChange={(v) => handleAssumptionChange(ca.id, 'callConvRate', v)} suffix="%" />
                    )}
                    <InputField label="Target CPL" value={ca.targetCpl} onChange={(v) => handleAssumptionChange(ca.id, 'targetCpl', v)} suffix="$" />
                    <InputField label="Target CPA" value={ca.targetCpa} onChange={(v) => handleAssumptionChange(ca.id, 'targetCpa', v)} suffix="$" />
                  </div>
                </div>

                {/* Calculated outputs */}
                <div className="border-t pt-3">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projected Monthly Output (Calculated)</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Impressions', value: fmt(output.impressions) },
                      { label: 'Clicks', value: fmt(output.clicks) },
                      ...(model.funnelType !== 'ecommerce' ? [{ label: 'Leads', value: fmt(output.leads) }] : []),
                      ...(model.funnelType === 'phone_calls' || model.funnelType === 'hybrid' ? [{ label: 'Calls', value: fmt(output.calls) }] : []),
                      ...(model.funnelType === 'lead_gen' || model.funnelType === 'hybrid' ? [
                        { label: 'MQLs', value: fmt(output.mqls) },
                        { label: 'SQLs', value: fmt(output.sqls) },
                      ] : []),
                      { label: 'Customers', value: fmt(output.customers) },
                      { label: 'Revenue', value: `$${fmt(output.revenue)}` },
                    ].map(item => (
                      <div key={item.label} className="bg-muted/50 rounded-md px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
