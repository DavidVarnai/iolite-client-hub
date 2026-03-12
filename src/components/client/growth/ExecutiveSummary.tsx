import { useMemo } from 'react';
import type { GrowthModel, GrowthModelMode } from '@/types/growthModel';
import { calcRollups, calcFunnelOutputs } from '@/lib/growthModelCalculations';
import { toChartData, toChannelAllocationData, filterClientVisible, generateMonths } from '@/lib/growthModelTransformers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface Props {
  model: GrowthModel;
  mode: GrowthModelMode;
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const COLORS = [
  'hsl(226, 89%, 63%)', 'hsl(142, 64%, 42%)', 'hsl(45, 96%, 50%)',
  'hsl(0, 84%, 60%)', 'hsl(280, 60%, 55%)', 'hsl(190, 70%, 45%)',
];

export default function ExecutiveSummary({ model, mode }: Props) {
  const displayModel = mode === 'planning' ? filterClientVisible(model) : model;
  const rollups = useMemo(() => calcRollups(displayModel), [displayModel]);
  const chartData = useMemo(() => toChartData(displayModel), [displayModel]);
  const scenario = displayModel.scenarios.find(s => s.isDefault) || displayModel.scenarios[0];
  const allocationData = useMemo(() => scenario ? toChannelAllocationData(scenario) : [], [scenario]);

  const summaryCards = [
    { label: 'Planned Agency Fees', value: fmt(rollups.totalAgencyFees) },
    { label: 'Planned Media Budget', value: fmt(rollups.totalMediaBudget) },
    { label: 'Total Investment', value: fmt(rollups.totalInvestment), primary: true },
    { label: 'Forecast Revenue', value: fmt(rollups.forecastRevenue) },
    { label: 'Forecast CPA', value: fmt(rollups.forecastCpa) },
    { label: 'Actual Spend', value: fmt(rollups.actualSpend) },
    { label: 'Actual Revenue', value: fmt(rollups.actualRevenue) },
    { label: 'Variance', value: `${rollups.variance > 0 ? '+' : ''}${rollups.variance}%`, variance: rollups.variance },
  ];

  const narratives = displayModel.narratives;

  const chartConfig = {
    forecastInvestment: { label: 'Forecast Investment', color: 'hsl(226, 89%, 63%)' },
    forecastRevenue: { label: 'Forecast Revenue', color: 'hsl(142, 64%, 42%)' },
    actualInvestment: { label: 'Actual Investment', color: 'hsl(226, 89%, 78%)' },
    actualRevenue: { label: 'Actual Revenue', color: 'hsl(142, 64%, 62%)' },
    forecastLeads: { label: 'Forecast Leads', color: 'hsl(226, 89%, 63%)' },
    actualLeads: { label: 'Actual Leads', color: 'hsl(142, 64%, 42%)' },
    forecastCpa: { label: 'Forecast CPA', color: 'hsl(226, 89%, 63%)' },
    actualCpa: { label: 'Actual CPA', color: 'hsl(0, 84%, 60%)' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="panel p-4 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-lg font-semibold tabular-nums ${
              card.primary ? 'text-primary' :
              card.variance !== undefined ? (card.variance > 0 ? 'text-emerald-600' : card.variance < 0 ? 'text-destructive' : 'text-foreground') :
              'text-foreground'
            }`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Investment vs Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Investment vs Projected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="forecastInvestment" fill="var(--color-forecastInvestment)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="forecastRevenue" fill="var(--color-forecastRevenue)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Forecast vs Actual Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Forecast vs Actual Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="forecastLeads" stroke="var(--color-forecastLeads)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actualLeads" stroke="var(--color-actualLeads)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* CPA Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">CPA Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="forecastCpa" stroke="var(--color-forecastCpa)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actualCpa" stroke="var(--color-actualCpa)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Channel Allocation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Channel Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="budget"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(0)}%`}
                >
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Narratives */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'plan_summary', title: 'Plan Summary' },
          { key: 'performance_summary', title: 'Actual Performance Summary' },
          { key: 'variances', title: 'Key Variances' },
          { key: 'recommendations', title: 'Recommended Changes' },
        ].map(({ key, title }) => {
          const narrative = narratives.find(n => n.section === key);
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  {title}
                  {narrative?.isInternal && <span className="internal-indicator text-[10px]">Internal</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {narrative?.content || 'No content yet.'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
