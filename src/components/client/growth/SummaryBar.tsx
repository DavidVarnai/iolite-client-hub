import type { Rollups } from '@/types/growthModel';

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

interface Props {
  rollups: Rollups;
}

export default function SummaryBar({ rollups }: Props) {
  const items = [
    { label: 'Agency Fees', value: fmt(rollups.totalAgencyFees) },
    { label: 'Media Budget', value: fmt(rollups.totalMediaBudget) },
    { label: 'Total Investment', value: fmt(rollups.totalInvestment), highlight: true },
    { label: 'Forecast Revenue', value: fmt(rollups.forecastRevenue) },
    { label: 'Forecast CPA', value: fmt(rollups.forecastCpa) },
    { label: 'Actual Spend', value: fmt(rollups.actualSpend) },
    { label: 'Actual Revenue', value: fmt(rollups.actualRevenue) },
    { label: 'Variance', value: `${rollups.variance > 0 ? '+' : ''}${rollups.variance}%`, variance: rollups.variance },
  ];

  return (
    <div className="border-b bg-card px-6 py-3 flex items-center gap-6 overflow-x-auto sticky top-0 z-10">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col min-w-0">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            {item.label}
          </span>
          <span className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
            item.highlight ? 'text-primary' :
            item.variance !== undefined ? (item.variance > 0 ? 'text-emerald-600' : item.variance < 0 ? 'text-destructive' : 'text-foreground') :
            'text-foreground'
          }`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
