/**
 * ProposalGrowthModelPlaceholder — empty state when no growth model is connected.
 */
import { BarChart3 } from 'lucide-react';

export default function ProposalGrowthModelPlaceholder() {
  return (
    <div className="flex items-start gap-3 bg-muted/30 rounded-lg px-5 py-4">
      <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-sm font-medium text-foreground/80">Growth Model Not Connected</div>
        <div className="text-xs text-muted-foreground mt-1">
          Create a Growth Model for this client to auto-populate revenue projections, KPIs, and channel forecasts.
        </div>
      </div>
    </div>
  );
}
