/**
 * EconomicsDefaultsPanel — global economics defaults editor.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { EconomicsDefaults } from '@/types/economics';
import { REVENUE_CATEGORY_LABELS, COMP_TYPE_LABELS } from '@/types/economics';

export default function EconomicsDefaultsPanel() {
  const [defaults, setDefaults] = useState<EconomicsDefaults>(() => repository.economicsDefaults.get());

  const handleSave = () => {
    repository.economicsDefaults.save(defaults);
    toast.success('Economics defaults saved');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Economics Defaults</h3>
        <p className="text-xs text-muted-foreground mb-4">Global settings for margin targets and economic modeling.</p>
      </div>

      <div className="panel p-5 space-y-4">
        <h4 className="text-sm font-medium">General</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Default Currency</Label>
            <Input value={defaults.currency} onChange={e => setDefaults(d => ({ ...d, currency: e.target.value }))} />
          </div>
          <div>
            <Label>Margin Target (%)</Label>
            <Input type="number" value={defaults.marginTarget} onChange={e => setDefaults(d => ({ ...d, marginTarget: Number(e.target.value) }))} />
          </div>
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <h4 className="text-sm font-medium">Active Revenue Categories</h4>
        <p className="text-xs text-muted-foreground">Service categories used for revenue tracking and share-based compensation.</p>
        <div className="flex flex-wrap gap-2">
          {defaults.defaultRevenueCategories.map(cat => (
            <Badge key={cat} variant="outline" className="text-xs">
              {REVENUE_CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <h4 className="text-sm font-medium">Compensation Types</h4>
        <p className="text-xs text-muted-foreground">Supported compensation component types for team cost modeling.</p>
        <div className="flex flex-wrap gap-2">
          {defaults.defaultCompensationCategories.map(comp => (
            <Badge key={comp} variant="outline" className="text-xs">
              {COMP_TYPE_LABELS[comp]}
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={handleSave}>Save Defaults</Button>
    </div>
  );
}
