/**
 * CompensationCard — structured detail view for a single compensation component.
 */
import { CircleDot, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CompensationComponent } from '@/types/economics';
import { COMP_TYPE_LABELS, REVENUE_CATEGORY_LABELS } from '@/types/economics';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </>
  );
}

interface Props {
  comp: CompensationComponent;
  onDelete: () => void;
}

export default function CompensationCard({ comp, onDelete }: Props) {
  const isShare = comp.componentType === 'revenue_share' || comp.componentType === 'profit_share';
  const isThreshold = comp.componentType === 'threshold_share';

  return (
    <div className="bg-background rounded-md border px-4 py-3 text-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <CircleDot className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{COMP_TYPE_LABELS[comp.componentType]}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {comp.isDefault ? 'Default' : 'Override'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 ml-5.5 text-xs">
            {comp.componentType === 'salary_allocation' && (
              <DetailRow label="Monthly Cost" value={`$${comp.amount.toLocaleString()}`} />
            )}
            {comp.componentType === 'flat_client_fee' && (
              <DetailRow label="Default Fee" value={`$${comp.amount.toLocaleString()}/mo`} />
            )}
            {comp.componentType === 'hourly' && (
              <DetailRow label="Hourly Rate" value={`$${comp.amount}/hr`} />
            )}
            {isShare && (
              <>
                <DetailRow label="Share %" value={`${((comp.sharePercent || 0) * 100).toFixed(0)}%`} />
                <DetailRow
                  label={comp.componentType === 'revenue_share' ? 'Revenue Category' : 'Profit Category'}
                  value={comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'Not set'}
                />
                {comp.capAmount != null && (
                  <DetailRow label="Cap" value={`$${comp.capAmount.toLocaleString()}`} />
                )}
              </>
            )}
            {isThreshold && (
              <>
                <DetailRow label="Share %" value={`${((comp.sharePercent || 0) * 100).toFixed(0)}%`} />
                <DetailRow label="Revenue Category" value={comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'Not set'} />
                <DetailRow label="Base Threshold" value={`$${(comp.thresholdAmount || 0).toLocaleString()}`} />
                {comp.capAmount != null && (
                  <DetailRow label="Cap" value={`$${comp.capAmount.toLocaleString()}`} />
                )}
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
