import { useMemo, useState } from 'react';
import type { GrowthModel, GrowthModelMode } from '@/types/growthModel';
import { calcRollups } from '@/lib/growthModelCalculations';
import { toChartData, toChannelAllocationData, filterClientVisible } from '@/lib/growthModelTransformers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Presentation, X } from 'lucide-react';
import AiActionButton from '@/components/ai/AiActionButton';
import AiResultPanel from '@/components/ai/AiResultPanel';
import { runSummaryWriter } from '@/lib/ai/aiActions';
import type { AiActionStatus, SummaryWriterResult, SummaryType } from '@/types/ai';

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
  const [presenting, setPresenting] = useState(false);

  const [summaryStatus, setSummaryStatus] = useState<AiActionStatus>('idle');
  const [summaryResult, setSummaryResult] = useState<SummaryWriterResult | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>('proposal');

  const handleGenerateSummary = async (type: SummaryType) => {
    setSummaryType(type);
    setSummaryStatus('loading');
    try {
      const result = await runSummaryWriter({
        summaryType: type,
        clientName: model.name,
        investmentTotal: rollups.totalInvestment,
        mediaTotal: rollups.totalMediaBudget,
        projectedRevenue: rollups.forecastRevenue,
      });
      setSummaryResult(result);
      setSummaryStatus('success');
    } catch {
      setSummaryStatus('error');
    }
  };

  // In presentation mode, always filter to client-visible data
  const displayModel = useMemo(() => {
    if (presenting || mode === 'planning') return filterClientVisible(model);
    return model;
  }, [model, mode, presenting]);

  const rollups = useMemo(() => calcRollups(displayModel), [displayModel]);
  const chartData = useMemo(() => toChartData(displayModel), [displayModel]);
  const scenario = displayModel.scenarios.find(s => s.isDefault) || displayModel.scenarios[0];
  const allocationData = useMemo(() => scenario ? toChannelAllocationData(scenario) : [], [scenario]);

  // Client-facing cards: hide internal cost breakdowns and margin in presentation mode
  const summaryCards = presenting ? [
    { label: 'Total Investment', value: fmt(rollups.totalInvestment), primary: true },
    { label: 'Forecast Revenue', value: fmt(rollups.forecastRevenue) },
    { label: 'Actual Spend', value: fmt(rollups.actualSpend) },
    { label: 'Actual Revenue', value: fmt(rollups.actualRevenue) },
    { label: 'Variance', value: `${rollups.variance > 0 ? '+' : ''}${rollups.variance}%`, variance: rollups.variance },
  ] : [
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

  // Presentation mode wrapper
  const containerClass = presenting
    ? 'fixed inset-0 z-50 bg-background overflow-auto'
    : '';
  const contentClass = presenting
    ? 'max-w-6xl mx-auto p-8 space-y-8'
    : 'p-6 space-y-6';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Presentation header */}
        <div className="flex items-center justify-between">
          {presenting ? (
            <>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{model.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Executive Summary</p>
              </div>
              <button
                onClick={() => setPresenting(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Exit Presentation
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <AiActionButton
                label="Generate Summary"
                status={summaryStatus}
                onClick={() => handleGenerateSummary(mode === 'operating' ? 'monthly_performance' : 'proposal')}
                variant="compact"
              />
              <button
                onClick={() => setPresenting(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Presentation className="h-3.5 w-3.5" />
                Present to Client
              </button>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className={`grid gap-3 ${presenting ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {summaryCards.map(card => (
            <div key={card.label} className="panel p-4 text-center">
              <p className={`font-medium text-muted-foreground uppercase tracking-wider mb-1 ${presenting ? 'text-xs' : 'text-[10px]'}`}>{card.label}</p>
              <p className={`font-semibold tabular-nums ${presenting ? 'text-2xl' : 'text-lg'} ${
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
              <CardTitle className={presenting ? 'text-sm' : 'text-xs'}>Investment vs Projected Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className={presenting ? 'h-[280px]' : 'h-[220px]'}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: presenting ? 11 : 10 }} />
                  <YAxis tick={{ fontSize: presenting ? 11 : 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
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
              <CardTitle className={presenting ? 'text-sm' : 'text-xs'}>Forecast vs Actual Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className={presenting ? 'h-[280px]' : 'h-[220px]'}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: presenting ? 11 : 10 }} />
                  <YAxis tick={{ fontSize: presenting ? 11 : 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="forecastLeads" stroke="var(--color-forecastLeads)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="actualLeads" stroke="var(--color-actualLeads)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* CPA Trend — hide in presentation mode (contains cost assumptions) */}
          {!presenting && (
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
          )}

          {/* Channel Allocation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={presenting ? 'text-sm' : 'text-xs'}>Channel Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={chartConfig} className={`w-full ${presenting ? 'h-[280px]' : 'h-[220px]'}`}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="budget"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={presenting ? 100 : 80}
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

          {/* Rolling ROI - show in presentation for a 5th chart */}
          {presenting && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Investment vs Actual Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="actualInvestment" fill="var(--color-actualInvestment)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="actualRevenue" fill="var(--color-actualRevenue)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Narratives — filter out internal in presentation mode */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'plan_summary', title: 'Plan Summary' },
            { key: 'performance_summary', title: 'Actual Performance Summary' },
            { key: 'variances', title: 'Key Variances' },
            { key: 'recommendations', title: 'Recommended Changes' },
          ].map(({ key, title }) => {
            const narrative = narratives.find(n => n.section === key);
            if (!narrative && presenting) return null;
            // In presentation mode, narratives are already filtered by filterClientVisible
            return (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${presenting ? 'text-sm' : 'text-xs'}`}>
                    {title}
                    {!presenting && narrative?.isInternal && <span className="internal-indicator text-[10px]">Internal</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground leading-relaxed ${presenting ? 'text-sm' : 'text-xs'}`}>
                    {narrative?.content || 'No content yet.'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
